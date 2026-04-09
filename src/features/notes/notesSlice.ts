import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { Note } from "../../types/note";
import {
  fetchNotesFromFirestore,
  createNoteInFirestore,
  updateNoteInFirestore,
  deleteNoteFromFirestore,
} from "../../services/noteService";
import type { RootState } from "../../app/store";

interface NoteState {
  notes: Note[];
  loading: boolean;
  error: string | null;
}

const initialState: NoteState = {
  notes: [],
  loading: false,
  error: null,
};

/** Helper to get UID or reject */
const getUid = (thunkAPI: { getState: () => RootState; rejectWithValue: (v: string) => unknown }) => {
  const uid = thunkAPI.getState().auth.user?.uid;
  if (!uid) return thunkAPI.rejectWithValue("User not authenticated") as never;
  return uid;
};

export const fetchNotes = createAsyncThunk<Note[], void, { state: RootState }>(
  "notes/fetchAll",
  async (_, thunkAPI) => {
    try {
      const uid = getUid(thunkAPI);
      return await fetchNotesFromFirestore(uid);
    } catch (error: unknown) {
      return thunkAPI.rejectWithValue(error instanceof Error ? error.message : "Failed to fetch notes");
    }
  }
);

export const createNote = createAsyncThunk<
  Note,
  { title: string; content: string; tags: string[]; isPinned: boolean },
  { state: RootState }
>("notes/create", async (noteData, thunkAPI) => {
  try {
    const uid = getUid(thunkAPI);
    return await createNoteInFirestore(uid, noteData);
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(error instanceof Error ? error.message : "Failed to create note");
  }
});

export const updateNote = createAsyncThunk<
  { id: string; updates: Partial<Note> },
  { id: string; updates: Partial<Note> },
  { state: RootState }
>("notes/update", async ({ id, updates }, thunkAPI) => {
  try {
    const uid = getUid(thunkAPI);
    await updateNoteInFirestore(uid, id, updates);
    return { id, updates };
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(error instanceof Error ? error.message : "Failed to update note");
  }
});

export const deleteNote = createAsyncThunk<string, string, { state: RootState }>(
  "notes/delete",
  async (noteId, thunkAPI) => {
    try {
      const uid = getUid(thunkAPI);
      await deleteNoteFromFirestore(uid, noteId);
      return noteId;
    } catch (error: unknown) {
      return thunkAPI.rejectWithValue(error instanceof Error ? error.message : "Failed to delete note");
    }
  }
);

const notesSlice = createSlice({
  name: "notes",
  initialState,
  reducers: {
    clearNotesError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchNotes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotes.fulfilled, (state, action) => {
        state.loading = false;
        state.notes = action.payload;
      })
      .addCase(fetchNotes.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to fetch notes";
      })

      // Create
      .addCase(createNote.fulfilled, (state, action) => {
        // Pinned notes go to top, then sort by updatedAt
        if (action.payload.isPinned) {
          state.notes.unshift(action.payload);
        } else {
          const firstUnpinnedIdx = state.notes.findIndex((n) => !n.isPinned);
          if (firstUnpinnedIdx === -1) {
            state.notes.push(action.payload);
          } else {
            state.notes.splice(firstUnpinnedIdx, 0, action.payload);
          }
        }
      })
      .addCase(createNote.rejected, (state, action) => {
        state.error = (action.payload as string) || "Failed to create note";
      })

      // Update
      .addCase(updateNote.fulfilled, (state, action) => {
        const { id, updates } = action.payload;
        const idx = state.notes.findIndex((n) => n.id === id);
        if (idx !== -1) {
          state.notes[idx] = { ...state.notes[idx], ...updates, updatedAt: new Date().toISOString() };
        }
      })
      .addCase(updateNote.rejected, (state, action) => {
        state.error = (action.payload as string) || "Failed to update note";
      })

      // Delete
      .addCase(deleteNote.fulfilled, (state, action) => {
        state.notes = state.notes.filter((n) => n.id !== action.payload);
      })
      .addCase(deleteNote.rejected, (state, action) => {
        state.error = (action.payload as string) || "Failed to delete note";
      });
  },
});

export const { clearNotesError } = notesSlice.actions;
export default notesSlice.reducer;

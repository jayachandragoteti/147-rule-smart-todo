import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  doc, 
  updateDoc, 
  deleteDoc,
  orderBy
} from "firebase/firestore";
import { db } from "../../services/firebase/firebase";
import type { JournalEntry, CreateJournalFormValues } from "../../types";

/**
 * FIXED: Journal entries are now stored in users/{uid}/journals
 * instead of a flat top-level 'journals' collection.
 * This is a security fix — previously all user journals were accessible
 * in the same collection with only a userId field.
 */

interface JournalState {
  entries: JournalEntry[];
  loading: boolean;
  error: string | null;
}

const initialState: JournalState = {
  entries: [],
  loading: false,
  error: null,
};

// Helper: get user-scoped journal collection reference
const getUserJournalsRef = (userId: string) =>
  collection(db, "users", userId, "journals");

export const fetchJournalEntries = createAsyncThunk(
  "journal/fetchAll",
  async (userId: string, { rejectWithValue }) => {
    try {
      const q = query(
        getUserJournalsRef(userId),
        orderBy("date", "desc")
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as JournalEntry[];
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to fetch diary entries";
      return rejectWithValue(message);
    }
  }
);

export const addJournalEntry = createAsyncThunk(
  "journal/add",
  async ({ userId, data }: { userId: string; data: CreateJournalFormValues }, { rejectWithValue }) => {
    try {
      const now = new Date().toISOString();
      const entryData = {
        ...data,
        userId,
        createdAt: now,
        updatedAt: now,
      };
      const docRef = await addDoc(getUserJournalsRef(userId), entryData);
      return {
        id: docRef.id,
        ...entryData,
      } as JournalEntry;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to save diary entry";
      return rejectWithValue(message);
    }
  }
);

export const updateJournalEntry = createAsyncThunk(
  "journal/update",
  async (
    { id, userId, data }: { id: string; userId: string; data: Partial<CreateJournalFormValues> },
    { rejectWithValue }
  ) => {
    try {
      const docRef = doc(db, "users", userId, "journals", id);
      const updateData = {
        ...data,
        updatedAt: new Date().toISOString(),
      };
      await updateDoc(docRef, updateData);
      return { id, ...updateData };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to update diary entry";
      return rejectWithValue(message);
    }
  }
);

export const deleteJournalEntry = createAsyncThunk(
  "journal/delete",
  async ({ id, userId }: { id: string; userId: string }, { rejectWithValue }) => {
    try {
      const docRef = doc(db, "users", userId, "journals", id);
      await deleteDoc(docRef);
      return id;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to delete diary entry";
      return rejectWithValue(message);
    }
  }
);

const journalSlice = createSlice({
  name: "journal",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchJournalEntries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJournalEntries.fulfilled, (state, action) => {
        state.loading = false;
        state.entries = action.payload;
      })
      .addCase(fetchJournalEntries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || "Failed to fetch diary entries";
      })
      // Add
      .addCase(addJournalEntry.fulfilled, (state, action) => {
        state.entries.unshift(action.payload);
      })
      // Update
      .addCase(updateJournalEntry.fulfilled, (state, action) => {
        const { id, ...updates } = action.payload;
        const index = state.entries.findIndex((e) => e.id === id);
        if (index !== -1) {
          state.entries[index] = { ...state.entries[index], ...updates } as JournalEntry;
        }
      })
      // Delete
      .addCase(deleteJournalEntry.fulfilled, (state, action) => {
        state.entries = state.entries.filter((e) => e.id !== action.payload);
      });
  },
});

export default journalSlice.reducer;

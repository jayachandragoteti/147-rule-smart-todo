import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  doc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp,
  orderBy
} from "firebase/firestore";
import { db } from "../../services/firebase/firebaseConfig";
import { JournalEntry, CreateJournalFormValues } from "../../types";

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

export const fetchJournalEntries = createAsyncThunk(
  "journal/fetchAll",
  async (userId: string) => {
    const q = query(
      collection(db, "journals"),
      where("userId", "==", userId),
      orderBy("date", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as JournalEntry[];
  }
);

export const addJournalEntry = createAsyncThunk(
  "journal/add",
  async ({ userId, data }: { userId: string; data: CreateJournalFormValues }) => {
    const docRef = await addDoc(collection(db, "journals"), {
      ...data,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      serverTimestamp: serverTimestamp(),
    });
    return {
      id: docRef.id,
      ...data,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as JournalEntry;
  }
);

export const updateJournalEntry = createAsyncThunk(
  "journal/update",
  async ({ id, data }: { id: string; data: Partial<CreateJournalFormValues> }) => {
    const docRef = doc(db, "journals", id);
    const updateData = {
      ...data,
      updatedAt: new Date().toISOString(),
    };
    await updateDoc(docRef, updateData);
    return { id, ...updateData };
  }
);

const journalSlice = createSlice({
  name: "journal",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchJournalEntries.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchJournalEntries.fulfilled, (state, action) => {
        state.loading = false;
        state.entries = action.payload;
      })
      .addCase(fetchJournalEntries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch journal entries";
      })
      .addCase(addJournalEntry.fulfilled, (state, action) => {
        state.entries.unshift(action.payload);
      })
      .addCase(updateJournalEntry.fulfilled, (state, action) => {
        const index = state.entries.findIndex((e) => e.id === action.payload.id);
        if (index !== -1) {
          state.entries[index] = { ...state.entries[index], ...action.payload };
        }
      });
  },
});

export default journalSlice.reducer;

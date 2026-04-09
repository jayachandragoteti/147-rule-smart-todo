import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";
import type { Note } from "../types/note";
import { db } from "./firebase/firebase";

type NewNote = Omit<Note, "id">;

const getUserNotesRef = (uid: string) => collection(db, "users", uid, "notes");

export const fetchNotesFromFirestore = async (uid: string): Promise<Note[]> => {
  const q = query(getUserNotesRef(uid), orderBy("isPinned", "desc"), orderBy("updatedAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Note));
};

export const createNoteInFirestore = async (uid: string, note: Omit<NewNote, "createdAt" | "updatedAt">): Promise<Note> => {
  const now = new Date().toISOString();
  const data: Omit<Note, "id"> = { ...note, createdAt: now, updatedAt: now };
  const docRef = await addDoc(getUserNotesRef(uid), data);
  return { id: docRef.id, ...data };
};

export const updateNoteInFirestore = async (uid: string, id: string, updates: Partial<Note>): Promise<void> => {
  const docRef = doc(db, "users", uid, "notes", id);
  await updateDoc(docRef, { ...updates, updatedAt: new Date().toISOString() });
};

export const deleteNoteFromFirestore = async (uid: string, id: string): Promise<void> => {
  await deleteDoc(doc(db, "users", uid, "notes", id));
};

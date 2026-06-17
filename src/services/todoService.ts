import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  query,
  orderBy,
  limit as fbLimit,
  startAfter as fbStartAfter,
} from "firebase/firestore";
import type { Todo, PartialTodoUpdate } from "../types/todo";
import { db } from "./firebase/firebase";

type NewTodo = Omit<Todo, "id" | "createdAt">;

export const fetchTodosFromFirestore = async (
  uid: string,
  options?: { limit?: number; startAfterId?: string }
): Promise<Todo[]> => {
  const todosRef = collection(db, "users", uid, "todos");
  const clauses: any[] = [orderBy("createdAt", "desc")];
  if (options?.limit) clauses.push(fbLimit(options.limit));

  let q;
  if (options?.startAfterId) {
    // Resolve the document to start after
    const startDocRef = doc(db, "users", uid, "todos", options.startAfterId);
    const startSnap = await getDoc(startDocRef);
    if (startSnap.exists()) {
      q = query(todosRef, ...clauses, fbStartAfter(startSnap));
    } else {
      q = query(todosRef, ...clauses);
    }
  } else {
    q = query(todosRef, ...clauses);
  }

  const querySnapshot = await getDocs(q);
  const todos: Todo[] = [];
  querySnapshot.forEach((docSnap) => {
    todos.push({
      id: docSnap.id,
      ...(docSnap.data() as Omit<Todo, "id">),
    } as Todo);
  });
  return todos;
};

export const createTodoInFirestore = async (
  uid: string,
  todo: NewTodo
): Promise<Todo> => {
  const todosRef = collection(db, "users", uid, "todos");
  const createdAt = new Date().toISOString();
  const docRef = await addDoc(todosRef, {
    ...todo,
    createdAt,
  });
  return {
    id: docRef.id,
    ...todo,
    createdAt,
  };
};

export const updateTodoInFirestore = async (
  uid: string,
  id: string,
  updates: PartialTodoUpdate
): Promise<Todo> => {
  const docRef = doc(db, "users", uid, "todos", id);
  await updateDoc(docRef, updates as Record<string, unknown>);

  // Return the latest document
  const snap = await getDoc(docRef);
  if (!snap.exists()) {
    throw new Error("Todo not found");
  }

  const data = snap.data() as Record<string, unknown>;
  const { id: _docId, ...rest } = data;
  return {
    id: snap.id,
    ...(rest as Omit<Todo, "id">),
  };
};

export const deleteTodoFromFirestore = async (
  uid: string,
  id: string
): Promise<void> => {
  const docRef = doc(db, "users", uid, "todos", id);
  await deleteDoc(docRef);
};
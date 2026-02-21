import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import type { Todo } from "../../types/todo";
import { db } from "./firebase";

type NewTodo = Omit<Todo, "id" | "createdAt">;

export const fetchTodosFromFirestore = async (
  uid: string
): Promise<Todo[]> => {
  const todosRef = collection(db, "users", uid, "todos");
  const querySnapshot = await getDocs(todosRef);
  const todos: Todo[] = [];
  querySnapshot.forEach((doc) => {
    todos.push({
      id: doc.id,
      ...doc.data(),
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
  updates: Partial<NewTodo & { status?: string; apply147Rule?: boolean }>
): Promise<Todo> => {
  const docRef = doc(db, "users", uid, "todos", id);
  await updateDoc(docRef, updates as any);

  // return the latest document
  const snap = await getDoc(docRef);
  if (!snap.exists()) {
    throw new Error("Todo not found");
  }

  const data = snap.data() as any;
  // ensure we don't accidentally overwrite id if it's present in document data
  const { id: _docId, ...rest } = data;
  return {
    id: snap.id,
    ...(rest as Omit<Todo, "id">),
  };
};
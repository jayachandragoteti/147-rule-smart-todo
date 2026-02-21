import {
  collection,
  addDoc,
  getDocs,
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
import { createAsyncThunk } from "@reduxjs/toolkit";
import type { Todo } from "../../types/todo";
import {
  createTodoInFirestore,
  fetchTodosFromFirestore,
  updateTodoInFirestore,
  deleteTodoFromFirestore,
} from "../../services/firebase/todoService";
import { generate147Dates } from "../../utils/rule147";
import type { RootState } from "../../app/store";

type NewTodo = Omit<Todo, "id" | "createdAt">;

/** Helper to get the authenticated user's UID or reject */
const getUidOrReject = (
  thunkAPI: { getState: () => RootState; rejectWithValue: (v: string) => unknown }
) => {
  const uid = thunkAPI.getState().auth.user?.uid;
  if (!uid) {
    return thunkAPI.rejectWithValue("User not authenticated") as never;
  }
  return uid;
};

export const fetchTodos = createAsyncThunk<
  Todo[],
  void,
  { state: RootState }
>("todo/fetchTodos", async (_, thunkAPI) => {
  try {
    const uid = getUidOrReject(thunkAPI);
    return await fetchTodosFromFirestore(uid);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch todos";
    return thunkAPI.rejectWithValue(message);
  }
});

export const createTodo = createAsyncThunk<
  Todo[],
  NewTodo,
  { state: RootState }
>("todo/createTodo", async (todoData, thunkAPI) => {
  try {
    const uid = getUidOrReject(thunkAPI);

    const todosToCreate: NewTodo[] = [];
    const baseDate = new Date(todoData.scheduledDate);
    const baseISODate = baseDate.toISOString();

    if (todoData.apply147Rule) {
      const seriesDates = generate147Dates(baseDate);
      todosToCreate.push({
        ...todoData,
        scheduledDate: baseISODate,
        seriesDates,
      });
    } else {
      todosToCreate.push({
        ...todoData,
        scheduledDate: baseISODate,
      });
    }

    const savedTodos: Todo[] = [];
    for (const todo of todosToCreate) {
      const saved = await createTodoInFirestore(uid, todo);
      savedTodos.push(saved);
    }

    return savedTodos;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create todo";
    return thunkAPI.rejectWithValue(message);
  }
});

export const updateTodo = createAsyncThunk<
  Todo,
  { id: string; updates: Partial<NewTodo & { status?: string; apply147Rule?: boolean }> },
  { state: RootState }
>("todo/updateTodo", async ({ id, updates }, thunkAPI) => {
  try {
    const uid = getUidOrReject(thunkAPI);
    return await updateTodoInFirestore(uid, id, updates);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update todo";
    return thunkAPI.rejectWithValue(message);
  }
});

export const deleteTodo = createAsyncThunk<
  string,
  string,
  { state: RootState }
>("todo/deleteTodo", async (todoId, thunkAPI) => {
  try {
    const uid = getUidOrReject(thunkAPI);
    await deleteTodoFromFirestore(uid, todoId);
    return todoId;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete todo";
    return thunkAPI.rejectWithValue(message);
  }
});
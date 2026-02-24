import { createAsyncThunk } from "@reduxjs/toolkit";
import type { Todo } from "../../types/todo";
import { createTodoInFirestore, fetchTodosFromFirestore } from "../../services/firebase/todoService";
import { updateTodoInFirestore } from "../../services/firebase/todoService";
import type { RootState } from "../../app/store";

type NewTodo = Omit<Todo, "id" | "createdAt">;

export const fetchTodos = createAsyncThunk<
  Todo[],
  void,
  { state: RootState }
>("todo/fetchTodos", async (_, thunkAPI) => {
  try {
    const state = thunkAPI.getState();
    const uid = state.auth.user?.uid;

    if (!uid) {
      throw new Error("User not authenticated");
    }

    const todos = await fetchTodosFromFirestore(uid);
    return todos;
  } catch (error: any) {
    console.error("Error fetching todos:", error.message);
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const createTodo = createAsyncThunk<
  Todo[],
  NewTodo,
  { state: RootState }
>("todo/createTodo", async (todoData, thunkAPI) => {
  try {
    const state = thunkAPI.getState();
    const uid = state.auth.user?.uid;

    if (!uid) {
      throw new Error("User not authenticated");
    }
    const todosToCreate: NewTodo[] = [];
    const baseDate = new Date(todoData.scheduledDate);
    const baseISODate = baseDate.toISOString();
    // If applying 147 rule, create a single document that stores all series dates
    if (todoData.apply147Rule) {
      const day4 = new Date(baseDate);
      day4.setDate(baseDate.getDate() + 4);
      const day7 = new Date(baseDate);
      day7.setDate(baseDate.getDate() + 7);
      todosToCreate.push({
        ...todoData,
        scheduledDate: baseISODate,
        seriesDates: [baseISODate, day4.toISOString(), day7.toISOString()],
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
  } catch (error: any) {
    console.error("Error creating todo:", error.message);
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const updateTodo = createAsyncThunk<
  Todo,
  { id: string; updates: Partial<NewTodo & { status?: string; apply147Rule?: boolean }> },
  { state: RootState }
>("todo/updateTodo", async ({ id, updates }, thunkAPI) => {
  try {
    const state = thunkAPI.getState();
    const uid = state.auth.user?.uid;

    if (!uid) {
      throw new Error("User not authenticated");
    }

    const updated = await updateTodoInFirestore(uid, id, updates);
    return updated;
  } catch (error: any) {
    console.error("Error updating todo:", error.message);
    return thunkAPI.rejectWithValue(error.message);
  }
});
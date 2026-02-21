import { createSlice } from "@reduxjs/toolkit";
import type { Todo } from "../../types/todo";
import { createTodo, fetchTodos, updateTodo } from "./todoThunks";

interface TodoState {
  todos: Todo[];
  loading: boolean;
  error: string | null;
}

const initialState: TodoState = {
  todos: [],
  loading: false,
  error: null,
};

export const todoSlice = createSlice({
  name: "todo",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch todos
      .addCase(fetchTodos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTodos.fulfilled, (state, action) => {
        state.loading = false;
        state.todos = action.payload;
      })
      .addCase(fetchTodos.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || "Failed to fetch todos";
      })
      // Create todo
      .addCase(createTodo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTodo.fulfilled, (state, action) => {
        state.loading = false;
        state.todos.push(...action.payload);
      })
      .addCase(createTodo.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || "Failed to create todo";
      });
      // Update todo
      builder
        .addCase(updateTodo.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(updateTodo.fulfilled, (state, action) => {
          state.loading = false;
          // replace the updated todo in state
          state.todos = state.todos.map((t) =>
            t.id === action.payload.id ? action.payload : t
          );
        })
        .addCase(updateTodo.rejected, (state, action) => {
          state.loading = false;
          state.error = (action.payload as string) || "Failed to update todo";
        });
  },
});

export default todoSlice.reducer;
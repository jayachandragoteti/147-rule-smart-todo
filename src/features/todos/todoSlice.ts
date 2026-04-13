import { createSlice } from "@reduxjs/toolkit";
import type { Todo } from "../../types/todo";
import { createTodo, deleteTodo, fetchTodos, updateTodo, completeTodo, toggleSubtaskStatus } from "./todoThunks";

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
  reducers: {
    clearTodoError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Fetch todos ──
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

      // ── Create todo ──
      .addCase(createTodo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTodo.fulfilled, (state, action) => {
        state.loading = false;
        state.todos.unshift(...action.payload);
      })
      .addCase(createTodo.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || "Failed to create todo";
      })

      // ── Update todo ──
      .addCase(updateTodo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTodo.fulfilled, (state, action) => {
        state.loading = false;
        state.todos = state.todos.map((t) =>
          t.id === action.payload.id ? action.payload : t
        );
      })
      .addCase(updateTodo.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to update todo";
      })

      // ── Complete todo ──
      .addCase(completeTodo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(completeTodo.fulfilled, (state, action) => {
        state.loading = false;
        state.todos = state.todos.map((t) =>
          t.id === action.payload.id ? action.payload : t
        );
      })
      .addCase(completeTodo.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to complete todo";
      })

      // ── Toggle subtask status ──
      .addCase(toggleSubtaskStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleSubtaskStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.todos = state.todos.map((t) =>
          t.id === action.payload.id ? action.payload : t
        );
      })
      .addCase(toggleSubtaskStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to toggle subtask status";
      })

      // ── Delete todo ──
      .addCase(deleteTodo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTodo.fulfilled, (state, action) => {
        state.loading = false;
        state.todos = state.todos.filter((t) => t.id !== action.payload);
      })
      .addCase(deleteTodo.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to delete todo";
      });
  },
});

export const { clearTodoError } = todoSlice.actions;
export default todoSlice.reducer;
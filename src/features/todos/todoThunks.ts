import { createAsyncThunk } from "@reduxjs/toolkit";
import type { Todo } from "../../types/todo";
import {
  createTodoInFirestore,
  fetchTodosFromFirestore,
  updateTodoInFirestore,
  deleteTodoFromFirestore,
} from "../../services/todoService";
import { generate137Dates, getNextSeriesDate } from "../../utils/rule137";
import { getNextRecurrenceDate } from "../../utils/dateUtils";
import { TODO_STATUS } from "../../utils/todoConstants";
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

    if (todoData.apply137Rule) {
      const seriesDates = generate137Dates(baseDate);
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
  { id: string; updates: Partial<NewTodo & { status?: string; apply137Rule?: boolean }> },
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

export const completeTodo = createAsyncThunk<
  Todo,
  string,
  { state: RootState }
>("todo/completeTodo", async (todoId, thunkAPI) => {
  try {
    const uid = getUidOrReject(thunkAPI);
    const state = thunkAPI.getState() as RootState;
    const todo = state.todo.todos.find(t => t.id === todoId);
    
    if (!todo) throw new Error("Todo not found");

    const updates: any = {};

    // 1. Handle 1-3-7 Rule Series
    if (todo.apply137Rule && todo.seriesDates && todo.seriesDates.length > 0) {
      const nextDate = getNextSeriesDate(todo.seriesDates, todo.scheduledDate);
      if (nextDate) {
        updates.scheduledDate = nextDate;
        updates.status = TODO_STATUS.PENDING;
        return await updateTodoInFirestore(uid, todoId, updates);
      }
      // If series finished, complete it
      updates.status = TODO_STATUS.COMPLETED;
      updates.apply137Rule = false;
    } 
    // 2. Handle Recurrence (Daily, Weekly, Monthly)
    else if (todo.recurrence && todo.recurrence !== "none") {
      const nextDate = getNextRecurrenceDate(todo.scheduledDate, todo.recurrence as any);
      updates.scheduledDate = nextDate;
      updates.status = TODO_STATUS.PENDING;
      return await updateTodoInFirestore(uid, todoId, updates);
    } 
    // 3. Normal Completion
    else {
      updates.status = TODO_STATUS.COMPLETED;
    }
    
    // 4. Handle subtasks (mark all as completed)
    if (todo.subtasks && todo.subtasks.length > 0) {
      const updatedSubtasks = todo.subtasks.map(st => ({ ...st, completed: true }));
      updates.subtasks = updatedSubtasks;
    }

    return await updateTodoInFirestore(uid, todoId, updates);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to complete todo";
    return thunkAPI.rejectWithValue(message);
  }
});

export const toggleSubtaskStatus = createAsyncThunk<
  Todo,
  { todoId: string; subtaskId: string },
  { state: RootState }
>("todo/toggleSubtaskStatus", async ({ todoId, subtaskId }, thunkAPI) => {
  try {
    const uid = getUidOrReject(thunkAPI);
    const state = thunkAPI.getState() as RootState;
    const todo = state.todo.todos.find(t => t.id === todoId);
    
    if (!todo) throw new Error("Todo not found");

    const subtasks = todo.subtasks || [];
    const updatedSubtasks = subtasks.map(st => 
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );

    const allSubtasksCompleted = updatedSubtasks.length > 0 && updatedSubtasks.every(st => st.completed);
    const anySubtaskUnchecked = updatedSubtasks.some(st => !st.completed);

    const updates: any = { subtasks: updatedSubtasks };

    if (allSubtasksCompleted && todo.status !== TODO_STATUS.COMPLETED) {
       // Re-use complete logic
       if (todo.apply137Rule && todo.seriesDates && todo.seriesDates.length > 0) {
         const nextDate = getNextSeriesDate(todo.seriesDates, todo.scheduledDate);
         if (nextDate) {
           updates.scheduledDate = nextDate;
           updates.status = TODO_STATUS.PENDING;
         } else {
           updates.status = TODO_STATUS.COMPLETED;
           updates.apply137Rule = false;
         }
       } else if (todo.recurrence && todo.recurrence !== "none") {
         const nextDate = getNextRecurrenceDate(todo.scheduledDate, todo.recurrence as any);
         updates.scheduledDate = nextDate;
         updates.status = TODO_STATUS.PENDING;
       } else {
         updates.status = TODO_STATUS.COMPLETED;
       }
    } else if (anySubtaskUnchecked && todo.status === TODO_STATUS.COMPLETED) {
       updates.status = TODO_STATUS.PENDING;
    }

    return await updateTodoInFirestore(uid, todoId, updates);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to toggle subtask";
    return thunkAPI.rejectWithValue(message);
  }
});
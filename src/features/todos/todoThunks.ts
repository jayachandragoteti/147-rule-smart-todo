import { createAsyncThunk } from "@reduxjs/toolkit";
import type { Todo, PartialTodoUpdate, TodoStatus } from "../../types/todo";
import {
  createTodoInFirestore,
  fetchTodosFromFirestore,
  updateTodoInFirestore,
  deleteTodoFromFirestore,
} from "../../services/todoService";
import {
  generate137Dates,
  getNextValidSeriesDate,
} from "../../utils/rule137";
import { getParentTodoStatusFromSubtasks, shouldAutoCompleteTask } from "./subtaskStatus";
import {
  getNextValidRecurrenceDate,
  isPastDate,
  isTodayDate,
} from "../../utils/dateUtils";
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

const isTodoDueToday = (todo: Todo): boolean => {
  if (todo.seriesDates?.length) {
    return todo.seriesDates.some((date) => isTodayDate(date));
  }
  return isTodayDate(todo.scheduledDate);
};

const appendHistoryEntry = (todo: Todo, status: TodoStatus, scheduledDate: string): PartialTodoUpdate => {
  const history = [...(todo.history ?? [])];
  history.push({
    completedAt: new Date().toISOString(),
    status,
    scheduledDate,
  });

  return {
    history: history.slice(-20),
    completedAt: new Date().toISOString(),
  };
};

export const buildNextRecurringOccurrenceUpdate = (
  todo: Todo,
  nextDate: string
): PartialTodoUpdate => {
  const resetSubtasks = (todo.subtasks ?? []).map((subtask) => ({
    ...subtask,
    completed: false,
  }));

  return {
    scheduledDate: nextDate,
    status: TODO_STATUS.PENDING,
    subtasks: resetSubtasks,
  };
};

const getRecurringCompletionUpdate = (todo: Todo): PartialTodoUpdate => {
  if (todo.apply137Rule && todo.seriesDates && todo.seriesDates.length > 0) {
    if (isTodoDueToday(todo)) {
      return {
        status: TODO_STATUS.COMPLETED,
        ...appendHistoryEntry(todo, TODO_STATUS.COMPLETED, todo.scheduledDate),
      };
    }
    const nextDate = getNextValidSeriesDate(todo.seriesDates, todo.scheduledDate);
    if (nextDate) {
      return buildNextRecurringOccurrenceUpdate(todo, nextDate);
    }
    return {
      status: TODO_STATUS.COMPLETED,
      apply137Rule: false,
      ...appendHistoryEntry(todo, TODO_STATUS.COMPLETED, todo.scheduledDate),
    };
  }

  if (todo.recurrence && todo.recurrence !== "none") {
    if (isTodoDueToday(todo)) {
      return {
        status: TODO_STATUS.COMPLETED,
        ...appendHistoryEntry(todo, TODO_STATUS.COMPLETED, todo.scheduledDate),
      };
    }
    const nextDate = getNextValidRecurrenceDate(
      todo.scheduledDate,
      todo.recurrence as any,
      todo.weeklyDays
    );
    return buildNextRecurringOccurrenceUpdate(todo, nextDate);
  }

  return {
    status: TODO_STATUS.COMPLETED,
    ...appendHistoryEntry(todo, TODO_STATUS.COMPLETED, todo.scheduledDate),
  };
};

const normalizeCompletedRecurringTodo = async (
  uid: string,
  todo: Todo
): Promise<Todo> => {
  if (todo.status === TODO_STATUS.IN_PROGRESS && shouldAutoCompleteTask(todo)) {
    return await updateTodoInFirestore(uid, todo.id, {
      status: TODO_STATUS.COMPLETED,
      ...appendHistoryEntry(todo, TODO_STATUS.COMPLETED, todo.scheduledDate),
    });
  }

  if (todo.status !== TODO_STATUS.COMPLETED || isTodoDueToday(todo)) {
    return todo;
  }

  if (todo.apply137Rule && todo.seriesDates && todo.seriesDates.length > 0) {
    const nextDate = getNextValidSeriesDate(todo.seriesDates, todo.scheduledDate);
    if (nextDate && nextDate !== todo.scheduledDate) {
      return await updateTodoInFirestore(uid, todo.id, buildNextRecurringOccurrenceUpdate(todo, nextDate));
    }
    return todo;
  }

  if (todo.recurrence && todo.recurrence !== "none" && isPastDate(todo.scheduledDate)) {
    const nextDate = getNextValidRecurrenceDate(
      todo.scheduledDate,
      todo.recurrence as any,
      todo.weeklyDays
    );
    if (nextDate !== todo.scheduledDate) {
      return await updateTodoInFirestore(uid, todo.id, buildNextRecurringOccurrenceUpdate(todo, nextDate));
    }
  }

  return todo;
};

export const fetchTodos = createAsyncThunk<
  Todo[],
  { limit?: number; startAfterId?: string } | void,
  { state: RootState }
>("todo/fetchTodos", async (opts, thunkAPI) => {
  try {
    const uid = getUidOrReject(thunkAPI);
    const todos = await fetchTodosFromFirestore(uid, opts as any);
    const normalizedTodos: Todo[] = [];

    for (const todo of todos) {
      normalizedTodos.push(await normalizeCompletedRecurringTodo(uid, todo));
    }

    return normalizedTodos;
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
  { id: string; updates: PartialTodoUpdate },
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

    const updates: any = getRecurringCompletionUpdate(todo);

    // Handle subtasks (mark all as completed)
    if (todo.subtasks && todo.subtasks.length > 0) {
      const updatedSubtasks = todo.subtasks.map((st) => ({ ...st, completed: true }));
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

    const nextStatus = getParentTodoStatusFromSubtasks(updatedSubtasks, todo.status);
    const updates: any = { subtasks: updatedSubtasks };

    if (nextStatus === TODO_STATUS.COMPLETED && todo.status !== TODO_STATUS.COMPLETED) {
      Object.assign(updates, getRecurringCompletionUpdate(todo));
    } else if (nextStatus !== TODO_STATUS.COMPLETED) {
      updates.status = nextStatus;
      if (nextStatus === TODO_STATUS.IN_PROGRESS) {
        Object.assign(updates, appendHistoryEntry(todo, TODO_STATUS.IN_PROGRESS, todo.scheduledDate));
      }
    }

    return await updateTodoInFirestore(uid, todoId, updates);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to toggle subtask";
    return thunkAPI.rejectWithValue(message);
  }
});
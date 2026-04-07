import type { TodoStatus, TodoActionType } from "../types/todo";

export const TODO_STATUS: Record<string, TodoStatus> = {
  PENDING: "pending",
  IN_PROGRESS: "inprogress",
  COMPLETED: "completed",
} as const;

export const TODO_ACTION_TYPE: Record<string, TodoActionType> = {
  LEARNING: "learning",
  PROJECT: "project",
  REVISION: "revision",
} as const;
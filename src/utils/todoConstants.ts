export const TODO_STATUS = {
  PENDING: "pending",
  IN_PROGRESS: "inprogress",
  COMPLETED: "completed",
} as const;

export const TODO_ACTION_TYPE = {
  LEARNING: "learning",
  PROJECT: "project",
  REVISION: "revision",
} as const;

export type TodoStatus =
  (typeof TODO_STATUS)[keyof typeof TODO_STATUS];

export type TodoActionType =
  (typeof TODO_ACTION_TYPE)[keyof typeof TODO_ACTION_TYPE];
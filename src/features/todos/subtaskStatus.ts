import { TODO_STATUS } from "../../utils/todoConstants";
import type { TodoStatus, Todo } from "../../types/todo";

export const getParentTodoStatusFromSubtasks = (
  subtasks: Array<{ completed: boolean }>,
  currentStatus: TodoStatus
): TodoStatus => {
  if (subtasks.length === 0) {
    return currentStatus;
  }

  const hasAnyCompleted = subtasks.some((subtask) => subtask.completed);
  if (hasAnyCompleted) {
    return TODO_STATUS.IN_PROGRESS;
  }

  return TODO_STATUS.PENDING;
};

export const shouldAutoCompleteTask = (todo: Partial<Todo>, now: Date = new Date()): boolean => {
  if (!todo.scheduledDate) return false;
  if (todo.status === TODO_STATUS.COMPLETED) return false;

  const scheduledDay = new Date(todo.scheduledDate).toISOString().split("T")[0];
  const currentDay = now.toISOString().split("T")[0];

  return scheduledDay < currentDay && todo.status === TODO_STATUS.IN_PROGRESS;
};

import { TODO_STATUS } from "../../utils/todoConstants";
import type { TodoStatus } from "../../types/todo";

export const getParentTodoStatusFromSubtasks = (
  subtasks: Array<{ completed: boolean }>,
  currentStatus: TodoStatus
): TodoStatus => {
  if (subtasks.length === 0) {
    return currentStatus;
  }

  const allCompleted = subtasks.every((subtask) => subtask.completed);
  if (allCompleted) {
    return TODO_STATUS.COMPLETED;
  }

  const hasAnyCompleted = subtasks.some((subtask) => subtask.completed);
  if (hasAnyCompleted) {
    return TODO_STATUS.IN_PROGRESS;
  }

  return TODO_STATUS.PENDING;
};

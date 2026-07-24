import type { Todo } from "../../types/todo";

export const parseScheduledTimeToMinutes = (time?: string): number => {
  if (!time) return Number.MAX_SAFE_INTEGER;

  const normalized = time.trim().toLowerCase();
  const meridiemMatch = normalized.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/);
  if (meridiemMatch) {
    let hours = Number(meridiemMatch[1]);
    const minutes = Number(meridiemMatch[2] ?? "0");
    const meridiem = meridiemMatch[3];

    if (meridiem === "pm" && hours < 12) hours += 12;
    if (meridiem === "am" && hours === 12) hours = 0;

    return hours * 60 + minutes;
  }

  const simpleMatch = normalized.match(/^(\d{1,2}):(\d{2})$/);
  if (simpleMatch) {
    return Number(simpleMatch[1]) * 60 + Number(simpleMatch[2]);
  }

  return Number.MAX_SAFE_INTEGER;
};

export const compareTodosByDateTime = (a: Todo, b: Todo): number => {
  const aDate = new Date(a.scheduledDate || "").getTime();
  const bDate = new Date(b.scheduledDate || "").getTime();

  if (Number.isNaN(aDate) || Number.isNaN(bDate)) {
    return a.title.localeCompare(b.title);
  }

  if (aDate !== bDate) return aDate - bDate;

  const aTime = parseScheduledTimeToMinutes(a.scheduledTime);
  const bTime = parseScheduledTimeToMinutes(b.scheduledTime);
  if (aTime !== bTime) return aTime - bTime;

  return a.title.localeCompare(b.title);
};

export const getTaskProgressInfo = (todo: Todo) => {
  const subtasks = todo.subtasks ?? [];
  const completedSubtasks = subtasks.filter((subtask) => subtask.completed).length;
  const taskCompleted = todo.status === "completed" || subtasks.length > 0 && subtasks.every((subtask) => subtask.completed);
  const completedUnits = (taskCompleted ? 1 : 0) + completedSubtasks;
  const totalUnits = 1 + subtasks.length;
  const progressPercent = totalUnits > 0 ? Math.round((completedUnits / totalUnits) * 100) : 0;

  return {
    completedUnits,
    totalUnits,
    progressPercent,
    isCompleted: taskCompleted,
  };
};

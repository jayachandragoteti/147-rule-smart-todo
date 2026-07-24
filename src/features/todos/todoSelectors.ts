import { createSelector } from "@reduxjs/toolkit";
import type { Todo } from "../../types/todo";
import type { RootState } from "../../app/store";
import { getOverdueDays, getTaskBusinessDate, getTaskSection, isTodayDate, isFutureDate } from "../../utils/dateUtils";

// Base Selector
export const selectAllTodos = (state: RootState) => state.todo.todos;

const isTodoScheduledToday = (todo: Todo): boolean => {
  if (todo.seriesDates?.length) {
    return todo.seriesDates.some((date) => isTodayDate(date));
  }
  return isTodayDate(todo.scheduledDate);
};

const isTodoScheduledInFuture = (todo: Todo): boolean => isFutureDate(todo.scheduledDate);

// Standard action items
export const selectStandardTodos = createSelector(
  [selectAllTodos],
  (todos) => todos.filter((t) => !t.apply137Rule)
);

// 1-3-7 Learning items
export const selectLearningTodos = createSelector(
  [selectAllTodos],
  (todos) => todos.filter((t) => t.apply137Rule)
);

export const selectHomeTaskSections = createSelector([selectAllTodos], (todos) => {
  const overdue = todos.filter((todo) => getTaskSection(todo) === "overdue").sort((a,b)=>getOverdueDays(b)-getOverdueDays(a));
  const today = todos.filter((todo) => getTaskSection(todo) === "today").sort((a,b)=>Number(a.status === "completed") - Number(b.status === "completed"));
  const upcoming = todos.filter((todo) => getTaskSection(todo) === "upcoming").sort((a,b)=>new Date(getTaskBusinessDate(a)).getTime() - new Date(getTaskBusinessDate(b)).getTime());
  const backlog = todos.filter((todo) => getTaskSection(todo) === "backlog").sort((a,b)=>new Date(getTaskBusinessDate(a)).getTime() - new Date(getTaskBusinessDate(b)).getTime());
  const completed = todos.filter((todo) => getTaskSection(todo) === "completed").sort((a,b)=>new Date(b.completedAt ?? b.createdAt).getTime() - new Date(a.completedAt ?? a.createdAt).getTime());

  return { overdue, today, upcoming, backlog, completed };
});

// Today's specific tasks - show all tasks due today, including completed items, and keep future-scheduled tasks out of upcoming.
export const selectTodayTasks = createSelector(
  [selectAllTodos],
  (todos) =>
    todos
      .filter((todo) => getTaskSection(todo) === "today" || getTaskSection(todo) === "overdue")
      .sort((a, b) => {
        const aDone = a.status === "completed";
        const bDone = b.status === "completed";

        if (!aDone && bDone) return -1;
        if (aDone && !bDone) return 1;
        return 0;
      })
);

// Today's regular (non-revision) tasks
export const selectTodayRegularTasks = createSelector(
  [selectTodayTasks],
  (todayTasks) => todayTasks.filter((t) => !t.apply137Rule)
);

// Today's revision tasks (apply137Rule = true, due today)
export const selectTodayRevisions = createSelector(
  [selectTodayTasks],
  (todayTasks) => todayTasks.filter((t) => t.apply137Rule)
);

// Stats for dashboard
export const selectTaskStats = createSelector(
  [selectTodayTasks],
  (todayTasks) => {
    const completedToday = todayTasks.filter((t) => {
      if (t.status === "completed") return true;
      if (t.seriesDates?.length) return isFutureDate(t.scheduledDate);
      if (t.recurrence && t.recurrence !== "none") return isFutureDate(t.scheduledDate);
      return false;
    }).length;
    
    const progressPercent = todayTasks.length > 0
      ? Math.round((completedToday / todayTasks.length) * 100)
      : 0;

    return {
      todayTotal: todayTasks.length,
      completedToday,
      pendingToday: todayTasks.length - completedToday,
      progressPercent,
    };
  }
);

// Extended stats including in-progress count for the dashboard summary strip
export const selectExtendedTaskStats = createSelector(
  [selectTodayTasks],
  (todayTasks) => {
    const completed  = todayTasks.filter((t) => t.status === "completed").length;
    const inProgress = todayTasks.filter((t) => t.status === "inprogress").length;
    const pending    = todayTasks.filter((t) => t.status === "pending").length;
    const total      = todayTasks.length;
    const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, inProgress, pending, progressPercent };
  }
);

/**
 * Upcoming / Scheduled tasks selector
 *
 * Returns all tasks whose next due date is in the future (not today, not past),
 * covering:
 *   - Regular tasks scheduled on a future date
 *   - 1-3-7 revision tasks waiting for Day 3 or Day 7 (scheduledDate is future)
 *   - Recurring tasks (daily / weekly / monthly) whose scheduledDate advanced past today
 *
 * Excludes tasks that are already "completed" with no further occurrences.
 * Sorted by nearest scheduledDate first.
 */
export const selectUpcomingTasks = createSelector(
  [selectAllTodos],
  (todos) =>
    todos
      .filter((t) => {
        if (isTodoScheduledToday(t)) return false;

        // Skip tasks that are permanently done (non-recurring, non-series, completed)
        if (t.status === "completed" && !t.apply137Rule && t.recurrence === "none") return false;

        // For 1-3-7 series tasks: show if the next scheduledDate is in the future
        if (t.apply137Rule) return isTodoScheduledInFuture(t);

        // For recurring tasks: show if scheduledDate is in the future
        if (t.recurrence && t.recurrence !== "none") return isTodoScheduledInFuture(t);

        // For regular tasks: show if scheduledDate is in the future (not today) and not completed
        return isTodoScheduledInFuture(t) && t.status !== "completed";
      })
      .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
);


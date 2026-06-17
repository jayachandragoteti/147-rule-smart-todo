import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../../app/store";
import { isTodayDate, isFutureDate } from "../../utils/dateUtils";

// Base Selector
export const selectAllTodos = (state: RootState) => state.todo.todos;

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

// Today's specific tasks - show all, but sort completed to bottom
export const selectTodayTasks = createSelector(
  [selectAllTodos],
  (todos) =>
    todos
      .filter((t) => {
        if (t.seriesDates?.length) return t.seriesDates.some((d) => isTodayDate(d));
        return isTodayDate(t.scheduledDate);
      })
      .sort((a, b) => {
        const aDone = a.status === "completed" || (a.seriesDates?.length ? isFutureDate(a.scheduledDate) : false);
        const bDone = b.status === "completed" || (b.seriesDates?.length ? isFutureDate(a.scheduledDate) : false);
        
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

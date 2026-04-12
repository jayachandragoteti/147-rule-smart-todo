import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../../app/store";
import { isTodayDate } from "../../utils/dateUtils";

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

// Today's specific tasks
export const selectTodayTasks = createSelector(
  [selectAllTodos],
  (todos) =>
    todos.filter((t) => {
      if (t.seriesDates?.length) return t.seriesDates.some((d) => isTodayDate(d));
      return isTodayDate(t.scheduledDate);
    })
);

// Stats for dashboard
export const selectTaskStats = createSelector(
  [selectTodayTasks],
  (todayTasks) => {
    const completedToday = todayTasks.filter((t) => t.status === "completed").length;
    const pendingToday = todayTasks.filter((t) => t.status !== "completed").length;
    
    // Recalculating learning tasks to get total
    const progressPercent = todayTasks.length > 0
      ? Math.round((completedToday / todayTasks.length) * 100)
      : 0;

    return {
      todayTotal: todayTasks.length,
      completedToday,
      pendingToday,
      progressPercent,
    };
  }
);

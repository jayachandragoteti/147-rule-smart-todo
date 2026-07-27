import { describe, it, expect } from "vitest";
import type { Todo } from "../../../types/todo";
import { selectExtendedTaskStats, selectTodayTasks } from "../todoSelectors";

const makeTodo = (overrides: Partial<Todo> = {}): Todo => ({
  id: "todo-1",
  title: "Test task",
  descriptions: [],
  galleryImages: [],
  links: [],
  status: "pending",
  actionType: "project",
  priority: "medium",
  category: "Personal",
  apply137Rule: false,
  recurrence: "none",
  createdAt: new Date().toISOString(),
  scheduledDate: new Date().toISOString(),
  reminderEnabled: false,
  notificationSound: "bell",
  order: 0,
  ...overrides,
} as Todo);

describe("todo selectors", () => {
  it("keeps completed tasks in today's view so the progress bar can reflect completion", () => {
    const completedTodo = makeTodo({ id: "completed", status: "completed", title: "Completed task" });
    const pendingTodo = makeTodo({ id: "pending", status: "pending", title: "Pending task" });

    const state = {
      todo: {
        todos: [completedTodo, pendingTodo],
      },
    } as any;

    const todayTasks = selectTodayTasks(state);
    const stats = selectExtendedTaskStats(state);

    expect(todayTasks.map((todo) => todo.id)).toEqual(["pending", "completed"]);
    expect(stats.completed).toBe(1);
    expect(stats.total).toBe(2);
    expect(stats.progressPercent).toBe(50);
  });
});

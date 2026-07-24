import { describe, expect, it } from "vitest";
import type { Todo } from "../../types/todo";
import { getOverdueDays, getTaskBusinessDate, getTaskSection } from "../dateUtils";

const createTodo = (overrides: Partial<Todo> = {}): Todo => ({
  id: "todo-1",
  title: "Sample",
  descriptions: [],
  galleryImages: [],
  links: [],
  status: "pending",
  actionType: "project",
  priority: "medium",
  category: "Personal",
  apply137Rule: false,
  recurrence: "none",
  createdAt: "2024-01-01T00:00:00.000Z",
  scheduledDate: "2024-01-15T00:00:00.000Z",
  reminderEnabled: false,
  notificationSound: "bell",
  order: 1,
  ...overrides,
});

describe("task lifecycle helpers", () => {
  it("calculates overdue days for a past-due pending task", () => {
    const today = new Date();
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - 3);

    const todo = createTodo({ scheduledDate: pastDate.toISOString(), status: "pending" });

    expect(getOverdueDays(todo)).toBe(3);
  });

  it("uses dueDate or occurrenceDate over scheduledDate when available", () => {
    const todo = createTodo({
      scheduledDate: "2024-01-15T00:00:00.000Z",
      dueDate: "2024-01-20T00:00:00.000Z",
      occurrenceDate: "2024-01-20T00:00:00.000Z",
    });

    expect(getTaskBusinessDate(todo)).toBe("2024-01-20T00:00:00.000Z");
  });

  it("classifies overdue and backlog tasks separately", () => {
    const overdueTodo = createTodo({ status: "pending", recurrence: "none", scheduledDate: "2024-01-01T00:00:00.000Z" });
    const backlogTodo = createTodo({ status: "pending", recurrence: "daily", scheduledDate: "2024-01-01T00:00:00.000Z" });

    expect(getTaskSection(overdueTodo)).toBe("overdue");
    expect(getTaskSection(backlogTodo)).toBe("backlog");
  });
});

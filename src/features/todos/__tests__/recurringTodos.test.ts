import { describe, it, expect, vi } from "vitest";
import type { Todo } from "../../../types/todo";
import { buildNextRecurringOccurrenceUpdate } from "../todoThunks";
import { TODO_STATUS } from "../../../utils/todoConstants";

vi.mock("../../../services/todoService", () => ({
  createTodoInFirestore: vi.fn(),
  fetchTodosFromFirestore: vi.fn(),
  updateTodoInFirestore: vi.fn(),
  deleteTodoFromFirestore: vi.fn(),
}));

describe("buildNextRecurringOccurrenceUpdate", () => {
  it("resets subtasks and status for the next recurring occurrence", () => {
    const todo: Todo = {
      id: "1",
      title: "Weekly review",
      descriptions: [],
      subtasks: [
        { id: "s1", title: "Review notes", completed: true },
        { id: "s2", title: "Plan next week", completed: false },
      ],
      galleryImages: [],
      links: [],
      status: TODO_STATUS.COMPLETED,
      actionType: "project",
      priority: "medium",
      category: "Personal",
      apply137Rule: false,
      recurrence: "weekly",
      createdAt: new Date().toISOString(),
      scheduledDate: new Date().toISOString(),
      reminderEnabled: false,
      notificationSound: "bell",
      order: 0,
    } as Todo;

    const update = buildNextRecurringOccurrenceUpdate(todo, "2026-08-05T00:00:00.000Z");

    expect(update.status).toBe(TODO_STATUS.PENDING);
    expect(update.scheduledDate).toBe("2026-08-05T00:00:00.000Z");
    expect(update.subtasks).toEqual([
      { id: "s1", title: "Review notes", completed: false },
      { id: "s2", title: "Plan next week", completed: false },
    ]);
  });
});

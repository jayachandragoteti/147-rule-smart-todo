import { describe, it, expect } from "vitest";
import { getParentTodoStatusFromSubtasks, shouldAutoCompleteTask } from "../subtaskStatus";
import { TODO_STATUS } from "../../../utils/todoConstants";

describe("getParentTodoStatusFromSubtasks", () => {
  it("moves a parent task to in progress when one subtask is completed", () => {
    const subtasks = [
      { id: "1", title: "First", completed: false },
      { id: "2", title: "Second", completed: true },
    ];

    expect(getParentTodoStatusFromSubtasks(subtasks, TODO_STATUS.PENDING)).toBe(TODO_STATUS.IN_PROGRESS);
  });

  it("keeps a parent task in progress when all subtasks are completed", () => {
    const subtasks = [
      { id: "1", title: "First", completed: true },
      { id: "2", title: "Second", completed: true },
    ];

    expect(getParentTodoStatusFromSubtasks(subtasks, TODO_STATUS.PENDING)).toBe(TODO_STATUS.IN_PROGRESS);
  });

  it("returns pending when the last completed subtask is reopened", () => {
    const subtasks = [
      { id: "1", title: "First", completed: false },
      { id: "2", title: "Second", completed: false },
    ];

    expect(getParentTodoStatusFromSubtasks(subtasks, TODO_STATUS.IN_PROGRESS)).toBe(TODO_STATUS.PENDING);
  });

  it("auto-completes a task once the business day has passed", () => {
    const todo = {
      id: "1",
      status: "inprogress" as const,
      scheduledDate: "2024-01-01T00:00:00.000Z",
      subtasks: [
        { id: "1", title: "First", completed: true },
        { id: "2", title: "Second", completed: true },
      ],
    };

    expect(shouldAutoCompleteTask(todo as any, new Date("2024-01-02T12:00:00.000Z"))).toBe(true);
  });
});

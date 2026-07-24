import { describe, it, expect } from "vitest";
import { getParentTodoStatusFromSubtasks } from "../subtaskStatus";
import { TODO_STATUS } from "../../../utils/todoConstants";

describe("getParentTodoStatusFromSubtasks", () => {
  it("moves a parent task to in progress when one subtask is completed", () => {
    const subtasks = [
      { id: "1", title: "First", completed: false },
      { id: "2", title: "Second", completed: true },
    ];

    expect(getParentTodoStatusFromSubtasks(subtasks, TODO_STATUS.PENDING)).toBe(TODO_STATUS.IN_PROGRESS);
  });

  it("keeps a parent task completed when all subtasks are completed", () => {
    const subtasks = [
      { id: "1", title: "First", completed: true },
      { id: "2", title: "Second", completed: true },
    ];

    expect(getParentTodoStatusFromSubtasks(subtasks, TODO_STATUS.PENDING)).toBe(TODO_STATUS.COMPLETED);
  });

  it("returns pending when the last completed subtask is reopened", () => {
    const subtasks = [
      { id: "1", title: "First", completed: false },
      { id: "2", title: "Second", completed: false },
    ];

    expect(getParentTodoStatusFromSubtasks(subtasks, TODO_STATUS.IN_PROGRESS)).toBe(TODO_STATUS.PENDING);
  });
});

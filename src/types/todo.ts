export type TodoStatus = "pending" | "inprogress" | "completed";
export type TodoActionType = "learning" | "project" | "revision";
export type TodoPriority = "low" | "medium" | "high" | "urgent";
export type TodoRecurrence = "none" | "daily" | "weekly" | "monthly";

export interface TodoLink {
  id: string;
  title: string;
  url: string;
}

export interface Todo {
  id: string;
  title: string;
  descriptions: string[];
  posterImage?: string;
  galleryImages: string[];
  links: TodoLink[];
  status: TodoStatus;
  actionType: TodoActionType;
  priority: TodoPriority;
  category: string;
  apply147Rule: boolean;
  recurrence: TodoRecurrence;
  seriesDates?: string[];
  createdAt: string;
  scheduledDate: string;
  scheduledTime?: string;
  dueDate?: string;
  reminderEnabled: boolean;
  order: number;
  assignTo?: string;
}

export type CreateTodoFormValues = {
  scheduledDate: string;
  scheduledTime?: string;
  title: string;
  descriptions: { value: string }[];
  posterImage: string;
  links: { title: string; url: string }[];
  apply147Rule: boolean;
  priority: TodoPriority;
  category: string;
  recurrence: TodoRecurrence;
  reminderEnabled: boolean;
  assignTo?: string;
};
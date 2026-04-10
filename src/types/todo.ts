export type TodoStatus = "pending" | "inprogress" | "completed";
export type TodoActionType = "learning" | "project" | "revision";
export type TodoPriority = "low" | "medium" | "high" | "urgent";
export type TodoRecurrence = "none" | "daily" | "weekly" | "monthly";

/**
 * Notification sound options for task reminders.
 * All sounds are generated via the Web Audio API — no external audio files needed.
 */
export type NotificationSound =
  | "bell"     // Classic bell — single warm tone
  | "chime"    // Double chime — two ascending notes
  | "alert"    // Urgent alert — rapid pulse
  | "soft"     // Gentle soft ping — subtle and quiet
  | "melody"   // Short 4-note melody — pleasant
  | "buzz";    // Buzz / vibration feel — low rumble

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
  /** Sound to play when this task's reminder fires. Defaults to 'bell'. */
  notificationSound: NotificationSound;
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
  notificationSound: NotificationSound;
  assignTo?: string;
};
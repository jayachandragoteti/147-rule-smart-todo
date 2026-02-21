export type TodoStatus = "pending" | "inprogress" | "completed";

export type TodoActionType = "learning" | "project" | "revision";

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
  apply147Rule: boolean;
  // Optional series identifier for 147 rule grouped todos
  // (deprecated) seriesId and seriesIndex removed — use `seriesDates` instead
  // If the todo represents a 147 series as a single doc, list all scheduled dates
  seriesDates?: string[];
  createdAt: string;
  scheduledDate: string; 
  dueDate?: string;
}
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
  createdAt: string;
  scheduledDate: string; 
  dueDate?: string;
}
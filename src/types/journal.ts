export interface JournalEntry {
  id: string;
  userId: string;
  date: string; // ISO format date
  content: string;
  title: string;
  todoIds: string[]; // Related task tags
  mood?: "happy" | "neutral" | "sad" | "stressed" | "focused";
  aiSummary?: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateJournalFormValues = {
  title: string;
  content: string;
  date: string;
  todoIds: string[];
  mood?: string;
};

export interface JournalEntry {
  id: string;
  userId: string;
  date: string; // ISO format date
  content: string;
  title: string;
  todoIds: string[]; // Related task tags
  createdAt: string;
  updatedAt: string;
}

export type CreateJournalFormValues = {
  title: string;
  content: string;
  date: string;
  todoIds: string[];
};

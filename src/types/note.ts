export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CreateNoteFormValues = {
  title: string;
  content: string;
  tags: string[];
  isPinned: boolean;
};

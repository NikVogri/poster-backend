export enum PageType {
  Todo = "todo",
  Notebook = "notebook",
}; 

export interface Page {
  id?: string;
  title: string;
  slug: string;
  content?: string;
  private: boolean;
  UserId?: string;
  createdAt?: string;
  updatedAt?: string;
  deleted?: boolean;
}

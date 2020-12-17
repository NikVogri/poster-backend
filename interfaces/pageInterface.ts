export interface Page {
  id?: number;
  title: string;
  slug: string;
  content: string;
  UserId?: string;
  createdAt?: string;
  updatedAt?: string;
  deleted?: boolean;
}

export interface Page {
  id?: number;
  title: string;
  slug: string;
  private: boolean;
  UserId?: string;
  createdAt?: string;
  updatedAt?: string;
  deleted?: boolean;
}

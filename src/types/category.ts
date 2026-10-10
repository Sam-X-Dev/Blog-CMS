export type Category = {
  id: string;
  name: string;
  slug: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  _count?: {
    blogs: number;
  };
};

export type Category = {
    id: string;
    name: string;
    slug: string;
    createdAt: string;
    updatedAt: string;
    _count?: { blogs: number };
};
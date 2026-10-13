import type { Metadata } from "next";
import { CategoryManager } from "@/components/admin/categories/CategoryManager";

export const metadata: Metadata = {
  title: "Categories | Admin",
  description: "Manage blog categories",
};

export default function AdminCategoriesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 dark:bg-gray-950">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Categories
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Create, rename and delete blog categories.
          </p>
        </header>

        <CategoryManager />
      </div>
    </div>
  );
}

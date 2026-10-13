import type { Metadata } from "next";
import { CategoryManager } from "@/components/admin/categories/CategoryManager";

export const metadata: Metadata = { title: "Categories | Admin" };

export default function AdminCategoriesPage() {
    return (
        <main className="mx-auto w-full max-w-4xl p-4 sm:p-8">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Categories</h1>
            <p className="mt-1 mb-6 text-sm text-gray-500">Create, rename and delete blog categories.</p>
            <CategoryManager />
        </main>
    );
}
import type { Metadata } from "next";
import { CategoryManager } from "@/components/admin/categories/CategoryManager";

export const metadata: Metadata = {
    title: "Categories | Admin",
    description: "Manage blog categories",
};

export default function AdminCategoriesPage() {
    return (
        <main className="mx-auto w-full max-w-6xl p-4 sm:p-8">
            <h1 className="text-brand-900 text-title">Categories</h1>
            <p className="text-brand-muted mt-1 mb-6 text-small">
                Create, rename and delete blog categories.
            </p>
            <CategoryManager />
        </main>
    );
}

import type { Metadata } from "next";
import { CategoryManager } from "@/components/admin/categories/CategoryManager";

export const metadata: Metadata = {
    title: "Categories | Admin",
    description: "Manage blog categories",
};

export default function AdminCategoriesPage() {
    return (
        <div className="min-h-screen bg-brand-50 py-10 dark:bg-[#1A120C]">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                <header className="mb-8">
                    <h1 className="text-display text-brand-900 dark:text-brand-50">
                        Categories
                    </h1>
                    <p className="mt-2 text-small text-brand-700 dark:text-brand-50">
                        Create, rename and delete blog categories.
                    </p>
                </header>

                <CategoryManager />
            </div>
        </div>
    );
}

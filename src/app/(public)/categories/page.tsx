import type { Metadata } from "next";
import { Suspense } from "react";
import { CategoryBrowser } from "@/components/public/CategoryBrowser";
import { PageIntro } from "@/components/public/PageIntro";
import { getCategoriesWithBlogs } from "@/lib/queries/public-blogs";

export const metadata: Metadata = {
    title: "Categories | BlogCMS",
    description: "Find blogs by topic: programming, web development, cloud, careers and more.",
};

export default function CategoriesPage() {
    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-14">
            <PageIntro title="Categories" subtitle="Pick a topic to see all its blogs." />
            <Suspense fallback={<div className="bg-brand-50 h-64 animate-pulse rounded-xl" />}>
                <CategoryList />
            </Suspense>
        </div>
    );
}

async function CategoryList() {
    const categories = await getCategoriesWithBlogs();

    if (categories.length === 0) {
        return (
            <p className="border-brand-200 bg-brand-50 text-brand-muted rounded-xl border border-dashed px-6 py-12 text-center">
                No categories with blogs yet. Please check back soon.
            </p>
        );
    }

    return <CategoryBrowser categories={categories} />;
}
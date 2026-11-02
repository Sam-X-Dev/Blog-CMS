"use client";

import { useState } from "react";
import { CategorySelect } from "@/components/admin/categories/CategorySelect";

export default function TestCategoryPage() {
    const [categoryId, setCategoryId] = useState("");
    return (
        <div className="mx-auto max-w-md p-8">
            <CategorySelect value={categoryId} onChange={setCategoryId} />
            <p className="mt-4 text-small text-brand-muted">Selected id: {categoryId || "none"}</p>
        </div>
    );
}
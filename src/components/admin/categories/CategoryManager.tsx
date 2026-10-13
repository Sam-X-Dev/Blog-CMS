"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ApiError, apiFetch } from "@/lib/api-client";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { Category } from "@/types/category";

const input =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100";
const card = "rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900";

export function CategoryManager() {
    // List
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    // Form (add / rename)
    const [name, setName] = useState("");
    const [editing, setEditing] = useState<Category | null>(null);
    const [fieldError, setFieldError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    // Delete
    const [toDelete, setToDelete] = useState<Category | null>(null);
    const [deleting, setDeleting] = useState(false);

    // State is set only inside the promise callbacks (React 19 effect rule)
    const loadCategories = useCallback(
        () =>
            apiFetch<Category[]>("/api/categories")
                .then((data) => {
                    setCategories(data);
                    setLoadError(null);
                })
                .catch((err: unknown) =>
                    setLoadError(err instanceof Error ? err.message : "Failed to load categories"),
                )
                .finally(() => setLoading(false)),
        [],
    );

    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    function retry() {
        setLoading(true);
        loadCategories();
    }

    function resetForm() {
        setName("");
        setEditing(null);
        setFieldError(null);
    }

    function startEdit(category: Category) {
        setEditing(category);
        setName(category.name);
        setFieldError(null);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const trimmed = name.trim();
        if (trimmed.length < 2) {
            setFieldError("Name must be at least 2 characters");
            return;
        }

        setSaving(true);
        setFieldError(null);
        try {
            await apiFetch(editing ? `/api/categories/${editing.id}` : "/api/categories", {
                method: editing ? "PUT" : "POST",
                body: JSON.stringify({ name: trimmed }),
            });
            toast.success(editing ? "Category updated successfully" : "Category created successfully");
            resetForm();
            await loadCategories();
        } catch (err) {
            if (err instanceof ApiError) setFieldError(err.errors?.name?.[0] ?? err.message);
            else toast.error("Failed to save category");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete() {
        if (!toDelete) return;
        setDeleting(true);
        try {
            await apiFetch(`/api/categories/${toDelete.id}`, { method: "DELETE" });
            toast.success("Category deleted successfully");
            if (editing?.id === toDelete.id) resetForm();
            setToDelete(null);
            await loadCategories();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to delete category");
        } finally {
            setDeleting(false);
        }
    }

    const blogCount = toDelete?._count?.blogs ?? 0;

    return (
        <div className="space-y-6">
            {/* Add / rename form */}
            <form onSubmit={handleSubmit} noValidate className={`${card} p-4 sm:p-6`}>
                <label
                    htmlFor="category-name"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                    {editing ? `Rename "${editing.name}"` : "New category"}
                </label>
                <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                    <input
                        id="category-name"
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                            setFieldError(null);
                        }}
                        placeholder="e.g. Artificial Intelligence"
                        maxLength={50}
                        aria-invalid={!!fieldError}
                        className={`${input} flex-1 aria-invalid:border-red-500`}
                    />
                    <div className="flex gap-2">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50 sm:flex-none dark:bg-gray-100 dark:text-gray-900"
                        >
                            {saving ? "Saving..." : editing ? "Update" : "Add category"}
                        </button>
                        {editing && (
                            <button
                                type="button"
                                onClick={resetForm}
                                disabled={saving}
                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </div>
                {fieldError && <p className="mt-2 text-sm text-red-600">{fieldError}</p>}
            </form>

            {/* List */}
            <section className={`${card} overflow-hidden`}>
                {loading ? (
                    <p className="p-10 text-center text-sm text-gray-500">Loading categories...</p>
                ) : loadError ? (
                    <div className="p-10 text-center text-sm">
                        <p className="text-red-600">{loadError}</p>
                        <button onClick={retry} className="mt-3 font-medium underline">
                            Try again
                        </button>
                    </div>
                ) : categories.length === 0 ? (
                    <p className="p-10 text-center text-sm text-gray-500">
                        No categories yet. Create your first category above.
                    </p>
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase dark:bg-gray-800/50">
                            <tr>
                                <th className="px-4 py-3 font-medium sm:px-6">Name</th>
                                <th className="hidden px-6 py-3 font-medium sm:table-cell">Slug</th>
                                <th className="px-4 py-3 font-medium sm:px-6">Blogs</th>
                                <th className="px-4 py-3 text-right font-medium sm:px-6">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {categories.map((category) => (
                                <tr key={category.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                                    <td className="px-4 py-3 font-medium text-gray-900 sm:px-6 dark:text-gray-100">
                                        {category.name}
                                    </td>
                                    <td className="hidden px-6 py-3 font-mono text-xs text-gray-500 sm:table-cell">
                                        {category.slug}
                                    </td>
                                    <td className="px-4 py-3 text-gray-500 sm:px-6">{category._count?.blogs ?? 0}</td>
                                    <td className="px-4 py-3 text-right whitespace-nowrap sm:px-6">
                                        <button
                                            onClick={() => startEdit(category)}
                                            className="font-medium text-indigo-600 hover:underline"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => setToDelete(category)}
                                            className="ml-4 font-medium text-red-600 hover:underline"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>

            <ConfirmDialog
                open={!!toDelete}
                title={`Delete "${toDelete?.name ?? ""}"?`}
                description={
                    blogCount > 0
                        ? `This category has ${blogCount} blog(s). The blogs will stay, but they will have no category.`
                        : "This category will be permanently removed."
                }
                confirmLabel="Delete"
                loading={deleting}
                onConfirm={handleDelete}
                onCancel={() => setToDelete(null)}
            />
        </div>
    );
}
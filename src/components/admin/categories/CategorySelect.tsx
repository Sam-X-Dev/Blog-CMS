"use client";

import { useEffect, useId, useState } from "react";
import { toast } from "sonner";
import { ApiError, apiFetch } from "@/lib/api-client";
import { slugify } from "@/lib/slugify";
import type { Category } from "@/types/category";

type CategorySelectProps = {
    value: string;
    onChange: (categoryId: string) => void;
    error?: string;
    id?: string;
};

const byName = (a: Category, b: Category) =>
    a.name.localeCompare(b.name, "en", { sensitivity: "base" });

/**
 * Category picker for the Create/Edit Blog form (used by Samarth).
 * The writer can pick an existing category, or type a new name and add it on the spot.
 * The new category is saved to the database and appears everywhere (admin list, filters).
 *
 * Usage: <CategorySelect value={categoryId} onChange={setCategoryId} error={errors.categoryId} />
 */
export function CategorySelect({ value, onChange, error, id = "category" }: CategorySelectProps) {
    const listId = useId();

    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [failed, setFailed] = useState(false);

    const [query, setQuery] = useState<string | null>(null); // null = not typing
    const [open, setOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);

    useEffect(() => {
        apiFetch<Category[]>("/api/categories")
            .then(setCategories)
            .catch(() => setFailed(true))
            .finally(() => setLoading(false));
    }, []);

    const selected = categories.find((c) => c.id === value);
    const text = query ?? selected?.name ?? "";
    const trimmed = text.trim();
    const search = (query ?? "").trim().toLowerCase();

    const matches = search
        ? categories.filter((c) => c.name.toLowerCase().includes(search))
        : categories;
    // "web development", "Web Development " and "WEB-DEVELOPMENT" are the same category
    const exact = trimmed ? categories.find((c) => c.slug === slugify(trimmed)) : undefined;
    const canCreate = query !== null && trimmed.length >= 2 && !exact;

    function pick(category: Category) {
        onChange(category.id);
        setQuery(null);
        setOpen(false);
        setCreateError(null);
    }

    async function createCategory() {
        const name = trimmed;
        if (name.length < 2 || creating) return;

        setCreating(true);
        setCreateError(null);
        try {
            const category = await apiFetch<Category>("/api/categories", {
                method: "POST",
                body: JSON.stringify({ name }),
            });
            setCategories((prev) => [...prev, category].sort(byName));
            pick(category);
            toast.success(`Category "${category.name}" added`);
        } catch (err) {
            // Someone added the same category a moment ago: reload and select it
            if (err instanceof ApiError && err.status === 409) {
                const fresh = await apiFetch<Category[]>("/api/categories").catch(() => null);
                const existing = fresh?.find((c) => c.slug === slugify(name));
                if (fresh) setCategories(fresh);
                if (existing) {
                    pick(existing);
                    return;
                }
            }
            setCreateError(
                err instanceof ApiError ? (err.errors?.name?.[0] ?? err.message) : "Failed to add category",
            );
        } finally {
            setCreating(false);
        }
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Escape") {
            setOpen(false);
            setQuery(null);
        }
        if (e.key === "Enter") {
            e.preventDefault(); // don't submit the blog form
            if (exact) pick(exact);
            else if (canCreate) createCategory();
            else if (matches.length === 1) pick(matches[0]);
        }
    }

    const showList = open && !loading && !failed && (matches.length > 0 || canCreate);
    const notSaved = query !== null && trimmed.length > 0 && !value && !creating && !createError;

    return (
        <div className="relative">
            <label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Category
            </label>
            <input
                id={id}
                type="text"
                role="combobox"
                aria-expanded={showList}
                aria-controls={listId}
                aria-autocomplete="list"
                aria-invalid={!!(error || createError)}
                autoComplete="off"
                maxLength={50}
                value={text}
                placeholder={
                    loading
                        ? "Loading categories..."
                        : failed
                            ? "Failed to load categories"
                            : "Search or type a new category"
                }
                disabled={loading || failed || creating}
                onFocus={() => setOpen(true)}
                onBlur={() => setOpen(false)}
                onChange={(e) => {
                    setQuery(e.target.value);
                    setOpen(true);
                    setCreateError(null);
                    if (value) onChange(""); // typing clears the old pick until a new one is chosen
                }}
                onKeyDown={handleKeyDown}
                className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-900 disabled:opacity-60 aria-invalid:border-red-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
            />

            {showList && (
                <ul
                    id={listId}
                    role="listbox"
                    className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-200 bg-white py-1 text-sm shadow-lg dark:border-gray-700 dark:bg-gray-900"
                >
                    {matches.map((category) => (
                        <li
                            key={category.id}
                            role="option"
                            aria-selected={category.id === value}
                            onMouseDown={(e) => {
                                e.preventDefault(); // keep focus so the click registers
                                pick(category);
                            }}
                            className="cursor-pointer px-3 py-2 text-gray-800 hover:bg-gray-100 aria-selected:font-semibold dark:text-gray-200 dark:hover:bg-gray-800"
                        >
                            {category.name}
                        </li>
                    ))}
                    {canCreate && (
                        <li
                            role="option"
                            aria-selected={false}
                            onMouseDown={(e) => {
                                e.preventDefault();
                                createCategory();
                            }}
                            className="cursor-pointer border-t border-gray-100 px-3 py-2 font-medium text-indigo-600 hover:bg-indigo-50 dark:border-gray-800 dark:text-indigo-400 dark:hover:bg-gray-800"
                        >
                            + Add &quot;{trimmed}&quot; as a new category
                        </li>
                    )}
                </ul>
            )}

            {creating && <p className="mt-1 text-xs text-gray-500">Adding category...</p>}
            {notSaved && (
                <p className="mt-1 text-xs text-gray-500">
                    Not selected yet. Pick one from the list, or press Enter to add it.
                </p>
            )}
            {(createError || error) && (
                <p className="mt-1 text-sm text-red-600">{createError ?? error}</p>
            )}
        </div>
    );
}
"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { apiFetch, ApiError } from "@/lib/api-client";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { Category } from "@/types/category";

export function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Form states
  const [nameInput, setNameInput] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Deletion states
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // React 19 rule: No synchronous setState inside useEffect body.
  // Trigger promise-based apiFetch and update state only in .then / .catch.
  useEffect(() => {
    let isMounted = true;

    apiFetch<Category[]>("/api/categories")
      .then((data) => {
        if (isMounted) {
          setCategories(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setFetchError(err instanceof ApiError ? err.message : "Failed to load categories");
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const reloadCategories = () => {
    setIsLoading(true);
    setFetchError(null);

    apiFetch<Category[]>("/api/categories")
      .then((data) => {
        setCategories(data);
        setIsLoading(false);
      })
      .catch((err) => {
        setFetchError(err instanceof ApiError ? err.message : "Failed to load categories");
        setIsLoading(false);
      });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = nameInput.trim();

    if (trimmedName.length < 2) {
      setFieldError("Category name must be at least 2 characters");
      return;
    }

    setIsSubmitting(true);
    setFieldError(null);

    if (editingCategory) {
      // Update existing category
      try {
        const updated = await apiFetch<Category>(`/api/categories/${editingCategory.id}`, {
          method: "PUT",
          body: JSON.stringify({ name: trimmedName }),
        });

        setCategories((prev) =>
          prev
            .map((cat) => (cat.id === updated.id ? updated : cat))
            .sort((a, b) => a.name.localeCompare(b.name))
        );
        toast.success("Category updated successfully");
        setNameInput("");
        setEditingCategory(null);
      } catch (err) {
        if (err instanceof ApiError) {
          if (err.errors?.name?.[0]) {
            setFieldError(err.errors.name[0]);
          }
          toast.error(err.message);
        } else {
          toast.error("Failed to update category");
        }
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Create new category
      try {
        const created = await apiFetch<Category>("/api/categories", {
          method: "POST",
          body: JSON.stringify({ name: trimmedName }),
        });

        setCategories((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
        toast.success("Category created successfully");
        setNameInput("");
      } catch (err) {
        if (err instanceof ApiError) {
          if (err.errors?.name?.[0]) {
            setFieldError(err.errors.name[0]);
          }
          toast.error(err.message);
        } else {
          toast.error("Failed to create category");
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleStartEdit = (category: Category) => {
    setEditingCategory(category);
    setNameInput(category.name);
    setFieldError(null);
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setNameInput("");
    setFieldError(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      await apiFetch(`/api/categories/${deleteTarget.id}`, {
        method: "DELETE",
      });

      setCategories((prev) => prev.filter((cat) => cat.id !== deleteTarget.id));
      toast.success("Category deleted successfully");

      if (editingCategory?.id === deleteTarget.id) {
        handleCancelEdit();
      }
      setDeleteTarget(null);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to delete category";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Category Creation / Edit Form */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {editingCategory ? `Rename "${editingCategory.name}"` : "Add New Category"}
        </h2>
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <div className="flex-1">
              <label htmlFor="category-name-input" className="sr-only">
                Category Name
              </label>
              <input
                id="category-name-input"
                type="text"
                value={nameInput}
                onChange={(e) => {
                  setNameInput(e.target.value);
                  if (fieldError) setFieldError(null);
                }}
                placeholder="e.g. Artificial Intelligence"
                className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:outline-hidden dark:bg-gray-950 dark:text-gray-100 dark:placeholder-gray-500 ${
                  fieldError
                    ? "border-red-500 focus:border-red-500 focus:ring-red-200 dark:border-red-600 dark:focus:ring-red-950"
                    : "border-gray-300 focus:border-gray-500 focus:ring-gray-200 dark:border-gray-700 dark:focus:ring-gray-800"
                }`}
              />
              {fieldError && (
                <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">
                  {fieldError}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
              >
                {isSubmitting
                  ? editingCategory
                    ? "Updating..."
                    : "Adding..."
                  : editingCategory
                    ? "Update"
                    : "Add category"}
              </button>
              {editingCategory && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={isSubmitting}
                  className="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </form>
      </section>

      {/* Category List */}
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900">
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            All Categories
          </h2>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <svg
              className="h-8 w-8 animate-spin text-gray-400 dark:text-gray-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Loading categories...</p>
          </div>
        ) : fetchError ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <p className="text-sm font-medium text-red-600 dark:text-red-400">{fetchError}</p>
            <button
              type="button"
              onClick={reloadCategories}
              className="mt-4 inline-flex items-center rounded-lg bg-gray-100 px-3.5 py-2 text-xs font-semibold text-gray-800 transition hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Try again
            </button>
          </div>
        ) : categories.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No categories yet. Create your first category above.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:bg-gray-950 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-6 py-3.5">
                    Name
                  </th>
                  <th scope="col" className="hidden px-6 py-3.5 sm:table-cell">
                    Slug
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Blogs
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white text-sm dark:divide-gray-800 dark:bg-gray-900">
                {categories.map((category) => (
                  <tr
                    key={category.id}
                    className="transition hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="px-6 py-4 font-medium whitespace-nowrap text-gray-900 dark:text-gray-100">
                      {category.name}
                    </td>
                    <td className="hidden px-6 py-4 font-mono text-xs whitespace-nowrap text-gray-500 sm:table-cell dark:text-gray-400">
                      {category.slug}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                        {category._count?.blogs ?? 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(category)}
                          className="font-medium text-indigo-600 transition hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(category)}
                          className="font-medium text-red-600 transition hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <ConfirmDialog
          open={!!deleteTarget}
          title={`Delete "${deleteTarget.name}"?`}
          description={
            (deleteTarget._count?.blogs ?? 0) > 0
              ? `This category has ${deleteTarget._count?.blogs} blog(s). The blogs will stay, but their category will be unassigned.`
              : "Are you sure you want to delete this category? This action cannot be undone."
          }
          confirmLabel="Delete"
          loading={isDeleting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

export default CategoryManager;

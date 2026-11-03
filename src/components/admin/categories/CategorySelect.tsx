"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch, ApiError } from "@/lib/api-client";
import type { Category } from "@/types/category";
import { Select } from "@/components/ui/Select";

/**
 * Usage Example in Create/Edit Blog form:
 *
 * import { CategorySelect } from "@/components/admin/categories/CategorySelect";
 *
 * const [categoryId, setCategoryId] = useState<string>("");
 *
 * <CategorySelect
 *   value={categoryId}
 *   onChange={(id) => setCategoryId(id)}
 *   error={fieldErrors?.categoryId?.[0]}
 * />
 */
export interface CategorySelectProps {
  value?: string;
  onChange: (value: string) => void;
  error?: string;
  id?: string;
  disabled?: boolean;
  required?: boolean;
}

export function CategorySelect({
  value = "",
  onChange,
  error,
  id = "category-select",
  disabled = false,
  required = false,
}: CategorySelectProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // React 19 rule: fetch in effect and set state strictly inside promises
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

  return (
    <div className="w-full space-y-1.5">
      <label htmlFor={id} className="block text-small font-medium text-brand-700">
        Category
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <Select
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled || isLoading}
        invalid={Boolean(error)}
        className="px-3.5 py-2.5"
        options={[
          {
            value: "",
            label: isLoading
              ? "Loading categories..."
              : fetchError
                ? "Failed to load categories"
                : "Select a category",
          },
          ...categories.map((c) => ({ value: c.id, label: c.name })),
        ]}
      />

      {!isLoading && !fetchError && categories.length === 0 && (
        <p className="text-caption text-brand-muted">
          No categories yet.{" "}
          <Link
            href="/admin/categories"
            className="font-medium text-brand-600 underline hover:text-brand-900"
          >
            Add one in Admin -&gt; Categories.
          </Link>
        </p>
      )}

      {error && <p className="text-caption font-medium text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}

export default CategorySelect;

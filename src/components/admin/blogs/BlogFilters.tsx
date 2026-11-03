"use client";

import Form from "next/form";
import Link from "next/link";
import { useRef } from "react";
import { Search } from "lucide-react";
import { ADMIN_SORTS } from "@/lib/admin-sorts";
import { Select } from "@/components/ui/Select";

type Query = { q: string; status: string; category: string; sort: string };

const control = "h-10 px-3 md:w-40 lg:w-44";

/** Search + status + category + sort. Dropdowns apply right away; search applies on Enter. */
export function BlogFilters({
  query,
  categories,
}: {
  query: Query;
  categories: { id: string; name: string }[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const apply = () => formRef.current?.requestSubmit();
  const filtered = query.q || query.status !== "all" || query.category || query.sort !== "updated";

  return (
    <Form
      ref={formRef}
      action="/admin/blogs"
      role="search"
      className="border-brand-200 flex flex-col gap-3 rounded-xl border bg-white p-3 md:flex-row md:items-center"
    >
      <label className="border-brand-400 focus-within:ring-brand-400 flex h-10 flex-1 items-center gap-2 rounded-lg border bg-white px-3 focus-within:ring-2">
        <Search className="text-brand-400 size-4 shrink-0" aria-hidden />
        <span className="sr-only">Search blogs</span>
        <input
          key={query.q}
          name="q"
          type="search"
          defaultValue={query.q}
          placeholder="Search title, URL, description or tag..."
          className="text-brand-900 placeholder:text-brand-muted text-small w-full bg-transparent outline-none"
        />
      </label>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:flex">
        <Select
          key={`status:${query.status}`}
          name="status"
          aria-label="Status"
          defaultValue={query.status}
          onChange={apply}
          className={control}
          options={[
            { value: "all", label: "All statuses" },
            { value: "published", label: "Published" },
            { value: "draft", label: "Drafts" },
          ]}
        />
        <Select
          key={`category:${query.category}`}
          name="category"
          aria-label="Category"
          defaultValue={query.category}
          onChange={apply}
          className={control}
          options={[
            { value: "", label: "All categories" },
            { value: "none", label: "No category" },
            ...categories.map((c) => ({ value: c.id, label: c.name })),
          ]}
        />
        <div className="col-span-2 sm:col-span-1">
          <Select
            key={`sort:${query.sort}`}
            name="sort"
            aria-label="Sort"
            defaultValue={query.sort}
            onChange={apply}
            className={control}
            options={ADMIN_SORTS.map((s) => ({ value: s.id, label: `Sort: ${s.label}` }))}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          className="bg-brand-600 hover:bg-brand-700 text-small h-10 flex-1 rounded-lg px-4 font-semibold text-white md:flex-none"
        >
          Search
        </button>
        {filtered && (
          <Link
            href="/admin/blogs"
            className="text-brand-600 text-small font-semibold whitespace-nowrap hover:underline"
          >
            Clear
          </Link>
        )}
      </div>
    </Form>
  );
}

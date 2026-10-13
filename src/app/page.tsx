import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6 dark:bg-gray-950">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl dark:text-gray-100">
          Blog CMS
        </h1>
        <p className="mt-2 text-sm text-gray-600 sm:text-base dark:text-gray-400">
          public site coming soon
        </p>
        <div className="mt-6">
          <Link
            href="/admin/categories"
            className="inline-flex items-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-xs transition hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
          >
            Manage Categories
          </Link>
        </div>
      </div>
    </main>
  );
}

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
        <Link
          href="/admin/categories"
          className="mt-4 inline-block text-sm font-medium text-gray-900 underline dark:text-gray-100"
        >
          Go to Admin → Categories
        </Link>
      </div>
    </main>
  );
}
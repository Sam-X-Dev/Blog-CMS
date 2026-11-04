import type { Metadata } from "next";
import { Suspense } from "react";
import { formatDate } from "@/lib/blog-utils";
import { getReaders } from "@/lib/queries/comments";

export const metadata: Metadata = { title: "Readers | Admin" };

export default function AdminReadersPage() {
  return (
    <main className="mx-auto w-full max-w-6xl p-4 sm:p-8">
      <h1 className="text-brand-900 text-title">Readers</h1>
      <p className="text-brand-muted text-small mt-1 mb-6">
        People who signed up on the website to like, save and comment on blogs.
      </p>
      <Suspense fallback={<div className="bg-brand-50 h-64 animate-pulse rounded-xl" />}>
        <ReaderTable />
      </Suspense>
    </main>
  );
}

async function ReaderTable() {
  const readers = await getReaders();
  if (readers.length === 0) {
    return (
      <p className="border-brand-200 text-brand-muted text-small rounded-xl border border-dashed bg-white p-10 text-center">
        No readers have signed up yet.
      </p>
    );
  }

  return (
    <div className="border-brand-200 overflow-x-auto rounded-xl border bg-white">
      <table className="text-small w-full min-w-[640px] text-left">
        <thead className="bg-brand-50 text-brand-muted whitespace-nowrap">
          <tr>
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Email</th>
            <th className="px-4 py-3 font-medium">Joined</th>
            <th className="px-4 py-3 text-right font-medium">Likes</th>
            <th className="px-4 py-3 text-right font-medium">Saved</th>
            <th className="px-4 py-3 text-right font-medium">Comments</th>
          </tr>
        </thead>
        <tbody className="divide-brand-200 divide-y">
          {readers.map((r) => (
            <tr key={r.id}>
              <td className="text-brand-900 px-4 py-3 font-medium">{r.name}</td>
              <td className="text-brand-muted px-4 py-3">{r.email}</td>
              <td className="text-brand-muted px-4 py-3 whitespace-nowrap">
                {formatDate(r.createdAt)}
              </td>
              <td className="px-4 py-3 text-right tabular-nums">{r._count.likes}</td>
              <td className="px-4 py-3 text-right tabular-nums">{r._count.saves}</td>
              <td className="px-4 py-3 text-right tabular-nums">{r._count.comments}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import type { Metadata } from "next";
import { Suspense } from "react";
import { TrendingToggle } from "@/components/admin/trending/TrendingToggle";
import { getAdminTrendingList } from "@/lib/queries/admin-trending";

export const metadata: Metadata = { title: "Trending & Featured | Admin" };

export default function AdminTrendingPage() {
    return (
        <main className="mx-auto w-full max-w-6xl p-4 sm:p-8">
            <h1 className="text-brand-900 text-title">Trending &amp; Featured</h1>
            <p className="text-brand-muted mt-1 mb-6 text-small">
                Turn on a blog to show it under &ldquo;Editor&apos;s picks&rdquo; on the Trending page. The
                rest of the page is filled by views from the last 7 days. Turn on &ldquo;Homepage
                featured&rdquo; to show a blog as the big blog on the homepage (the newest one you turn on
                wins; with none on, the newest blog is shown).
            </p>
            <Suspense fallback={<div className="bg-brand-50 h-64 animate-pulse rounded-xl" />}>
                <TrendingTable />
            </Suspense>
        </main>
    );
}

async function TrendingTable() {
    const rows = await getAdminTrendingList();

    if (rows.length === 0) {
        return (
            <p className="border-brand-200 text-brand-muted rounded-xl border border-dashed p-8 text-center text-small">
                No published blogs yet.
            </p>
        );
    }

    return (
        <div className="border-brand-200 overflow-x-auto rounded-xl border bg-white">
            <table className="w-full min-w-[640px] text-left text-small">
                <thead className="bg-brand-50 text-brand-muted whitespace-nowrap">
                    <tr>
                        <th className="px-4 py-3 font-medium">Blog</th>
                        <th className="px-4 py-3 font-medium">Category</th>
                        <th className="px-4 py-3 text-right font-medium">Views (7 days)</th>
                        <th className="px-4 py-3 text-right font-medium">Editor&apos;s pick</th>
                        <th className="px-4 py-3 text-right font-medium">Homepage featured</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr key={row.id} className="border-brand-200 border-t">
                            <td className="text-brand-900 px-4 py-3 font-medium">{row.title}</td>
                            <td className="text-brand-muted px-4 py-3">{row.category ?? "—"}</td>
                            <td className="text-brand-900 px-4 py-3 text-right tabular-nums">
                                {row.weekViews.toLocaleString("en-IN")}
                            </td>
                            <td className="px-4 py-3 text-right">
                                <TrendingToggle blogId={row.id} title={row.title} initial={row.isTrending} />
                            </td>
                            <td className="px-4 py-3 text-right">
                                <TrendingToggle
                                    kind="featured"
                                    blogId={row.id}
                                    title={row.title}
                                    initial={row.isFeatured}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
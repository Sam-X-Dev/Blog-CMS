import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  ArrowRight,
  Eye,
  FilePen,
  FileCheck2,
  FileText,
  Bookmark,
  FolderTree,
  Heart,
  Images,
  MessageCircle,
  Plus,
  Tags,
  Users,
} from "lucide-react";
import { StatusBadge } from "@/components/admin/blogs/StatusBadge";
import { formatDate } from "@/lib/blog-utils";
import { getDashboardData } from "@/lib/queries/admin-blogs";

export const metadata: Metadata = { title: "Dashboard | Admin" };

export default function AdminDashboardPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 p-4 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-brand-900 text-title">Dashboard</h1>
          <p className="text-brand-muted text-small mt-1">Everything on your blog, at a glance.</p>
        </div>
        <Link
          href="/admin/blogs/new"
          className="bg-brand-600 hover:bg-brand-700 text-small inline-flex h-10 items-center gap-2 rounded-lg px-4 font-semibold text-white"
        >
          <Plus className="size-4" /> New blog
        </Link>
      </div>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </main>
  );
}

async function DashboardContent() {
  const { stats, recent, topThisWeek } = await getDashboardData();
  const n = (v: number) => v.toLocaleString("en-IN");

  const cards = [
    { label: "Total blogs", value: stats.total, icon: FileText, href: "/admin/blogs" },
    {
      label: "Published",
      value: stats.published,
      icon: FileCheck2,
      href: "/admin/blogs?status=published",
    },
    { label: "Drafts", value: stats.drafts, icon: FilePen, href: "/admin/blogs?status=draft" },
    { label: "Views (7 days)", value: stats.weekViews, icon: Eye, href: "/admin/trending" },
    { label: "All-time views", value: stats.allViews, icon: Eye, href: "/admin/trending" },
    { label: "Categories", value: stats.categories, icon: FolderTree, href: "/admin/categories" },
    { label: "Tags", value: stats.tags, icon: Tags, href: "/admin/tags" },
    { label: "Images", value: stats.media, icon: Images, href: "/admin/media" },
    { label: "Readers", value: stats.readers, icon: Users, href: "/admin/readers" },
    { label: "Comments", value: stats.comments, icon: MessageCircle, href: "/admin/comments" },
    { label: "Likes", value: stats.likes, icon: Heart, href: "/admin/readers" },
    { label: "Saves", value: stats.saves, icon: Bookmark, href: "/admin/readers" },
  ];

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, href }) => (
          <li key={label}>
            <Link
              href={href}
              className="border-brand-200 hover:border-brand-400 flex h-full flex-col gap-3 rounded-xl border bg-white p-4 transition-colors sm:p-5"
            >
              <span className="text-brand-muted text-small flex items-center justify-between gap-2">
                {label}
                <Icon className="text-brand-400 size-4 shrink-0" />
              </span>
              <span className="text-brand-900 text-title tabular-nums">{n(value)}</span>
            </Link>
          </li>
        ))}
      </ul>

      {stats.draftsWithoutThumbnail > 0 && (
        <p className="text-small rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
          {stats.draftsWithoutThumbnail}{" "}
          {stats.draftsWithoutThumbnail === 1 ? "draft has" : "drafts have"} no thumbnail yet. A
          thumbnail is needed before publishing.
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="border-brand-200 min-w-0 rounded-xl border bg-white">
          <header className="border-brand-200 flex items-center justify-between border-b px-5 py-4">
            <h2 className="text-brand-900 text-heading">Recently edited</h2>
            <Link
              href="/admin/blogs"
              className="text-brand-600 text-small inline-flex items-center gap-1 font-semibold hover:underline"
            >
              All blogs <ArrowRight className="size-3.5" />
            </Link>
          </header>
          {recent.length === 0 ? (
            <Empty text="No blogs yet. Write your first one." />
          ) : (
            <ul className="divide-brand-200 divide-y">
              {recent.map((b) => (
                <li key={b.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <Link
                      href={`/admin/blogs/${b.id}/edit`}
                      className="text-brand-900 text-small block truncate font-medium hover:underline"
                    >
                      {b.title}
                    </Link>
                    <span className="text-brand-muted text-caption">
                      Edited {formatDate(b.updatedAt)}
                    </span>
                  </div>
                  <StatusBadge status={b.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="border-brand-200 min-w-0 rounded-xl border bg-white">
          <header className="border-brand-200 flex items-center justify-between border-b px-5 py-4">
            <h2 className="text-brand-900 text-heading">Most read this week</h2>
            <Link
              href="/admin/trending"
              className="text-brand-600 text-small inline-flex items-center gap-1 font-semibold hover:underline"
            >
              Trending <ArrowRight className="size-3.5" />
            </Link>
          </header>
          {topThisWeek.length === 0 ? (
            <Empty text="No views in the last 7 days yet." />
          ) : (
            <ol className="divide-brand-200 divide-y">
              {topThisWeek.map((b, i) => (
                <li key={b.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="text-brand-400 text-small w-4 font-semibold tabular-nums">
                      {i + 1}
                    </span>
                    <Link
                      href={`/admin/blogs/${b.id}/edit`}
                      className="text-brand-900 text-small truncate font-medium hover:underline"
                    >
                      {b.title}
                    </Link>
                  </div>
                  <span className="text-brand-muted text-caption shrink-0 tabular-nums">
                    {n(b.views)} views
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="text-brand-muted text-small px-5 py-10 text-center">{text}</p>;
}

function DashboardSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="h-24 rounded-xl bg-white" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-72 rounded-xl bg-white" />
        <div className="h-72 rounded-xl bg-white" />
      </div>
    </div>
  );
}

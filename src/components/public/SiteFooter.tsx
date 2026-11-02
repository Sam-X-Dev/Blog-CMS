import { Suspense } from "react";
import Link from "next/link";
import { ArrowUpRight, Mail } from "lucide-react";
import { blogsPath, categoryPath, formatDate } from "@/lib/blog-utils";
import { getCategoriesWithBlogs, getSiteStats } from "@/lib/queries/public-blogs";
import { SiteLogo } from "./SiteLogo";

/**
 * Your social links. Leave a value "" to hide that link;
 * if all three are "", the whole Connect column is hidden.
 */
const CONNECT = {
  github: "",
  linkedin: "",
  email: "",
};

const EXPLORE = [
  { href: "/", label: "Home" },
  { href: blogsPath(), label: "All blogs" },
  { href: "/categories", label: "Categories" },
  { href: "/trending", label: "Trending" },
];

const linkClass = "hover:text-brand-900 transition-colors";

export function SiteFooter() {
  const connect = [
    CONNECT.github && { href: CONNECT.github, label: "GitHub", external: true },
    CONNECT.linkedin && { href: CONNECT.linkedin, label: "LinkedIn", external: true },
    CONNECT.email && { href: `mailto:${CONNECT.email}`, label: "Email us", external: false },
  ].filter((l) => !!l);

  return (
    <footer className="border-brand-200 bg-brand-50 text-brand-muted text-small border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between lg:gap-16">
          <div className="flex max-w-xs flex-col gap-3">
            <SiteLogo />
            <p>
              Simple, practical articles on programming, web development, cloud and tech careers.
            </p>
          </div>

          {/* Link columns sit together on the right; they line up with the stats line below */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:flex sm:gap-16 lg:gap-20">
            <FooterColumn title="Explore">
              {EXPLORE.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={linkClass}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </FooterColumn>

            <FooterColumn title="Top categories">
              <Suspense fallback={<LinePlaceholders />}>
                <TopCategories />
              </Suspense>
            </FooterColumn>

            {connect.length > 0 && (
              <FooterColumn title="Connect">
                {connect.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className={`${linkClass} inline-flex items-center gap-1.5`}
                    >
                      {!l.external && <Mail className="size-4" aria-hidden />}
                      {l.label}
                      {l.external && <ArrowUpRight className="size-3.5" aria-hidden />}
                    </a>
                  </li>
                ))}
              </FooterColumn>
            )}
          </div>
        </div>

        <div className="border-brand-200 text-caption flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t pt-6">
          <Suspense fallback={<p>© BlogCMS. All rights reserved.</p>}>
            <BottomBar />
          </Suspense>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <nav aria-label={title} className="flex min-w-32 flex-col gap-4">
      <h2 className="text-brand-900 text-caption font-semibold tracking-wider uppercase">
        {title}
      </h2>
      <ul className="flex flex-col gap-2.5">{children}</ul>
    </nav>
  );
}

/** The 5 categories with the most published blogs */
async function TopCategories() {
  const top = [...(await getCategoriesWithBlogs())].sort((a, b) => b.count - a.count).slice(0, 5);

  return (
    <>
      {top.map((c) => (
        <li key={c.id}>
          <Link href={categoryPath(c.slug)} className={linkClass}>
            {c.name}
          </Link>
        </li>
      ))}
      <li>
        <Link href="/categories" className="text-brand-600 font-semibold hover:underline">
          All categories →
        </Link>
      </li>
    </>
  );
}

/** "© 2026 BlogCMS" on the left, "7 blogs · 6 categories · Last updated 14 October 2026" on the right */
async function BottomBar() {
  const [{ blogs, lastPublished }, categories] = await Promise.all([
    getSiteStats(),
    getCategoriesWithBlogs(),
  ]);
  // The year is read after the database call, so it is worked out on every visit (never stuck at build time)
  const year = new Date().getFullYear();

  return (
    <>
      <p>© {year} BlogCMS. All rights reserved.</p>
      {blogs > 0 && (
        <p>
          {blogs.toLocaleString("en-IN")} {blogs === 1 ? "blog" : "blogs"} · {categories.length}{" "}
          {categories.length === 1 ? "category" : "categories"}
          {lastPublished && <> · Last updated {formatDate(lastPublished)}</>}
        </p>
      )}
    </>
  );
}

function LinePlaceholders() {
  return (
    <>
      {[80, 64, 72, 56, 88].map((w) => (
        <li key={w} className="bg-brand-200/60 h-4 animate-pulse rounded" style={{ width: w }} />
      ))}
    </>
  );
}

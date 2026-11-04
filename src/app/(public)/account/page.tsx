import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Bookmark, Heart, MessageCircle } from "lucide-react";
import { LogoutButton } from "@/components/public/account/LogoutButton";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/user-auth";

export const metadata: Metadata = {
  title: "My account | BlogCMS",
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-brand-900 text-display">My account</h1>
      <Suspense fallback={<div className="bg-brand-50 h-64 animate-pulse rounded-2xl" />}>
        <AccountDetails />
      </Suspense>
    </div>
  );
}

async function AccountDetails() {
  const session = await getUser();
  if (!session) redirect("/login?next=/account");

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.userId },
    select: {
      name: true,
      email: true,
      createdAt: true,
      _count: { select: { likes: true, saves: true, comments: true } },
    },
  });
  const joined = user.createdAt.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
  const stats = [
    { label: "Saved", value: user._count.saves, icon: Bookmark, href: "/saved" },
    { label: "Liked", value: user._count.likes, icon: Heart },
    { label: "Comments", value: user._count.comments, icon: MessageCircle },
  ];

  return (
    <div className="flex flex-col gap-6">
      <section className="border-brand-200 flex flex-col gap-5 rounded-2xl border bg-white p-6 sm:flex-row sm:items-center">
        <span
          aria-hidden
          className="bg-brand-100 text-brand-900 text-title flex size-16 shrink-0 items-center justify-center rounded-full"
        >
          {user.name.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-brand-900 text-heading truncate">{user.name}</p>
          <p className="text-brand-muted text-small truncate">{user.email}</p>
          <p className="text-brand-muted text-caption mt-1">Member since {joined}</p>
        </div>
        <LogoutButton />
      </section>

      <section className="grid grid-cols-3 gap-3">
        {stats.map(({ label, value, icon: Icon, href }) => {
          const body = (
            <>
              <Icon className="text-brand-400 size-5" aria-hidden />
              <span className="text-brand-900 text-title">{value}</span>
              <span className="text-brand-muted text-small">{label}</span>
            </>
          );
          const box =
            "border-brand-200 flex flex-col items-start gap-1 rounded-2xl border bg-white p-4 sm:p-5";
          return href ? (
            <Link key={label} href={href} className={`${box} hover:bg-brand-50 transition-colors`}>
              {body}
            </Link>
          ) : (
            <div key={label} className={box}>
              {body}
            </div>
          );
        })}
      </section>
    </div>
  );
}

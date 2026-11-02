"use client"; // Error pages must be client components

import { useEffect } from "react";

/** Shown instead of the page if something breaks (e.g. the database is unreachable). Header and footer stay. */
export default function PublicError({
    error,
    retry,
}: {
    error: Error & { digest?: string };
    retry: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-24 text-center">
            <h1 className="text-brand-900 text-title">Something went wrong</h1>
            <p className="text-brand-muted text-body">We couldn&apos;t load this page. Please try again.</p>
            <button
                type="button"
                onClick={() => retry()}
                className="bg-brand-600 hover:bg-brand-700 inline-flex min-h-11 items-center rounded-lg px-5 text-small font-semibold text-white"
            >
                Try again
            </button>
        </div>
    );
}
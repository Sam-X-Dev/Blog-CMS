"use client";

import { useState } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api-client";

/** What each switch controls */
const KINDS = {
    trending: {
        url: (id: string) => `/api/trending/${id}`,
        field: "isTrending",
        label: "Editor's pick",
        on: "Added to Trending",
        off: "Removed from Trending",
    },
    featured: {
        url: (id: string) => `/api/featured/${id}`,
        field: "isFeatured",
        label: "Homepage featured",
        on: "Featured on the homepage",
        off: "Removed from the homepage",
    },
} as const;

/** On/off switch for Editor's picks (Trending page) or the homepage featured blog. */
export function TrendingToggle({
    blogId,
    title,
    initial,
    kind = "trending",
}: {
    blogId: string;
    title: string;
    initial: boolean;
    kind?: keyof typeof KINDS;
}) {
    const [on, setOn] = useState(initial);
    const [saving, setSaving] = useState(false);
    const k = KINDS[kind];

    async function toggle() {
        const next = !on;
        setOn(next); // update the switch right away
        setSaving(true);
        try {
            await apiFetch(k.url(blogId), {
                method: "PATCH",
                body: JSON.stringify({ [k.field]: next }),
            });
            toast.success(next ? k.on : k.off);
        } catch (err) {
            setOn(!next); // put it back if saving failed
            toast.error(err instanceof Error ? err.message : "Could not update");
        } finally {
            setSaving(false);
        }
    }

    return (
        <button
            type="button"
            role="switch"
            aria-checked={on}
            aria-label={`${k.label}: ${title}`}
            onClick={toggle}
            disabled={saving}
            className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors disabled:opacity-60 ${on ? "bg-brand-600" : "bg-brand-200"
                }`}
        >
            <span
                className={`inline-block size-5 rounded-full bg-white shadow transition-transform ${on ? "translate-x-6" : "translate-x-1"
                    }`}
            />
        </button>
    );
}

"use client";

import { useState } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api-client";

/** On/off switch that adds or removes a blog from Editor's picks. */
export function TrendingToggle({
    blogId,
    title,
    initial,
}: {
    blogId: string;
    title: string;
    initial: boolean;
}) {
    const [on, setOn] = useState(initial);
    const [saving, setSaving] = useState(false);

    async function toggle() {
        const next = !on;
        setOn(next); // update the switch right away
        setSaving(true);
        try {
            await apiFetch(`/api/trending/${blogId}`, {
                method: "PATCH",
                body: JSON.stringify({ isTrending: next }),
            });
            toast.success(next ? "Added to Trending" : "Removed from Trending");
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
            aria-label={`Editor's pick: ${title}`}
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
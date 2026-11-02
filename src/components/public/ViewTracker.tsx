"use client";

import { useEffect } from "react";

/**
 * Counts one view when a blog page opens (once per browser tab, so refreshing doesn't add more).
 * Samarth: put <ViewTracker blogId={blog.id} /> anywhere on the blog details page. It shows nothing.
 */
export function ViewTracker({ blogId }: { blogId: string }) {
    useEffect(() => {
        const key = `viewed:${blogId}`;
        try {
            if (sessionStorage.getItem(key)) return;
            sessionStorage.setItem(key, "1");
        } catch {
            // Private mode can block sessionStorage; still count the view
        }

        fetch("/api/views", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ blogId }),
            keepalive: true,
        }).catch(() => {
            // A missed view is not worth bothering the reader about
        });
    }, [blogId]);

    return null;
}
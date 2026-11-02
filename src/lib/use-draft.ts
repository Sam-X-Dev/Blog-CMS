"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type Fields = Record<string, string>;
type Stored<T> = { data: T; savedAt: number };

const isEmpty = (fields: Fields) => Object.values(fields).every((v) => !v.trim());

function read<T extends Fields>(key: string): Stored<T> | null {
    try {
        const raw = localStorage.getItem(key);
        return raw ? (JSON.parse(raw) as Stored<T>) : null;
    } catch {
        return null; // private mode or broken data: just start fresh
    }
}

/**
 * Keeps unsaved form fields in this browser, so a refresh or a closed tab doesn't lose the work.
 *
 *   const { savedAt, clear } = useDraft("blog-draft:new", { title, description, content }, (d) => {
 *     setTitle(d.title); setDescription(d.description); setContent(d.content);
 *   });
 *   // after the blog is saved to the database: clear();
 *
 * key:   one per blog, e.g. "blog-draft:new" or `blog-draft:${blog.id}`
 * since: (edit page) the blog's updatedAt time, so an older draft never replaces newer saved work
 */
export function useDraft<T extends Fields>(
    key: string,
    fields: T,
    restore: (draft: T) => void,
    since?: number,
) {
    const [savedAt, setSavedAt] = useState<number | null>(null);
    const ready = useRef(false); // don't save until we've checked for an old draft
    const restoreRef = useRef(restore);
    useEffect(() => {
        restoreRef.current = restore;
    });

    // 1. On page load: bring back the draft (once, also in React's dev double-run)
    useEffect(() => {
        if (ready.current) return;
        const stored = read<T>(key);
        const usable = stored && !isEmpty(stored.data) && (!since || stored.savedAt > since);

        // Run after this render so React doesn't warn about updating state inside an effect
        const timer = setTimeout(() => {
            if (usable) {
                restoreRef.current(stored.data);
                setSavedAt(stored.savedAt);
                toast("Unsaved draft restored", {
                    description: "Your last changes on this device were brought back.",
                    action: {
                        label: "Discard",
                        onClick: () => {
                            localStorage.removeItem(key);
                            setSavedAt(null);
                            restoreRef.current(
                                Object.fromEntries(Object.keys(stored.data).map((k) => [k, ""])) as T,
                            );
                        },
                    },
                });
            }
            ready.current = true;
        }, 0);
        return () => clearTimeout(timer);
    }, [key, since]);

    // 2. Every change: save half a second after typing stops
    const snapshot = JSON.stringify(fields);
    useEffect(() => {
        if (!ready.current) return;
        const timer = setTimeout(() => {
            try {
                const data = JSON.parse(snapshot) as T;
                if (isEmpty(data)) {
                    localStorage.removeItem(key);
                    setSavedAt(null);
                } else {
                    const now = Date.now();
                    localStorage.setItem(key, JSON.stringify({ data, savedAt: now } satisfies Stored<T>));
                    setSavedAt(now);
                }
            } catch {
                // Storage full or blocked: the editor still works, it just can't keep a backup
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [key, snapshot]);

    // 3. Call after the blog is saved to the database
    const clear = useCallback(() => {
        try {
            localStorage.removeItem(key);
        } catch {
            // nothing to clear
        }
        setSavedAt(null);
    }, [key]);

    return { savedAt, clear };
}
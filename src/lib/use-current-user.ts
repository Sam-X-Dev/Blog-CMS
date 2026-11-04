"use client";

import { useEffect, useSyncExternalStore } from "react";

export type CurrentUser = { name: string; email: string };
type State = { status: "loading" | "in" | "out"; user: CurrentUser | null };

// One shared copy for the whole page, so the header, like button and comments agree
let state: State = { status: "loading", user: null };
let request: Promise<void> | null = null;
const listeners = new Set<() => void>();

function set(next: State) {
  state = next;
  listeners.forEach((l) => l());
}

function load(force = false) {
  if (request && !force) return request;
  request = fetch("/api/users/me", { cache: "no-store" })
    .then((r) => r.json())
    .then((json) =>
      set(json?.data ? { status: "in", user: json.data } : { status: "out", user: null })
    )
    .catch(() => set({ status: "out", user: null }));
  return request;
}

/** The logged-in reader ("loading" until checked once). */
export function useCurrentUser() {
  const current = useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
    () => state
  );
  useEffect(() => {
    load();
  }, []);
  return current;
}

/** Call after logging in or out so every part of the page updates. */
export function refreshCurrentUser() {
  return load(true);
}

export function markLoggedOut() {
  request = Promise.resolve();
  set({ status: "out", user: null });
}

/** Login page link that brings the reader back to this page afterwards. */
export function loginHref(path?: string) {
  const here = path ?? (typeof window !== "undefined" ? window.location.pathname : "/");
  return `/login?next=${encodeURIComponent(here)}`;
}

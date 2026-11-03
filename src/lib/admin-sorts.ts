// Shared by the admin blog list (server) and its filter bar (browser).
export const ADMIN_SORTS = [
  { id: "updated", label: "Last edited" },
  { id: "newest", label: "Newest" },
  { id: "oldest", label: "Oldest" },
  { id: "title", label: "Title A to Z" },
] as const;

export type AdminSort = (typeof ADMIN_SORTS)[number]["id"];

/** "Published" (green) or "Draft" (amber) pill. */
export function StatusBadge({ status }: { status: "DRAFT" | "PUBLISHED" }) {
  const published = status === "PUBLISHED";
  return (
    <span
      className={`text-caption inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold ${
        published
          ? "bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-300"
          : "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300"
      }`}
    >
      <span className={`size-1.5 rounded-full ${published ? "bg-green-600" : "bg-amber-500"}`} />
      {published ? "Published" : "Draft"}
    </span>
  );
}

/**
 * Font choices in the editor (Home → Font). "Default" = the website font (Inter).
 * Roboto and Poppins are loaded by the root layout (only downloaded when a blog uses them).
 * The sanitizer only keeps these exact fonts and sizes.
 */
export const FONT_FAMILIES = [
  { label: "Default", value: "" },
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Roboto", value: "var(--font-roboto), Roboto, Arial, sans-serif" },
  { label: "Poppins", value: "var(--font-poppins), Poppins, Arial, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Times New Roman", value: "'Times New Roman', Times, serif" },
  { label: "Courier New", value: "'Courier New', Courier, monospace" },
];

export const FONT_SIZES = [
  { label: "Small", value: "14px" },
  { label: "Normal", value: "" },
  { label: "Large", value: "20px" },
  { label: "Extra Large", value: "26px" },
];

/** Same font written slightly differently ('Times' vs "Times") counts as the same. */
export const normalizeFont = (v: string) => v.replace(/['"\s]/g, "").toLowerCase();


/** Office-style colour grid: 10 columns × 3 rows */
export const TEXT_COLORS = [
  "#000000", "#434343", "#666666", "#999999", "#b7b7b7", "#cccccc", "#d9d9d9", "#efefef", "#f3f3f3", "#ffffff",
  "#c00000", "#ff0000", "#ffc000", "#ffff00", "#92d050", "#00b050", "#00b0f0", "#0070c0", "#002060", "#7030a0",
  "#9b2c2c", "#c05621", "#b7791f", "#2f855a", "#2c7a7b", "#2b6cb0", "#4c51bf", "#6b46c1", "#b83280", "#1a202c",
];

export const HIGHLIGHT_COLORS = [
  "#fef08a", "#bbf7d0", "#a5f3fc", "#bfdbfe", "#ddd6fe", "#fbcfe8", "#fecaca", "#fed7aa", "#e5e7eb", "#d9f99d",
];

/**
 * Typography for blog content. Used by BOTH the editor page and the public blog page,
 * so what the writer sees is exactly what the reader sees.
 */
export const BLOG_PROSE_CLASS =
  "prose prose-brand max-w-none dark:prose-invert prose-h1:text-display prose-h2:text-title prose-h3:text-heading prose-p:text-body prose-li:text-body prose-strong:text-inherit prose-code:text-inherit prose-code:font-medium prose-code:before:content-none prose-code:after:content-none [&_:not(pre)>code]:bg-brand-50 [&_:not(pre)>code]:rounded [&_:not(pre)>code]:px-1.5 [&_:not(pre)>code]:py-0.5 prose-a:text-brand-600 prose-img:rounded-lg prose-figcaption:text-center prose-figcaption:text-caption [&_img[alt^='Sticker:']]:w-44 [&_img[alt^='Sticker:']]:rounded-none prose-table:my-4 prose-table:border-collapse prose-th:border prose-th:border-brand-200 prose-th:bg-brand-50 prose-th:px-3 prose-th:py-2 prose-td:border prose-td:border-brand-200 prose-td:px-3 prose-td:py-2 [&_td>p]:m-0 [&_th>p]:m-0";

/** Emoji picker in Insert → Emoji. Plain characters, so they work everywhere. */
export const EMOJI_GROUPS = [
  {
    label: "Smileys",
    items: ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "😉", "😍", "🥰", "😘", "😋", "😎", "🤩", "🥳", "🤔", "🤨", "😐", "😴", "😮", "😢", "😭", "😡", "🤯", "😱", "🥺"],
  },
  {
    label: "Hands",
    items: ["👍", "👎", "👏", "🙌", "🙏", "🤝", "👋", "✌️", "🤞", "👌", "💪", "👉", "👆", "✍️", "🫶"],
  },
  {
    label: "Objects",
    items: ["💻", "🖥️", "📱", "⌨️", "🖱️", "💾", "📊", "📈", "📉", "🗂️", "📝", "📌", "📎", "🔗", "🔒", "🔑", "⚙️", "🛠️", "🧪", "📚", "💡", "🔍", "☁️", "🚀"],
  },
  {
    label: "Symbols",
    items: ["✅", "❌", "⚠️", "❗", "❓", "⭐", "🌟", "✨", "🔥", "💯", "🎉", "🎯", "❤️", "💜", "💙", "💚", "🧡", "💛", "➡️", "⬅️", "⬆️", "⬇️", "🆕", "🆗"],
  },
] as const;

/** Stickers in Insert → Sticker. The files live in /public/stickers. */
export const STICKERS = [
  { file: "thank-you.svg", label: "Thank you" },
  { file: "pro-tip.svg", label: "Pro tip" },
  { file: "must-read.svg", label: "Must read" },
  { file: "new.svg", label: "New" },
  { file: "hot-take.svg", label: "Hot take" },
  { file: "did-you-know.svg", label: "Did you know?" },
  { file: "well-done.svg", label: "Well done" },
  { file: "heads-up.svg", label: "Heads up" },
] as const;

// Shared options for the blog editor (admin) and the blog content (public site).
// Keep this list short and curated so every blog still looks clean on the website.

export type FontOption = { label: string; value: string };

/** "" = Default = the website's own font */
export const FONT_FAMILIES: FontOption[] = [
  { label: "Default", value: "" },
  // Google Fonts (loaded by GOOGLE_FONTS_URL below)
  { label: "Inter", value: "Inter, sans-serif" },
  { label: "Roboto", value: "Roboto, sans-serif" },
  { label: "Open Sans", value: '"Open Sans", sans-serif' },
  { label: "Poppins", value: "Poppins, sans-serif" },
  { label: "Montserrat", value: "Montserrat, sans-serif" },
  { label: "Lato", value: "Lato, sans-serif" },
  { label: "Merriweather", value: "Merriweather, serif" },
  { label: "Lora", value: "Lora, serif" },
  { label: "Playfair Display", value: '"Playfair Display", serif' },
  { label: "Noto Sans Devanagari (Hindi)", value: '"Noto Sans Devanagari", sans-serif' },
  // Fonts already on every computer
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Times New Roman", value: '"Times New Roman", Times, serif' },
  { label: "Courier New", value: '"Courier New", Courier, monospace' },
];

/** One stylesheet for all the Google Fonts above (regular + bold). */
export const GOOGLE_FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Roboto:wght@400;700&family=Open+Sans:wght@400;700&family=Poppins:wght@400;700&family=Montserrat:wght@400;700&family=Lato:wght@400;700&family=Merriweather:wght@400;700&family=Lora:wght@400;700&family=Playfair+Display:wght@400;700&family=Noto+Sans+Devanagari:wght@400;700&display=swap";

/** Font sizes in px. "" = Default size. */
export const FONT_SIZES = ["", "12", "14", "16", "18", "20", "24", "28", "32", "36", "48"];

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
  "prose prose-zinc max-w-none dark:prose-invert prose-headings:font-semibold prose-strong:text-inherit prose-code:text-inherit prose-a:text-indigo-600 prose-img:rounded-lg prose-table:my-4 prose-table:border-collapse prose-th:border prose-th:border-zinc-300 prose-th:bg-zinc-50 prose-th:px-3 prose-th:py-2 prose-td:border prose-td:border-zinc-300 prose-td:px-3 prose-td:py-2 dark:prose-th:border-zinc-700 dark:prose-th:bg-zinc-800 dark:prose-td:border-zinc-700 [&_td>p]:m-0 [&_th>p]:m-0";
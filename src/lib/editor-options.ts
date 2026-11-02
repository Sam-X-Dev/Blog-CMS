// Fonts and sizes are NOT options: every blog uses the website type scale (see globals.css).

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
  "prose prose-brand max-w-none dark:prose-invert prose-h1:text-display prose-h2:text-title prose-h3:text-heading prose-p:text-body prose-li:text-body prose-strong:text-inherit prose-code:text-inherit prose-a:text-brand-600 prose-img:rounded-lg prose-table:my-4 prose-table:border-collapse prose-th:border prose-th:border-brand-200 prose-th:bg-brand-50 prose-th:px-3 prose-th:py-2 prose-td:border prose-td:border-brand-200 prose-td:px-3 prose-td:py-2 dark:prose-th:border-brand-700 dark:prose-th:bg-[#1A120C] dark:prose-td:border-brand-700 [&_td>p]:m-0 [&_th>p]:m-0";
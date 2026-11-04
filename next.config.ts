import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Keep the dev "N" badge away from the admin sidebar buttons (bottom-left)
  devIndicators: { position: "bottom-right" },
  // The PRD's suggested admin URLs also work
  async redirects() {
    return [
      { source: "/admin/dashboard", destination: "/admin", permanent: false },
      { source: "/admin/blogs/create", destination: "/admin/blogs/new", permanent: false },
      { source: "/admin/blogs/edit/:id", destination: "/admin/blogs/:id/edit", permanent: false },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

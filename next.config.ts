import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // The app is mostly client-side state (trips, bookings) with static island data,
  // so Cache Components' strict prerender rules add friction without benefit here.
  cacheComponents: false,
  async headers() {
    return [
      {
        // The service worker must never be cached, or phones keep an old version forever.
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
      {
        source: "/photos/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
  turbopack: {
    root: path.resolve(__dirname),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

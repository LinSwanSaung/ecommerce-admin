import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Off: TanStack Table mutates one stable `table` instance instead of
  // creating new objects, so the compiler's auto-memoization never sees it
  // "change" and table UI (rows, column visibility) goes stale.
  reactCompiler: false,
  // mock product images are hand-picked Wikimedia Commons photos
  images: {
    remotePatterns: [{ protocol: "https", hostname: "upload.wikimedia.org" }],
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Off: TanStack Table mutates one stable `table` instance instead of
  // creating new objects, so the compiler's auto-memoization never sees it
  // "change" and table UI (rows, column visibility) goes stale.
  reactCompiler: false,
  // mock product images come from a placeholder service
  images: {
    remotePatterns: [{ protocol: "https", hostname: "picsum.photos" }],
  },
};

export default nextConfig;

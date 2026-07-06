import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Off: TanStack Table mutates one stable `table` instance instead of
  // creating new objects, so the compiler's auto-memoization never sees it
  // "change" and table UI (rows, column visibility) goes stale.
  reactCompiler: false,
};

export default nextConfig;

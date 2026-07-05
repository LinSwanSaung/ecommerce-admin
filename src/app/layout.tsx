import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

import { Providers } from "./providers";
import { AppShell } from "@/components/layout/app-shell";

// next/font self-hosts Outfit and exposes it as `--font-outfit` for globals.css.
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  // `template` gives every page a consistent "Page | Acme Admin" browser title.
  title: { default: "Acme Admin", template: "%s | Acme Admin" },
  description: "Internal ecommerce admin panel",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // suppressHydrationWarning: next-themes sets the `class` on <html> before
    // React hydrates, so the server/client mismatch on that attribute is expected.
    <html
      lang="en"
      suppressHydrationWarning
      className={`${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}

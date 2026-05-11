import type { Metadata } from "next";
import { AppProviders } from "@/components/app-providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Startup Graveyard",
  description:
    "Browse failed startups, learn what went wrong, and pay your respects.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full overflow-x-clip antialiased"
    >
      <body className="flex min-h-full min-w-0 flex-col overflow-x-clip">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

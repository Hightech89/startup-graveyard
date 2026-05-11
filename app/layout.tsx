import type { Metadata } from "next";
import { AppProviders } from "@/components/app-providers";
import { getSiteUrl } from "@/src/lib/site-url";
import "./globals.css";

const siteName = "Startup Graveyard";
const description =
  "Browse failed startups, learn what went wrong, and pay your respects.";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  applicationName: siteName,
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName,
    title: siteName,
    description,
  },
  twitter: {
    card: "summary",
    title: siteName,
    description,
  },
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

import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/src/lib/site-url";
import { supabase } from "@/src/lib/supabase";

type StartupSitemapRow = {
  id: string;
  created_at: string | null;
};

function route(siteUrl: string, path: string) {
  return `${siteUrl}${path}`;
}

function dateOrNow(value: string | null) {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date : new Date();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: route(siteUrl, "/"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: route(siteUrl, "/submit"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  const { data, error } = await supabase
    .from("startups")
    .select("id, created_at")
    .order("created_at", { ascending: false });

  if (error || !data) return staticRoutes;

  const startupRoutes = (data as StartupSitemapRow[]).map((startup) => ({
    url: route(siteUrl, `/startups/${startup.id}`),
    lastModified: dateOrNow(startup.created_at),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...startupRoutes];
}

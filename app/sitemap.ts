import type { MetadataRoute } from "next";
import { SITE_URL, articlePath, getArticles } from "@/lib/articles.ts";

export const revalidate = 600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getArticles(500);
  return [
    { url: SITE_URL, changeFrequency: "hourly", priority: 1 },
    ...articles.map((a) => ({
      url: `${SITE_URL}${articlePath(a.slug)}`,
      lastModified: a.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
  ];
}

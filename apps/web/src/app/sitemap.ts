import type { MetadataRoute } from "next";
import { fetchPublishedArticles, translationFor } from "@/lib/api";

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const [en, kn] = await Promise.all([
    fetchPublishedArticles("en", 100),
    fetchPublishedArticles("kn", 100)
  ]);

  const articleEntries: MetadataRoute.Sitemap = [
    ...en.map((article) => ({
      url: `${base}/en/news/${translationFor(article, "en")?.slug || article.slug}`,
      lastModified: article.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.8
    })),
    ...kn.map((article) => ({
      url: `${base}/kn/news/${translationFor(article, "kn")?.slug || article.slug}`,
      lastModified: article.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.8
    }))
  ];

  return [
    { url: `${base}/en`, changeFrequency: "hourly", priority: 1 },
    { url: `${base}/kn`, changeFrequency: "hourly", priority: 1 },
    { url: `${base}/en/karnataka`, changeFrequency: "hourly", priority: .9 },
    { url: `${base}/kn/karnataka`, changeFrequency: "hourly", priority: .9 },
    ...articleEntries
  ];
}

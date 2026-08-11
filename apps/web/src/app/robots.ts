import type { MetadataRoute } from "next";

/**
 * Preview/demo deployments must not be indexed — a client demo on a *.vercel.app
 * URL showing seeded articles should never turn up in search results. Indexing
 * switches on automatically once NEXT_PUBLIC_SITE_URL points at a real domain,
 * or immediately if NEXT_PUBLIC_ALLOW_INDEXING=true.
 */
export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  const isPreviewHost = !siteUrl || /\.vercel\.app$|\.onrender\.com$|localhost/.test(siteUrl);
  const allowIndexing = process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true" || !isPreviewHost;

  if (!allowIndexing) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/admin/"] }],
    sitemap: `${siteUrl}/sitemap.xml`
  };
}

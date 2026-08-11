/**
 * Shared types + base URL for the NestJS API. Used by both server components
 * (public site) and the admin client.
 */

const ORIGIN = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

/** Always ends in `/api`, whether or not the env var already includes it. */
export const API_BASE = ORIGIN.replace(/\/$/, "").endsWith("/api")
  ? ORIGIN.replace(/\/$/, "")
  : `${ORIGIN.replace(/\/$/, "")}/api`;

export const ARTICLE_STATUSES = [
  "DRAFT",
  "REVIEW",
  "APPROVED",
  "SCHEDULED",
  "PUBLISHED",
  "REJECTED",
  "ARCHIVED"
] as const;

export type ArticleStatus = (typeof ARTICLE_STATUSES)[number];

export type PersonRef = { id: string; name: string; email?: string } | null;

export type Translation = {
  id: string;
  languageId: string;
  title: string;
  subtitle: string | null;
  body: string;
  slug: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
};

export type Article = {
  id: string;
  slug: string;
  status: ArticleStatus;
  featuredImage: string | null;
  publishedAt: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  scheduledAt: string | null;
  reviewNote: string | null;
  createdAt: string;
  updatedAt: string;
  readingMinutes: number;
  isBreaking: boolean;
  isFeatured: boolean;
  category: { id: string; slug: string; name: string } | null;
  district: { id: string; slug: string; nameEn: string; nameKn: string } | null;
  author: PersonRef;
  reporter?: PersonRef;
  submittedBy?: PersonRef;
  reviewedBy?: PersonRef;
  publishedBy?: PersonRef;
  tags?: { id: string; slug: string; name: string }[];
  seo?: { canonicalUrl: string | null; ogImage: string | null } | null;
  translations: Translation[];
  auditLogs?: AuditEntry[];
};

export type AuditEntry = {
  id: string;
  action: string;
  oldStatus: ArticleStatus | null;
  newStatus: ArticleStatus | null;
  note: string | null;
  createdAt: string;
  actor?: PersonRef;
};

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  roles: string[];
  permissions: string[];
};

export const STATUS_LABEL: Record<ArticleStatus, string> = {
  DRAFT: "Draft",
  REVIEW: "Pending Review",
  APPROVED: "Approved",
  SCHEDULED: "Scheduled",
  PUBLISHED: "Published",
  REJECTED: "Rejected",
  ARCHIVED: "Archived"
};

export const STATUS_STYLE: Record<ArticleStatus, string> = {
  DRAFT: "bg-neutral-100 text-neutral-700 border-neutral-200",
  REVIEW: "bg-amber-50 text-amber-800 border-amber-200",
  APPROVED: "bg-emerald-50 text-emerald-800 border-emerald-200",
  SCHEDULED: "bg-sky-50 text-sky-800 border-sky-200",
  PUBLISHED: "bg-green-600/10 text-green-800 border-green-600/20",
  REJECTED: "bg-red-50 text-red-800 border-red-200",
  ARCHIVED: "bg-neutral-100 text-neutral-500 border-neutral-200"
};

export function translationFor(article: Article, languageId: "en" | "kn") {
  return article.translations?.find((item) => item.languageId === languageId);
}

export type CategoryRef = { id: string; slug: string; name: string; articleCount: number };
export type DistrictRef = { id: string; slug: string; nameEn: string; nameKn: string; articleCount: number };

/** Public read of published articles — server side, no auth. */
export async function fetchPublishedArticles(
  locale: string,
  limit = 20,
  filters: {
    category?: string;
    district?: string;
    featured?: boolean;
    exclude?: string;
    search?: string;
  } = {}
): Promise<Article[]> {
  const query = new URLSearchParams({ locale, limit: String(limit) });
  if (filters.category) query.set("category", filters.category);
  if (filters.district) query.set("district", filters.district);
  if (filters.featured) query.set("featured", "true");
  if (filters.exclude) query.set("exclude", filters.exclude);
  if (filters.search) query.set("q", filters.search);

  try {
    const response = await fetch(`${API_BASE}/articles?${query}`, { next: { revalidate: 60 } });
    if (!response.ok) return [];
    return (await response.json()) as Article[];
  } catch {
    // The site must still render when the API is down.
    return [];
  }
}

export async function fetchCategories(): Promise<CategoryRef[]> {
  try {
    const response = await fetch(`${API_BASE}/categories`, { next: { revalidate: 300 } });
    if (!response.ok) return [];
    return (await response.json()) as CategoryRef[];
  } catch {
    return [];
  }
}

export async function fetchDistricts(): Promise<DistrictRef[]> {
  try {
    const response = await fetch(`${API_BASE}/districts`, { next: { revalidate: 300 } });
    if (!response.ok) return [];
    return (await response.json()) as DistrictRef[];
  } catch {
    return [];
  }
}

export async function fetchPublishedArticle(slug: string, locale: string): Promise<Article | null> {
  try {
    const response = await fetch(
      `${API_BASE}/articles/${encodeURIComponent(slug)}?locale=${locale}`,
      { next: { revalidate: 60 } }
    );
    if (!response.ok) return null;
    return (await response.json()) as Article;
  } catch {
    return null;
  }
}

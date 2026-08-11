import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";
import { notFound } from "next/navigation";

import { fetchPublishedArticle, translationFor } from "@/lib/api";
import { getMessages, isLocale, type Locale } from "@/i18n";

type PageProps = { params: Promise<{ locale: string; slug: string }> };

export const revalidate = 60;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};

  const article = await fetchPublishedArticle(slug, locale);
  const translation = article ? translationFor(article, locale) : undefined;
  if (!article || !translation) return { title: "Article not found" };

  const otherLocale: Locale = locale === "en" ? "kn" : "en";
  const other = translationFor(article, otherLocale);

  return {
    title: translation.seoTitle || translation.title,
    description: translation.seoDescription || translation.subtitle || undefined,
    alternates: {
      canonical: article.seo?.canonicalUrl || `/${locale}/news/${translation.slug || article.slug}`,
      languages: {
        en: `/en/news/${(locale === "en" ? translation : other)?.slug || article.slug}`,
        kn: `/kn/news/${(locale === "kn" ? translation : other)?.slug || article.slug}`
      }
    },
    openGraph: {
      title: translation.ogTitle || translation.title,
      description: translation.ogDescription || translation.seoDescription || undefined,
      images: article.seo?.ogImage || article.featuredImage || undefined,
      type: "article",
      publishedTime: article.publishedAt || undefined
    }
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const article = await fetchPublishedArticle(slug, locale);
  const translation = article ? translationFor(article, locale) : undefined;
  // Only PUBLISHED articles are ever returned by the API; anything else 404s.
  if (!article || !translation) notFound();

  const t = getMessages(locale as Locale);
  const otherLocale: Locale = locale === "en" ? "kn" : "en";
  const otherTranslation = translationFor(article, otherLocale);
  const districtName = article.district ? (locale === "kn" ? article.district.nameKn : article.district.nameEn) : null;

  return (
    <main className={`min-w-0 ${locale === "kn" ? "font-kannada" : ""}`}>
      <header className="border-b border-black/10 bg-white">
        <div className="container-news flex min-w-0 items-center gap-3 py-4">
          <Link href={`/${locale}` as Route} className="mr-auto min-w-0 truncate text-2xl font-black">
            <span className="text-brand-600">{t.brandKannada}</span> {t.brandSuffix}
          </Link>
          {otherTranslation && (
            <Link
              href={`/${otherLocale}/news/${otherTranslation.slug || article.slug}` as Route}
              className="shrink-0 rounded-lg bg-black px-3 py-2 text-xs font-bold text-white"
            >
              {otherLocale === "kn" ? "ಕನ್ನಡ" : "EN"}
            </Link>
          )}
        </div>
      </header>

      <article className="container-news min-w-0 py-8">
        <div className="eyebrow">{article.category?.name}</div>
        <h1 className="headline mt-2 break-words text-3xl leading-tight sm:text-4xl md:text-5xl">
          {translation.title}
        </h1>
        {translation.subtitle && <p className="mt-3 text-lg text-black/60">{translation.subtitle}</p>}

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-y py-3 text-xs font-semibold text-black/50">
          <span>{article.author?.name}</span>
          {districtName && <span>{districtName}</span>}
          {article.publishedAt && <time dateTime={article.publishedAt}>{formatDate(article.publishedAt, locale)}</time>}
          <span>
            {article.readingMinutes} {t.minutesRead}
          </span>
        </div>

        {article.featuredImage && (
          // Editors supply arbitrary CDN URLs, which next/image cannot whitelist ahead of time.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={article.featuredImage} alt="" className="mt-6 h-auto w-full rounded-lg object-cover" />
        )}

        <div className="prose mt-6 max-w-none whitespace-pre-wrap break-words text-[17px] leading-relaxed">
          {translation.body}
        </div>

        {Boolean(article.tags?.length) && (
          <div className="mt-8 flex flex-wrap gap-2 border-t pt-5">
            {article.tags?.map((tag) => (
              <span key={tag.id} className="rounded-full border px-3 py-1 text-xs font-semibold">
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </article>
    </main>
  );
}

function formatDate(value: string, locale: string) {
  return new Date(value).toLocaleDateString(locale === "kn" ? "kn-IN" : "en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

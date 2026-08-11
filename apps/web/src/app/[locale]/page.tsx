import { HomePage, type NewsItem } from "@/components/home-page";
import { getMessages, isLocale, type Locale } from "@/i18n";
import { fetchPublishedArticles, translationFor } from "@/lib/api";
import { notFound } from "next/navigation";

export const revalidate = 60;

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  // Published articles come from NestJS/PostgreSQL; the static demo layout is
  // only used when the API returns nothing.
  const published = await fetchPublishedArticles(locale, 12);
  const articles: NewsItem[] = published.flatMap((article) => {
    const translation = translationFor(article, locale as Locale);
    if (!translation) return [];
    return [
      {
        id: article.id,
        slug: translation.slug || article.slug,
        title: translation.title,
        subtitle: translation.subtitle || "",
        category: article.category?.name || "",
        image: article.featuredImage || "",
        publishedAt: article.publishedAt
      }
    ];
  });

  return <HomePage locale={locale} messages={getMessages(locale as Locale)} articles={articles} />;
}

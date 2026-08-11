import { notFound } from "next/navigation";

import { HomePage, type NewsItem } from "@/components/home-page";
import { getMessages, isLocale, type Locale } from "@/i18n";
import { fetchCategories, fetchDistricts, fetchPublishedArticles, translationFor } from "@/lib/api";

export const revalidate = 60;

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  // Everything on the homepage comes from NestJS/PostgreSQL.
  const [published, categories, districts] = await Promise.all([
    fetchPublishedArticles(locale, 24),
    fetchCategories(),
    fetchDistricts()
  ]);

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
        categorySlug: article.category?.slug || "",
        district: article.district ? (locale === "kn" ? article.district.nameKn : article.district.nameEn) : null,
        districtSlug: article.district?.slug || null,
        image: article.featuredImage || "",
        publishedAt: article.publishedAt,
        readingMinutes: article.readingMinutes ?? 4,
        isBreaking: article.isBreaking
      }
    ];
  });

  return (
    <HomePage
      locale={locale}
      messages={getMessages(locale as Locale)}
      articles={articles}
      categories={categories}
      districts={districts}
    />
  );
}

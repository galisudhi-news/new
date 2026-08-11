import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleListPage } from "@/components/article-list-page";
import { getMessages, isLocale, type Locale } from "@/i18n";
import { fetchCategories, fetchPublishedArticles } from "@/lib/api";

type PageProps = { params: Promise<{ locale: string; slug: string }> };

export const revalidate = 60;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const category = (await fetchCategories()).find((item) => item.slug === slug);
  return { title: category?.name ?? slug };
}

export default async function CategoryPage({ params }: PageProps) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const [categories, articles] = await Promise.all([
    fetchCategories(),
    fetchPublishedArticles(locale, 40, { category: slug })
  ]);

  const category = categories.find((item) => item.slug === slug);
  // Unknown category with no published articles is a 404, not an empty page.
  if (!category && articles.length === 0) notFound();

  const t = getMessages(locale as Locale);

  return (
    <ArticleListPage
      locale={locale as Locale}
      eyebrow={t.sections}
      title={category?.name ?? slug}
      articles={articles}
      emptyMessage={t.noArticlesBody}
    />
  );
}

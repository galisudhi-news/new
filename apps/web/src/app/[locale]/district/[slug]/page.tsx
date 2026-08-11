import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleListPage } from "@/components/article-list-page";
import { getMessages, isLocale, type Locale } from "@/i18n";
import { fetchDistricts, fetchPublishedArticles } from "@/lib/api";

type PageProps = { params: Promise<{ locale: string; slug: string }> };

export const revalidate = 60;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const district = (await fetchDistricts()).find((item) => item.slug === slug);
  if (!district) return { title: slug };
  return { title: locale === "kn" ? district.nameKn : district.nameEn };
}

export default async function DistrictPage({ params }: PageProps) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const [districts, articles] = await Promise.all([
    fetchDistricts(),
    fetchPublishedArticles(locale, 40, { district: slug })
  ]);

  const district = districts.find((item) => item.slug === slug);
  if (!district && articles.length === 0) notFound();

  const t = getMessages(locale as Locale);
  const name = district ? (locale === "kn" ? district.nameKn : district.nameEn) : slug;

  return (
    <ArticleListPage
      locale={locale as Locale}
      eyebrow={t.districtNews}
      title={name}
      articles={articles}
      emptyMessage={t.noArticlesBody}
    />
  );
}

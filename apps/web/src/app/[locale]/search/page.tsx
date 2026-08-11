import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleListPage } from "@/components/article-list-page";
import { getMessages, isLocale, type Locale } from "@/i18n";
import { fetchPublishedArticles } from "@/lib/api";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: getMessages(locale as Locale).searchTitle, robots: { index: false } };
}

export default async function SearchPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const { q } = await searchParams;
  const query = (q || "").trim();
  const t = getMessages(locale as Locale);
  const articles = query ? await fetchPublishedArticles(locale, 40, { search: query }) : [];

  return (
    <ArticleListPage
      locale={locale as Locale}
      eyebrow={t.searchTitle}
      title={query ? `${t.resultsFor} “${query}”` : t.searchTitle}
      articles={articles}
      emptyMessage={query ? t.searchNoResults : t.searchPrompt}
    >
      <form action={`/${locale}/search`} method="get" className="mt-6 flex max-w-xl gap-2">
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder={t.searchPlaceholder}
          className="w-full rounded-lg border px-4 py-2.5"
        />
        <button className="shrink-0 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-bold text-white">
          {t.searchTitle}
        </button>
      </form>
    </ArticleListPage>
  );
}

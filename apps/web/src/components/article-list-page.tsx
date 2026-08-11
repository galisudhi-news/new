import Link from "next/link";
import type { Route } from "next";

import { getMessages, type Locale } from "@/i18n";
import type { Article } from "@/lib/api";
import { translationFor } from "@/lib/api";
import { SiteHeader } from "./site-header";
import { ArticleCard } from "./article-card";

/**
 * Shared listing shell for category, district and search pages so all three
 * stay visually identical to the homepage cards.
 */
export function ArticleListPage({
  locale,
  eyebrow,
  title,
  description,
  articles,
  emptyMessage,
  children
}: {
  locale: Locale;
  eyebrow: string;
  title: string;
  description?: string;
  articles: Article[];
  emptyMessage: string;
  children?: React.ReactNode;
}) {
  const t = getMessages(locale);

  return (
    <main className={`min-w-0 ${locale === "kn" ? "font-kannada" : ""}`}>
      <SiteHeader locale={locale} />

      <section className="container-news py-8">
        <div className="border-b pb-5">
          <div className="eyebrow">{eyebrow}</div>
          <h1 className="headline mt-1 break-words text-3xl sm:text-4xl">{title}</h1>
          {description && <p className="mt-2 text-black/60">{description}</p>}
        </div>

        {children}

        {articles.length === 0 ? (
          <p className="py-16 text-center text-black/50">{emptyMessage}</p>
        ) : (
          <div className="mt-8 grid min-w-0 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => {
              const translation = translationFor(article, locale);
              if (!translation) return null;
              return (
                <ArticleCard
                  key={article.id}
                  locale={locale}
                  slug={translation.slug || article.slug}
                  title={translation.title}
                  subtitle={translation.subtitle}
                  category={article.category?.name || ""}
                  image={article.featuredImage || ""}
                  publishedAt={article.publishedAt}
                />
              );
            })}
          </div>
        )}

        <div className="mt-10 border-t pt-5">
          <Link href={`/${locale}` as Route} className="text-sm font-bold text-brand-600 hover:underline">
            ← {t.backToHome}
          </Link>
        </div>
      </section>
    </main>
  );
}

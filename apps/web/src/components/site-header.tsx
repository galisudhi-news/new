import Link from "next/link";
import type { Route } from "next";
import { Search, UserRound } from "lucide-react";

import { getMessages, type Locale } from "@/i18n";
import { fetchInsights } from "@/lib/api";
import { InsightsStrip } from "./insights-strip";

/**
 * Compact header for the inner pages (article, category, district, search).
 * `languageHref` lets an article page point the toggle at its own translation
 * instead of the other locale's homepage.
 */
export async function SiteHeader({ locale, languageHref }: { locale: Locale; languageHref?: string }) {
  const t = getMessages(locale);
  const insights = await fetchInsights();
  const otherLocale: Locale = locale === "en" ? "kn" : "en";

  return (
    <>
      <InsightsStrip insights={insights} locale={locale} />
      <header className="border-b border-black/10 bg-white">
      <div className="container-news flex min-w-0 items-center gap-3 py-4">
        <Link href={`/${locale}` as Route} className="mr-auto min-w-0 truncate text-2xl font-black">
          <span className="text-brand-600">{t.brandKannada}</span> {t.brandSuffix}
        </Link>
        <Link
          href={`/${locale}/search` as Route}
          aria-label={t.search}
          className="shrink-0 rounded-lg p-2 hover:bg-black/5"
        >
          <Search size={20} />
        </Link>
        <Link
          href="/admin/login"
          className="hidden shrink-0 items-center gap-1 rounded-lg border px-3 py-2 text-xs font-bold hover:bg-black/5 sm:flex"
        >
          <UserRound size={15} /> {t.staffLogin}
        </Link>
        <Link
          href={(languageHref ?? `/${otherLocale}`) as Route}
          className="shrink-0 rounded-lg bg-black px-3 py-2 text-xs font-bold text-white"
        >
          {otherLocale === "kn" ? "ಕನ್ನಡ" : "EN"}
        </Link>
      </div>
    </header>
    </>
  );
}

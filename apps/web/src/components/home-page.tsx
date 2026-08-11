"use client";

import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, Search, UserRound, Bell, X } from "lucide-react";

import { switchLocalePath, type Locale, type messages as allMessages } from "@/i18n";
import type { CategoryRef, DistrictRef } from "@/lib/api";

type Messages = typeof allMessages.en;

/** A published article, flattened for this view. */
export type NewsItem = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  categorySlug: string;
  district: string | null;
  districtSlug: string | null;
  image: string;
  publishedAt: string | null;
  readingMinutes: number;
  isBreaking: boolean;
};

const OPTIMIZED_HOSTS = ["images.unsplash.com", "images.pexels.com"];

function isOptimizable(url: string) {
  try {
    return OPTIMIZED_HOSTS.includes(new URL(url).hostname);
  } catch {
    return false;
  }
}

/** next/image only for whitelisted hosts; editors can paste any CDN URL. */
function Thumb({ src, alt, sizes, className = "" }: { src: string; alt: string; sizes: string; className?: string }) {
  if (!src) {
    return <div className={`absolute inset-0 bg-gradient-to-br from-neutral-300 to-neutral-100 ${className}`} />;
  }
  if (isOptimizable(src)) {
    return <Image src={src} alt={alt} fill sizes={sizes} className={`object-cover ${className}`} />;
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={`absolute inset-0 h-full w-full object-cover ${className}`} />;
}

function timeAgo(value: string | null, t: Messages) {
  if (!value) return "";
  const minutes = Math.max(1, Math.round((Date.now() - new Date(value).getTime()) / 60000));
  if (minutes < 60) return `${minutes} ${t.minutesAgo}`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? t.hourAgo : t.hoursAgo}`;
  const days = Math.round(hours / 24);
  return `${days} ${days === 1 ? t.dayAgo : t.daysAgo}`;
}

const articleHref = (locale: Locale, item: NewsItem) => `/${locale}/news/${item.slug}` as Route;

/** Hero: the whole card is one link. */
function HeroCard({ item, locale, t }: { item: NewsItem; locale: Locale; t: Messages }) {
  return (
    <Link href={articleHref(locale, item)} className="news-card group min-w-0 overflow-hidden md:row-span-2">
      <div className="relative aspect-[16/10] overflow-hidden">
        <Thumb src={item.image} alt="" sizes="(max-width:768px) 100vw, 60vw" className="transition duration-500 group-hover:scale-105" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-4 pt-20 text-white sm:p-6">
          <div className="eyebrow !text-red-300">{item.category}</div>
          <h2 className="headline mt-2 break-words text-2xl leading-tight sm:text-3xl md:text-4xl">{item.title}</h2>
          {item.subtitle && <p className="mt-3 line-clamp-2 text-sm text-white/80">{item.subtitle}</p>}
          <p className="mt-3 text-xs text-white/60">
            {timeAgo(item.publishedAt, t)} · {item.readingMinutes} {t.minutesRead}
          </p>
        </div>
      </div>
    </Link>
  );
}

/** Compact card with image on top — used in the top-stories rail and grids. */
function StoryCard({ item, locale, t, ratio = "16/9" }: { item: NewsItem; locale: Locale; t: Messages; ratio?: string }) {
  return (
    <Link href={articleHref(locale, item)} className="group block min-w-0 border-b pb-4">
      <div className={`relative overflow-hidden rounded-lg`} style={{ aspectRatio: ratio }}>
        <Thumb src={item.image} alt="" sizes="(max-width:768px) 100vw, 320px" className="transition duration-500 group-hover:scale-105" />
      </div>
      <div className="eyebrow mt-2">{item.category}</div>
      <h3 className="headline mt-1 break-words text-lg leading-tight group-hover:text-brand-600">{item.title}</h3>
      <p className="mt-1 text-[11px] text-black/50">{timeAgo(item.publishedAt, t)}</p>
    </Link>
  );
}

/** Thumbnail + headline row, used in the "latest" sidebar. */
function ListRow({ item, locale, t }: { item: NewsItem; locale: Locale; t: Messages }) {
  return (
    <Link href={articleHref(locale, item)} className="group flex gap-3 border-b pb-3">
      <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded">
        <Thumb src={item.image} alt="" sizes="80px" />
      </div>
      <div className="min-w-0">
        <p className="break-words text-sm font-semibold leading-tight group-hover:text-brand-600">{item.title}</p>
        <p className="mt-1 text-[11px] text-black/50">{timeAgo(item.publishedAt, t)}</p>
      </div>
    </Link>
  );
}

export function HomePage({
  locale,
  messages: t,
  articles = [],
  categories = [],
  districts = []
}: {
  locale: Locale;
  messages: Messages;
  articles?: NewsItem[];
  categories?: CategoryRef[];
  districts?: DistrictRef[];
}) {
  const [menu, setMenu] = useState(false);
  const pathname = usePathname();
  const nextLocale: Locale = locale === "en" ? "kn" : "en";

  const [hero, ...rest] = articles;
  const latest = rest.slice(0, 4);
  const topStories = rest.slice(4, 7);
  const grid = rest.slice(7, 11);
  const more = rest.slice(11);
  const breaking = articles.filter((item) => item.isBreaking).slice(0, 3);
  const districtName = (d: DistrictRef) => (locale === "kn" ? d.nameKn : d.nameEn);

  return (
    <main className="min-w-0">
      <header className="sticky top-0 z-50 border-b border-black/10 bg-white/95 backdrop-blur">
        <div className="container-news flex min-w-0 items-center gap-2 py-3 sm:h-16 sm:gap-4 sm:py-0">
          <button
            aria-label={menu ? t.closeMenu : t.openMenu}
            onClick={() => setMenu(!menu)}
            className="shrink-0 rounded-lg p-2 hover:bg-black/5"
          >
            {menu ? <X size={22} /> : <Menu size={22} />}
          </button>
          <Link href={`/${locale}` as Route} className="mr-auto min-w-0 truncate text-2xl font-black sm:text-3xl">
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
            href={switchLocalePath(pathname, nextLocale) as Route}
            className="shrink-0 rounded-lg bg-black px-3 py-2 text-xs font-bold text-white"
          >
            {nextLocale === "kn" ? "ಕನ್ನಡ" : "EN"}
          </Link>
        </div>

        {menu && (
          <nav className="border-t bg-white p-4 shadow-lg">
            <div className="container-news min-w-0">
              <div className="eyebrow mb-2">{t.sections}</div>
              <div className="grid min-w-0 grid-cols-2 gap-2 text-sm font-semibold md:grid-cols-4">
                {categories.map((category) => (
                  <Link
                    key={category.slug}
                    href={`/${locale}/category/${category.slug}` as Route}
                    onClick={() => setMenu(false)}
                    className="min-w-0 break-words rounded p-2 hover:bg-red-50 hover:text-brand-600"
                  >
                    {category.name}
                    <span className="ml-1 text-[11px] text-black/40">{category.articleCount}</span>
                  </Link>
                ))}
              </div>

              {districts.length > 0 && (
                <>
                  <div className="eyebrow mb-2 mt-5">{t.districtNews}</div>
                  <div className="grid min-w-0 grid-cols-2 gap-2 text-sm font-semibold md:grid-cols-4">
                    {districts.map((district) => (
                      <Link
                        key={district.slug}
                        href={`/${locale}/district/${district.slug}` as Route}
                        onClick={() => setMenu(false)}
                        className="min-w-0 break-words rounded p-2 hover:bg-red-50 hover:text-brand-600"
                      >
                        {districtName(district)}
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          </nav>
        )}
      </header>

      {breaking.length > 0 && (
        <div className="border-b bg-brand-600 text-white">
          <div className="container-news flex h-10 min-w-0 items-center gap-4 overflow-hidden text-xs font-semibold">
            <span className="shrink-0 font-black">{t.breakingNews.toUpperCase()}</span>
            <div className="flex min-w-0 gap-6 overflow-x-auto">
              {breaking.map((item) => (
                <Link key={item.id} href={articleHref(locale, item)} className="shrink-0 hover:underline">
                  {item.title}
                </Link>
              ))}
            </div>
            <Bell size={15} className="ml-auto shrink-0" />
          </div>
        </div>
      )}

      {articles.length === 0 ? (
        <section className="container-news py-24 text-center">
          <div className="eyebrow">{t.brandKannada}</div>
          <h1 className="headline mt-2 text-3xl">{t.noArticlesTitle}</h1>
          <p className="mt-2 text-black/60">{t.noArticlesBody}</p>
        </section>
      ) : (
        <section className="container-news py-6">
          <div className="grid min-w-0 gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.7fr)_minmax(0,1fr)]">
            <aside className="hidden min-w-0 md:block">
              <div className="eyebrow mb-3">{t.latestNews}</div>
              <div className="space-y-3">
                {latest.map((item) => (
                  <ListRow key={item.id} item={item} locale={locale} t={t} />
                ))}
              </div>
            </aside>

            {hero && <HeroCard item={hero} locale={locale} t={t} />}

            <aside className="min-w-0">
              <div className="eyebrow mb-3">{t.topStories}</div>
              <div className="space-y-4">
                {topStories.map((item) => (
                  <StoryCard key={item.id} item={item} locale={locale} t={t} ratio="16/8" />
                ))}
              </div>
            </aside>
          </div>

          {categories.length > 0 && (
            <div className="my-8 border-y py-4">
              <div className="flex max-w-full gap-5 overflow-x-auto text-xs font-bold uppercase">
                <Link href={`/${locale}` as Route} className="shrink-0 text-brand-600">
                  {t.home}
                </Link>
                {categories.map((category) => (
                  <Link
                    key={category.slug}
                    href={`/${locale}/category/${category.slug}` as Route}
                    className="shrink-0 whitespace-nowrap hover:text-brand-600"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {grid.length > 0 && (
            <section className="grid min-w-0 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {grid.map((item) => (
                <StoryCard key={item.id} item={item} locale={locale} t={t} />
              ))}
            </section>
          )}

          {districts.length > 0 && (
            <section className="mt-10">
              <div className="mb-4 flex min-w-0 flex-col gap-2 border-b pb-2 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0">
                  <div className="eyebrow">{t.districtNews}</div>
                  <h2 className="headline break-words text-2xl sm:text-3xl">{t.karnatakaDistricts}</h2>
                </div>
              </div>
              <div className="flex max-w-full gap-4 overflow-x-auto pb-2">
                {districts.map((district) => (
                  <Link
                    href={`/${locale}/district/${district.slug}` as Route}
                    key={district.slug}
                    className="group min-w-[150px] max-w-[70vw] sm:min-w-[180px]"
                  >
                    <div className="aspect-[16/10] rounded-lg bg-gradient-to-br from-neutral-300 to-neutral-100 transition group-hover:scale-[1.02]" />
                    <div className="eyebrow mt-2">{districtName(district)}</div>
                    <p className="text-sm font-semibold text-black/60">
                      {district.articleCount} {district.articleCount === 1 ? t.story : t.stories}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {more.length > 0 && (
            <section className="mt-12">
              <div className="mb-4 border-b pb-2">
                <div className="eyebrow">{t.moreNews}</div>
                <h2 className="headline break-words text-2xl sm:text-3xl">{t.allStories}</h2>
              </div>
              <div className="grid min-w-0 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {more.map((item) => (
                  <StoryCard key={item.id} item={item} locale={locale} t={t} />
                ))}
              </div>
            </section>
          )}
        </section>
      )}

      <footer className="mt-12 bg-neutral-950 text-white">
        <div className="container-news grid gap-8 py-10 md:grid-cols-4">
          <div className="min-w-0 md:col-span-2">
            <div className="break-words text-3xl font-black">
              <span className="text-red-500">{t.brandKannada}</span> {t.brandSuffix}
            </div>
            <p className="mt-3 max-w-md text-sm text-white/60">{t.footerSummary}</p>
          </div>
          <div className="min-w-0">
            <h4 className="font-bold">{t.sections}</h4>
            <div className="mt-3 space-y-2 text-sm text-white/60">
              {categories.slice(0, 6).map((category) => (
                <Link
                  key={category.slug}
                  href={`/${locale}/category/${category.slug}` as Route}
                  className="block break-words hover:text-white"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="min-w-0">
            <h4 className="font-bold">{t.districtNews}</h4>
            <div className="mt-3 space-y-2 text-sm text-white/60">
              {districts.slice(0, 6).map((district) => (
                <Link
                  key={district.slug}
                  href={`/${locale}/district/${district.slug}` as Route}
                  className="block break-words hover:text-white"
                >
                  {districtName(district)}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 px-3 py-4 text-center text-xs text-white/40">
          {t.copyright} ·{" "}
          <Link href="/admin/login" className="hover:text-white">
            {t.staffLogin}
          </Link>
        </div>
      </footer>
    </main>
  );
}

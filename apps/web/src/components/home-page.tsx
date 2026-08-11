"use client";

import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, Search, UserRound, Tv, BookOpen, CloudSun, ChevronRight, Play, Bell } from "lucide-react";
import { switchLocalePath, type Locale, type messages as allMessages } from "@/i18n";

type Messages = typeof allMessages.en;

const localized = {
  en: {
    stories: [
      { category: "KARNATAKA", title: "Karnataka Budget focuses on infrastructure, welfare and regional development", image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=85" },
      { category: "BENGALURU", title: "Major urban projects enter the next phase as the city expands", image: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1200&q=85" },
      { category: "INDIA", title: "Policy, technology and industry shape India's next growth cycle", image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=85" }
    ],
    latest: ["Rural infrastructure projects receive fresh allocation","Metro expansion gets central nod","IMD forecasts above-normal monsoon","Markets hold rates steady"],
    top: ["Supreme Court considers key constitutional matter","Global trade tensions intensify","Cricket season enters decisive phase"],
    sections: [["POLITICS","Opposition parties unite ahead of the next Lok Sabha elections"],["BUSINESS","Markets rise as investors digest new economic signals"],["TECHNOLOGY","AI adoption accelerates across Indian enterprises"],["SPORTS","India's sporting calendar enters a busy summer"]],
    districts: ["Dakshina Kannada","Udupi","Mysuru","Belagavi","Shivamogga","Tumakuru","Kodagu","Bengaluru"],
    videoTitle: "Heavy rains lash coastal Karnataka; several areas waterlogged",
    opinions: ["India must focus on jobs, not just GDP","The future of AI is human + machine","Why education reform matters"],
    footerLinks: ["About Us","Editorial Policy","Privacy Policy","Terms","Contact","RSS","Mobile Apps"]
  },
  kn: {
    stories: [
      { category: "ಕರ್ನಾಟಕ", title: "ಕರ್ನಾಟಕ ಬಜೆಟ್ ಮೂಲಸೌಕರ್ಯ, ಕಲ್ಯಾಣ ಮತ್ತು ಪ್ರಾದೇಶಿಕ ಅಭಿವೃದ್ಧಿಗೆ ಒತ್ತು ನೀಡಿದೆ", image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=85" },
      { category: "ಬೆಂಗಳೂರು", title: "ನಗರ ವಿಸ್ತಾರವಾಗುತ್ತಿದ್ದಂತೆ ಪ್ರಮುಖ ನಗರ ಯೋಜನೆಗಳು ಮುಂದಿನ ಹಂತಕ್ಕೆ", image: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1200&q=85" },
      { category: "ಭಾರತ", title: "ನೀತಿ, ತಂತ್ರಜ್ಞಾನ ಮತ್ತು ಕೈಗಾರಿಕೆ ಭಾರತದ ಮುಂದಿನ ಬೆಳವಣಿಗೆ ಚಕ್ರ ರೂಪಿಸುತ್ತಿವೆ", image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=85" }
    ],
    latest: ["ಗ್ರಾಮೀಣ ಮೂಲಸೌಕರ್ಯ ಯೋಜನೆಗಳಿಗೆ ಹೊಸ ಅನುದಾನ","ಮೆಟ್ರೋ ವಿಸ್ತರಣೆಗೆ ಕೇಂದ್ರ ಅನುಮೋದನೆ","ಸಾಮಾನ್ಯಕ್ಕಿಂತ ಹೆಚ್ಚು ಮಳೆಯ ಮುನ್ಸೂಚನೆ","ಮಾರುಕಟ್ಟೆ ದರಗಳು ಸ್ಥಿರ"],
    top: ["ಮುಖ್ಯ ಸಂವಿಧಾನಾತ್ಮಕ ವಿಚಾರ ಪರಿಶೀಲಿಸುವ ಸುಪ್ರೀಂ ಕೋರ್ಟ್","ಜಾಗತಿಕ ವ್ಯಾಪಾರ ಉದ್ವಿಗ್ನತೆ ಹೆಚ್ಚಳ","ಕ್ರಿಕೆಟ್ ಋತು ನಿರ್ಣಾಯಕ ಹಂತಕ್ಕೆ"],
    sections: [["ರಾಜಕೀಯ","ಮುಂದಿನ ಲೋಕಸಭಾ ಚುನಾವಣೆಗೆ ಮುನ್ನ ವಿರೋಧ ಪಕ್ಷಗಳ ಒಗ್ಗಟ್ಟು"],["ವ್ಯಾಪಾರ","ಹೊಸ ಆರ್ಥಿಕ ಸೂಚನೆಗಳ ನಡುವೆ ಮಾರುಕಟ್ಟೆ ಏರಿಕೆ"],["ತಂತ್ರಜ್ಞಾನ","ಭಾರತೀಯ ಉದ್ಯಮಗಳಲ್ಲಿ AI ಬಳಕೆ ವೇಗ ಪಡೆದುಕೊಂಡಿದೆ"],["ಕ್ರೀಡೆ","ಭಾರತದ ಕ್ರೀಡಾ ಕ್ಯಾಲೆಂಡರ್ ಗರಿಷ್ಠ ಚಟುವಟಿಕೆಗೆ"]],
    districts: ["ದಕ್ಷಿಣ ಕನ್ನಡ","ಉಡುಪಿ","ಮೈಸೂರು","ಬೆಳಗಾವಿ","ಶಿವಮೊಗ್ಗ","ತುಮಕೂರು","ಕೊಡಗು","ಬೆಂಗಳೂರು"],
    videoTitle: "ಕರಾವಳಿ ಕರ್ನಾಟಕದಲ್ಲಿ ಭಾರಿ ಮಳೆ; ಹಲವು ಪ್ರದೇಶಗಳು ಜಲಾವೃತ",
    opinions: ["ಭಾರತ GDP ಮಾತ್ರವಲ್ಲ, ಉದ್ಯೋಗಗಳ ಮೇಲೂ ಗಮನ ಹರಿಸಬೇಕು","AI ಭವಿಷ್ಯ ಮಾನವ + ಯಂತ್ರ ಸಹಕಾರದಲ್ಲಿದೆ","ಶಿಕ್ಷಣ ಸುಧಾರಣೆ ಏಕೆ ಮುಖ್ಯ"],
    footerLinks: ["ನಮ್ಮ ಬಗ್ಗೆ","ಸಂಪಾದಕೀಯ ನೀತಿ","ಗೌಪ್ಯತಾ ನೀತಿ","ನಿಯಮಗಳು","ಸಂಪರ್ಕ","RSS","ಮೊಬೈಲ್ ಅ್ಯಪ್‌ಗಳು"]
  }
} as const;

type Story = { category: string; title: string; image: string; href?: string; summary?: string };

/** Only these hosts are whitelisted for next/image; editor-supplied CDN URLs are not. */
const OPTIMIZED_HOSTS = ["images.unsplash.com", "images.pexels.com"];

function isOptimizable(url: string) {
  try {
    return OPTIMIZED_HOSTS.includes(new URL(url).hostname);
  } catch {
    return false;
  }
}

function StoryImage({ src, large }: { src: string; large: boolean }) {
  if (!src) return <div className="absolute inset-0 bg-gradient-to-br from-neutral-300 to-neutral-100" />;
  if (isOptimizable(src)) {
    return <Image src={src} alt="" fill className="object-cover" sizes={large ? "(max-width:768px) 100vw, 60vw" : "400px"} />;
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" />;
}

function StoryCard({ story, large=false, summary, meta }: { story: Story, large?: boolean, summary: string, meta: string }) {
  const heading = story.href ? <Link href={story.href as Route}>{story.title}</Link> : story.title;
  return (
    <article className={`news-card min-w-0 overflow-hidden ${large ? "md:row-span-2" : ""}`}>
      <div className={`relative overflow-hidden ${large ? "aspect-[16/10]" : "aspect-[16/9]"}`}>
        <StoryImage src={story.image} large={large} />
        {large && <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-4 pt-16 text-white sm:p-6 sm:pt-20">
          <div className="eyebrow !text-red-300">{story.category}</div>
          <h2 className="headline mt-2 break-words text-2xl leading-tight sm:text-3xl md:text-5xl">{heading}</h2>
          <p className="mt-3 text-sm text-white/80">{story.summary || summary}</p>
        </div>}
      </div>
      {!large && <div className="p-4">
        <div className="eyebrow">{story.category}</div>
        <h3 className="headline mt-2 break-words text-xl leading-tight">{heading}</h3>
        <p className="mt-2 text-xs text-black/50">{meta}</p>
      </div>}
    </article>
  );
}

/** A published article as served by the API, flattened for this view. */
export type NewsItem = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  image: string;
  publishedAt: string | null;
};

export function HomePage({
  locale,
  messages: t,
  articles = []
}: {
  locale: Locale;
  messages: Messages;
  /** Published articles from the API. Falls back to the demo layout when empty. */
  articles?: NewsItem[];
}) {
  const [menu, setMenu] = useState(false);
  const pathname = usePathname();
  const nextLocale = locale === "en" ? "kn" : "en";
  const staticCopy = localized[locale];

  const toStory = (item: NewsItem): Story => ({
    category: item.category,
    title: item.title,
    image: item.image,
    href: `/${locale}/news/${item.slug}`,
    summary: item.subtitle || undefined
  });

  const copy = articles.length
    ? {
        ...staticCopy,
        stories: [
          articles[0] ? toStory(articles[0]) : staticCopy.stories[0],
          articles[1] ? toStory(articles[1]) : staticCopy.stories[1],
          articles[2] ? toStory(articles[2]) : staticCopy.stories[2]
        ] as Story[],
        latest: articles.slice(0, 4).map((item) => item.title),
        top: articles.slice(1, 4).map((item) => item.title),
        sections: (articles.slice(0, 4).length
          ? articles.slice(0, 4).map((item) => [item.category, item.title] as [string, string])
          : staticCopy.sections) as ReadonlyArray<readonly [string, string]>
      }
    : { ...staticCopy, stories: staticCopy.stories as unknown as Story[] };

  const latestLinks = articles.slice(0, 4);
  const topLinks = articles.slice(1, 4);
  const sectionLinks = articles.slice(0, 4);
  const navItems = [t.national,t.international,t.politics,t.karnataka,t.bengaluru,t.business,t.technology,t.sports,t.entertainment,t.opinion,t.districts,t.defence,t.factCheck,t.agriculture,t.jobs];
  const railItems = [t.home,t.national,t.international,t.politics,t.karnataka,t.bengaluru,t.business,t.technology,t.science,t.sports,t.entertainment,t.opinion,t.factCheck,t.districtNews];

  return (
    <main className="min-w-0">
      <div className="bg-black px-3 py-1 text-center text-[11px] font-semibold text-white">
        <span className="mr-3 text-red-400">{t.breaking.toUpperCase()}</span> {t.breakingTicker}
      </div>

      <header className="sticky top-0 z-50 border-b border-black/10 bg-white/95 backdrop-blur">
        <div className="container-news flex min-w-0 items-center gap-2 py-3 sm:h-16 sm:gap-4 sm:py-0">
          <button aria-label="Open menu" onClick={() => setMenu(!menu)} className="shrink-0 rounded-lg p-2 hover:bg-black/5"><Menu size={22}/></button>
          <Link href={`/${locale}`} className="mr-auto min-w-0 truncate text-2xl font-black sm:text-3xl">
            <span className="text-brand-600">{t.brandKannada}</span> {t.brandSuffix}
          </Link>
          <div className="hidden items-center gap-5 text-xs font-semibold md:flex">
            <span className="flex items-center gap-1 whitespace-nowrap"><CloudSun size={15}/> {t.weather}</span>
            <span className="whitespace-nowrap">{t.date}</span>
          </div>
          <button aria-label={t.search} className="shrink-0 rounded-lg p-2 hover:bg-black/5"><Search size={20}/></button>
          <button className="hidden shrink-0 items-center gap-1 rounded-lg border px-3 py-2 text-xs font-bold sm:flex"><Tv size={15}/> {t.liveTv}</button>
          <button className="hidden shrink-0 items-center gap-1 rounded-lg border px-3 py-2 text-xs font-bold xl:flex"><BookOpen size={15}/> {t.epaper}</button>
          <button className="hidden shrink-0 items-center gap-1 rounded-lg border px-3 py-2 text-xs font-bold lg:flex"><UserRound size={15}/> {t.login}</button>
          <Link href={`/${locale}/subscribe` as Route} className="hidden shrink-0 rounded-lg bg-brand-600 px-4 py-2 text-xs font-bold text-white md:block">{t.subscribe}</Link>
          <Link href={switchLocalePath(pathname, nextLocale) as Route} className="shrink-0 rounded-lg bg-black px-3 py-2 text-xs font-bold text-white">{nextLocale === "kn" ? "ಕನ್ನಡ" : "EN"}</Link>
        </div>

        {menu && <nav className="border-t bg-white p-4 shadow-lg">
          <div className="container-news grid min-w-0 grid-cols-2 gap-3 text-sm font-semibold md:grid-cols-5">
            {navItems.map((x, i) =>
              <Link key={x} href={`/${locale}/category/${["national","international","politics","karnataka","bengaluru","business","technology","sports","entertainment","opinion","districts","defence","fact-check","agriculture","jobs"][i]}` as Route} className="min-w-0 rounded p-2 break-words hover:bg-red-50 hover:text-brand-600">{x}</Link>
            )}
          </div>
        </nav>}
      </header>

      <div className="border-b bg-brand-600 text-white">
        <div className="container-news flex h-10 min-w-0 items-center gap-4 overflow-hidden text-xs font-semibold">
          <span className="shrink-0 font-black">{t.breakingNews.toUpperCase()}</span>
          <span className="min-w-0 truncate">{t.tickerItems}</span>
          <Bell size={15} className="ml-auto shrink-0"/>
        </div>
      </div>

      <section className="container-news py-6">
        <div className="grid min-w-0 gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.7fr)_minmax(0,1fr)]">
          <aside className="hidden min-w-0 md:block">
            <div className="eyebrow mb-3">{t.latestNews}</div>
            <div className="space-y-3">
              {copy.latest.map((title,i)=>
                <div className="flex gap-3 border-b pb-3" key={`${title}-${i}`}>
                  <div className="h-14 w-20 shrink-0 rounded bg-neutral-200" />
                  <div className="min-w-0">
                    <p className="break-words text-sm font-semibold leading-tight">
                      {latestLinks[i] ? <Link href={`/${locale}/news/${latestLinks[i].slug}` as Route}>{title}</Link> : title}
                    </p>
                    <p className="mt-1 text-[11px] text-black/50">{i+1} {i === 0 ? t.hourAgo : t.hoursAgo}</p>
                  </div>
                </div>
              )}
            </div>
            <button className="mt-5 w-full border border-brand-600 px-2 py-2 text-xs font-bold text-brand-600">{t.viewAllLatest.toUpperCase()}</button>
          </aside>

          <StoryCard story={copy.stories[0]} large summary={t.summary} meta={`2 ${t.hoursAgo} · 5 ${t.minutesRead}`} />

          <aside className="min-w-0">
            <div className="eyebrow mb-3">{t.topStories}</div>
            <div className="space-y-4">
              {copy.top.map((title,i)=>
                <article key={`${title}-${i}`} className="border-b pb-4">
                  <div className="aspect-[16/8] rounded-lg bg-neutral-200" />
                  <div className="eyebrow mt-2">{copy.stories[i]?.category}</div>
                  <h3 className="headline mt-1 break-words text-lg">
                    {topLinks[i] ? <Link href={`/${locale}/news/${topLinks[i].slug}` as Route}>{title}</Link> : title}
                  </h3>
                  <p className="mt-1 text-[11px] text-black/50">{i+2} {t.hoursAgo}</p>
                </article>
              )}
            </div>
          </aside>
        </div>

        <div className="my-8 border-y py-4">
          <div className="flex max-w-full gap-5 overflow-x-auto text-xs font-bold uppercase">
            {railItems.map(x=>
              <Link key={x} href="#" className="shrink-0 hover:text-brand-600">{x}</Link>
            )}
          </div>
        </div>

        <section className="grid min-w-0 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {copy.sections.map(([c,title],i)=><article key={`${c}-${i}`} className="min-w-0 border-b pb-5">
            <div className="aspect-[16/9] rounded-lg bg-neutral-200" />
            <div className="eyebrow mt-3">{c}</div>
            <h3 className="headline mt-1 break-words text-xl leading-tight">
              {sectionLinks[i] ? <Link href={`/${locale}/news/${sectionLinks[i].slug}` as Route}>{title}</Link> : title}
            </h3>
            {!sectionLinks[i] && <ul className="mt-3 list-disc space-y-1 pl-4 text-xs text-black/65">
              <li>Latest developments from the field</li><li>What readers need to know</li>
            </ul>}
          </article>)}
        </section>

        <section className="mt-10">
          <div className="mb-4 flex min-w-0 flex-col gap-2 border-b pb-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0"><div className="eyebrow">{t.districtNews}</div><h2 className="headline break-words text-2xl sm:text-3xl">{t.karnatakaDistricts}</h2></div>
            <Link href="#" className="shrink-0 text-xs font-bold text-brand-600">{t.viewAllDistricts.toUpperCase()} <ChevronRight size={14} className="inline"/></Link>
          </div>
          <div className="flex max-w-full gap-4 overflow-x-auto pb-2">
            {copy.districts.map(d=><Link href="#" key={d} className="group min-w-[150px] max-w-[70vw] sm:min-w-[180px]">
              <div className="aspect-[16/10] rounded-lg bg-gradient-to-br from-neutral-300 to-neutral-100 transition group-hover:scale-[1.02]" />
              <div className="eyebrow mt-2">{d}</div>
              <h3 className="headline break-words text-base">Local developments and district updates</h3>
            </Link>)}
          </div>
        </section>

        <section className="mt-12 grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <div className="min-w-0"><div className="eyebrow">{t.videos}</div><h2 className="headline mb-4 text-3xl">{t.watch}</h2>
            <div className="relative aspect-video overflow-hidden rounded-xl bg-neutral-900">
              <div className="absolute inset-0 flex items-center justify-center"><span className="rounded-full bg-white p-5"><Play fill="black"/></span></div>
            </div>
            <h3 className="headline mt-3 break-words text-2xl">{copy.videoTitle}</h3>
          </div>
          <div className="min-w-0"><div className="eyebrow">{t.editorsPick}</div><h2 className="headline mb-4 text-3xl">{t.selected}</h2>
            <StoryCard story={copy.stories[1]} summary={t.summary} meta={`2 ${t.hoursAgo} · 5 ${t.minutesRead}`} />
          </div>
          <div className="min-w-0"><div className="eyebrow">{t.opinion}</div><h2 className="headline mb-4 text-3xl">{t.voices}</h2>
            <div className="space-y-5">{copy.opinions.map(title=>
              <article key={title} className="border-b pb-4"><h3 className="headline break-words text-xl">{title}</h3><p className="mt-1 text-xs text-black/50">{t.opinion} · 6 {t.minutesRead}</p></article>
            )}</div>
          </div>
        </section>
      </section>

      <footer className="mt-12 bg-neutral-950 text-white">
        <div className="container-news grid gap-8 py-10 md:grid-cols-5">
          <div className="min-w-0 md:col-span-2"><div className="break-words text-3xl font-black"><span className="text-red-500">{t.brandKannada}</span> {t.brandSuffix}</div><p className="mt-3 max-w-md text-sm text-white/60">{t.footerSummary}</p></div>
          {[t.quickLinks,t.policies,t.services].map(h=><div className="min-w-0" key={h}><h4 className="font-bold">{h}</h4><div className="mt-3 space-y-2 text-sm text-white/60">{copy.footerLinks.map(x=><div className="break-words" key={x}>{x}</div>)}</div></div>)}
          <div className="min-w-0"><h4 className="font-bold">{t.downloadApp}</h4><div className="mt-3 rounded bg-white/10 p-3 text-xs">Google Play</div><div className="mt-2 rounded bg-white/10 p-3 text-xs">App Store</div></div>
        </div>
        <div className="border-t border-white/10 px-3 py-4 text-center text-xs text-white/40">{t.copyright}</div>
      </footer>
    </main>
  );
}

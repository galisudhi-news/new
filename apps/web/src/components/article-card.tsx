import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";

import type { Locale } from "@/i18n";

const OPTIMIZED_HOSTS = ["images.unsplash.com", "images.pexels.com"];

function isOptimizable(url: string) {
  try {
    return OPTIMIZED_HOSTS.includes(new URL(url).hostname);
  } catch {
    return false;
  }
}

/** Server-rendered card used by the category, district and search listings. */
export function ArticleCard({
  locale,
  slug,
  title,
  subtitle,
  category,
  image,
  publishedAt
}: {
  locale: Locale;
  slug: string;
  title: string;
  subtitle?: string | null;
  category: string;
  image: string;
  publishedAt: string | null;
}) {
  return (
    <Link href={`/${locale}/news/${slug}` as Route} className="group block min-w-0 border-b pb-5">
      <div className="relative aspect-[16/9] overflow-hidden rounded-lg">
        {image ? (
          isOptimizable(image) ? (
            <Image
              src={image}
              alt=""
              fill
              sizes="(max-width:768px) 100vw, 380px"
              className="object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
          )
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-300 to-neutral-100" />
        )}
      </div>
      <div className="eyebrow mt-3">{category}</div>
      <h2 className="headline mt-1 break-words text-xl leading-tight group-hover:text-brand-600">{title}</h2>
      {subtitle && <p className="mt-2 line-clamp-2 text-sm text-black/60">{subtitle}</p>}
      {publishedAt && (
        <p className="mt-2 text-[11px] text-black/40">
          {new Date(publishedAt).toLocaleDateString(locale === "kn" ? "kn-IN" : "en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric"
          })}
        </p>
      )}
    </Link>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, locales, type Locale } from "@/i18n";

export const metadata: Metadata = {
  title: {
    default: "Your News",
    template: "%s | Your News",
  },
  description: "Premium bilingual English and Kannada digital news platform.",
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <div lang={locale} data-locale={locale} className={locale === "kn" ? "font-kannada" : ""}>
      {children}
    </div>
  );
}

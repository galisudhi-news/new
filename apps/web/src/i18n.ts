import en from "../messages/en.json";
import kn from "../messages/kn.json";

export const locales = ["en", "kn"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const messages = { en, kn } as const;

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function getMessages(locale: Locale) {
  return messages[locale];
}

export function switchLocalePath(pathname: string, nextLocale: Locale) {
  const parts = pathname.split("/");
  if (isLocale(parts[1] || "")) {
    parts[1] = nextLocale;
    return parts.join("/") || `/${nextLocale}`;
  }
  return `/${nextLocale}${pathname === "/" ? "" : pathname}`;
}

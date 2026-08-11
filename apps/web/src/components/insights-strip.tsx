import { CloudRain, CloudSun, Cloudy, Snowflake, Sun, TrendingDown, TrendingUp, Zap } from "lucide-react";

import type { Locale } from "@/i18n";
import type { Insights } from "@/lib/api";

/** WMO weather codes → icon + bilingual label. */
function describe(code: number, locale: Locale) {
  const groups: { match: (c: number) => boolean; icon: typeof Sun; en: string; kn: string }[] = [
    { match: (c) => c === 0, icon: Sun, en: "Clear", kn: "ಸ್ವಚ್ಛ" },
    { match: (c) => c >= 1 && c <= 2, icon: CloudSun, en: "Partly cloudy", kn: "ಭಾಗಶಃ ಮೋಡ" },
    { match: (c) => c === 3 || (c >= 45 && c <= 48), icon: Cloudy, en: "Cloudy", kn: "ಮೋಡ ಕವಿದ" },
    { match: (c) => c >= 51 && c <= 67, icon: CloudRain, en: "Drizzle", kn: "ತುಂತುರು ಮಳೆ" },
    { match: (c) => c >= 71 && c <= 77, icon: Snowflake, en: "Snow", kn: "ಹಿಮ" },
    { match: (c) => c >= 80 && c <= 82, icon: CloudRain, en: "Showers", kn: "ಮಳೆ" },
    { match: (c) => c >= 95, icon: Zap, en: "Thunderstorm", kn: "ಗುಡುಗು ಸಹಿತ ಮಳೆ" }
  ];
  const group = groups.find((item) => item.match(code)) ?? groups[2];
  return { Icon: group.icon, label: locale === "kn" ? group.kn : group.en };
}

const CITY_KN: Record<string, string> = {
  Bengaluru: "ಬೆಂಗಳೂರು",
  Mysuru: "ಮೈಸೂರು",
  Mangaluru: "ಮಂಗಳೂರು",
  Hubballi: "ಹುಬ್ಬಳ್ಳಿ"
};

/**
 * Live weather and currency strip. Renders nothing when both upstreams are
 * unavailable rather than showing stale or invented figures.
 */
export function InsightsStrip({ insights, locale }: { insights: Insights; locale: Locale }) {
  const { weather, markets } = insights;
  if (!weather && markets.length === 0) return null;

  const cityName = weather ? (locale === "kn" ? CITY_KN[weather.city] || weather.city : weather.city) : "";
  const { Icon, label } = weather ? describe(weather.code, locale) : { Icon: Sun, label: "" };

  return (
    <div className="border-b border-black/10 bg-neutral-50">
      <div className="container-news flex min-w-0 items-center gap-4 overflow-x-auto py-1.5 text-[11px] font-semibold text-black/70">
        {weather && (
          <span className="flex shrink-0 items-center gap-1.5">
            <Icon size={14} className="text-brand-600" />
            <span>{cityName}</span>
            <span className="font-black">{weather.temperatureC}°C</span>
            <span className="text-black/45">{label}</span>
          </span>
        )}

        {weather && markets.length > 0 && <span className="h-3 w-px shrink-0 bg-black/15" />}

        {markets.map((quote) => {
          const up = (quote.changePercent ?? 0) >= 0;
          const Trend = up ? TrendingUp : TrendingDown;
          return (
            <span key={quote.symbol} className="flex shrink-0 items-center gap-1.5">
              <span className="text-black/45">{quote.label}</span>
              <span className="font-black">₹{quote.value.toFixed(2)}</span>
              {quote.changePercent !== null && (
                <span className={`flex items-center gap-0.5 ${up ? "text-emerald-600" : "text-brand-600"}`}>
                  <Trend size={12} />
                  {up ? "+" : ""}
                  {quote.changePercent}%
                </span>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
}

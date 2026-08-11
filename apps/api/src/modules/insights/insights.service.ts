import { Injectable, Logger } from "@nestjs/common";

/**
 * Weather and market strip for the site navigation.
 *
 * Both upstreams are real, key-free services — we never invent numbers, because
 * a fabricated temperature or exchange rate on a news site reads as fact. When
 * an upstream is unavailable the field comes back null and the UI hides it.
 */

export type Weather = {
  city: string;
  temperatureC: number;
  humidity: number | null;
  code: number;
  observedAt: string;
};

export type MarketQuote = {
  symbol: string;
  label: string;
  value: number;
  changePercent: number | null;
};

type Cached<T> = { value: T; expiresAt: number };

const WEATHER_TTL_MS = 10 * 60_000;
const MARKET_TTL_MS = 30 * 60_000;

@Injectable()
export class InsightsService {
  private readonly logger = new Logger(InsightsService.name);
  private weatherCache: Cached<Weather | null> | null = null;
  private marketCache: Cached<MarketQuote[]> | null = null;

  /** Defaults to Bengaluru; override with WEATHER_LAT / WEATHER_LON / WEATHER_CITY. */
  private get location() {
    return {
      lat: process.env.WEATHER_LAT || "12.9716",
      lon: process.env.WEATHER_LON || "77.5946",
      city: process.env.WEATHER_CITY || "Bengaluru"
    };
  }

  async getWeather(): Promise<Weather | null> {
    if (this.weatherCache && this.weatherCache.expiresAt > Date.now()) return this.weatherCache.value;

    const { lat, lon, city } = this.location;
    let weather: Weather | null = null;

    try {
      const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
        `&current=temperature_2m,weather_code,relative_humidity_2m&timezone=Asia%2FKolkata`;
      const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (response.ok) {
        const data = (await response.json()) as {
          current?: { temperature_2m?: number; weather_code?: number; relative_humidity_2m?: number; time?: string };
        };
        if (typeof data.current?.temperature_2m === "number") {
          weather = {
            city,
            temperatureC: Math.round(data.current.temperature_2m),
            humidity: data.current.relative_humidity_2m ?? null,
            code: data.current.weather_code ?? 0,
            observedAt: data.current.time ?? new Date().toISOString()
          };
        }
      }
    } catch (error) {
      this.logger.warn(`Weather lookup failed: ${error instanceof Error ? error.message : error}`);
    }

    this.weatherCache = { value: weather, expiresAt: Date.now() + WEATHER_TTL_MS };
    return weather;
  }

  async getMarkets(): Promise<MarketQuote[]> {
    if (this.marketCache && this.marketCache.expiresAt > Date.now()) return this.marketCache.value;

    let quotes: MarketQuote[] = [];
    try {
      const latest = await this.fetchRates();
      if (latest) {
        // Compare against a week ago so the change is meaningful over weekends
        // and market holidays, when "yesterday" has no published rate.
        const weekAgo = new Date(Date.now() - 7 * 86_400_000).toISOString().slice(0, 10);
        const previous = await this.fetchRates(weekAgo);

        quotes = [
          this.quote("USDINR", "USD/INR", latest.rates.INR, previous?.rates.INR),
          this.quote("EURINR", "EUR/INR", this.cross(latest.rates.INR, latest.rates.EUR), this.cross(previous?.rates.INR, previous?.rates.EUR))
        ].filter((quote): quote is MarketQuote => quote !== null);
      }
    } catch (error) {
      this.logger.warn(`Market lookup failed: ${error instanceof Error ? error.message : error}`);
    }

    this.marketCache = { value: quotes, expiresAt: Date.now() + MARKET_TTL_MS };
    return quotes;
  }

  async getAll() {
    const [weather, markets] = await Promise.all([this.getWeather(), this.getMarkets()]);
    return { weather, markets };
  }

  private async fetchRates(date?: string) {
    const path = date || "latest";
    const response = await fetch(`https://api.frankfurter.dev/v1/${path}?base=USD&symbols=INR,EUR`, {
      signal: AbortSignal.timeout(5000)
    });
    if (!response.ok) return null;
    return (await response.json()) as { date: string; rates: { INR: number; EUR: number } };
  }

  /** EUR/INR derived from the shared USD base. */
  private cross(inr?: number, eur?: number) {
    if (typeof inr !== "number" || typeof eur !== "number" || eur === 0) return undefined;
    return inr / eur;
  }

  private quote(symbol: string, label: string, value?: number, previous?: number): MarketQuote | null {
    if (typeof value !== "number") return null;
    const changePercent =
      typeof previous === "number" && previous !== 0
        ? Number((((value - previous) / previous) * 100).toFixed(2))
        : null;
    return { symbol, label, value: Number(value.toFixed(2)), changePercent };
  }
}

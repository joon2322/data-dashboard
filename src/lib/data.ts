import fs from "fs";
import path from "path";
import type {
  MarketData,
  NewsData,
  XData,
  HnData,
  StockNewsData,
} from "./types";

const DATA_DIR = path.join(process.cwd(), "data");

function readJson<T>(date: string, filename: string): T | null {
  try {
    const filePath = path.join(DATA_DIR, date, filename);
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function getAvailableDates(): string[] {
  try {
    const entries = fs.readdirSync(DATA_DIR, { withFileTypes: true });
    return entries
      .filter((e) => e.isDirectory() && /^\d{4}-\d{2}-\d{2}$/.test(e.name))
      .map((e) => e.name)
      .sort()
      .reverse();
  } catch {
    return [];
  }
}

export function getMarketData(date: string): MarketData | null {
  return readJson<MarketData>(date, "market.json");
}

export function getNewsData(date: string): NewsData | null {
  return readJson<NewsData>(date, "news.json");
}

export function getXData(date: string): XData | null {
  return readJson<XData>(date, "x.json");
}

export function getHnData(date: string): HnData | null {
  return readJson<HnData>(date, "hn.json");
}

export function getStockNewsData(date: string): StockNewsData | null {
  return readJson<StockNewsData>(date, "stock-news.json");
}

export function getBriefingHtml(
  date: string,
  type: "am" | "pm"
): string | null {
  try {
    const filePath = path.join(DATA_DIR, date, `briefing-${type}.html`);
    return fs.readFileSync(filePath, "utf-8");
  } catch {
    return null;
  }
}

export { formatNumber, formatPrice, formatPercent } from "./format";

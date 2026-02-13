import "server-only";
import fs from "fs";
import path from "path";
import type {
  MarketData,
  NewsData,
  XData,
  HnData,
  StockNewsData,
  StructuredBriefing,
  WeeklyBriefing,
  MonthlyBriefing,
} from "./types";

const DATA_DIR = path.join(process.cwd(), "data");

function readJson<T>(filePath: string): T | null {
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function dailyPath(date: string, filename: string): string {
  return path.join(DATA_DIR, date, filename);
}

// ─── Manifest (data/index.json) for fast lookups ───

interface DateMeta {
  hasMarket: boolean;
  hasNews: boolean;
  hasHn: boolean;
  hasX: boolean;
  hasStockNews: boolean;
  hasBriefingAm: boolean;
  hasBriefingPm: boolean;
  hasAnalysis: boolean;
  totalItems: number;
}

interface DataManifest {
  generatedAt: string;
  dates: string[];
  weeks: string[];
  months: string[];
  latestDateWithData: string | null;
  dateMeta: Record<string, DateMeta>;
}

let _manifestCache: DataManifest | null = null;

function getManifest(): DataManifest | null {
  if (_manifestCache) return _manifestCache;
  const manifest = readJson<DataManifest>(path.join(DATA_DIR, "index.json"));
  if (manifest) _manifestCache = manifest;
  return manifest;
}

// ─── Available dates / weeks / months ───

export function getAvailableDates(): string[] {
  const manifest = getManifest();
  if (manifest) return manifest.dates;

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

export function getAvailableWeeks(): string[] {
  const manifest = getManifest();
  if (manifest) return manifest.weeks;

  const weeklyDir = path.join(DATA_DIR, "weekly");
  try {
    const entries = fs.readdirSync(weeklyDir, { withFileTypes: true });
    return entries
      .filter((e) => e.isFile() && /^\d{4}-W\d{2}\.json$/.test(e.name))
      .map((e) => e.name.replace(".json", ""))
      .sort()
      .reverse();
  } catch {
    return [];
  }
}

export function getAvailableMonths(): string[] {
  const manifest = getManifest();
  if (manifest) return manifest.months;

  const monthlyDir = path.join(DATA_DIR, "monthly");
  try {
    const entries = fs.readdirSync(monthlyDir, { withFileTypes: true });
    return entries
      .filter((e) => e.isFile() && /^\d{4}-\d{2}\.json$/.test(e.name))
      .map((e) => e.name.replace(".json", ""))
      .sort()
      .reverse();
  } catch {
    return [];
  }
}

// ─── Daily data loaders ───

export function getMarketData(date: string): MarketData | null {
  return readJson<MarketData>(dailyPath(date, "market.json"));
}

export function getNewsData(date: string): NewsData | null {
  return readJson<NewsData>(dailyPath(date, "news.json"));
}

export function getXData(date: string): XData | null {
  return readJson<XData>(dailyPath(date, "x.json"));
}

export function getHnData(date: string): HnData | null {
  return readJson<HnData>(dailyPath(date, "hn.json"));
}

export function getStockNewsData(date: string): StockNewsData | null {
  return readJson<StockNewsData>(dailyPath(date, "stock-news.json"));
}

export function getBriefingHtml(
  date: string,
  type: "am" | "pm"
): string | null {
  try {
    const filePath = dailyPath(date, `briefing-${type}.html`);
    return fs.readFileSync(filePath, "utf-8");
  } catch {
    return null;
  }
}

export function getStructuredBriefing(
  date: string,
  period: "am" | "pm"
): StructuredBriefing | null {
  return readJson<StructuredBriefing>(
    dailyPath(date, `briefing-${period}.json`)
  );
}

// ─── Weekly / Monthly loaders ───

export function getWeeklyBriefing(week: string): WeeklyBriefing | null {
  return readJson<WeeklyBriefing>(
    path.join(DATA_DIR, "weekly", `${week}.json`)
  );
}

export function getMonthlyBriefing(month: string): MonthlyBriefing | null {
  return readJson<MonthlyBriefing>(
    path.join(DATA_DIR, "monthly", `${month}.json`)
  );
}

// ─── Helpers ───

export function hasEnhancedData(date: string): boolean {
  const market = getMarketData(date);
  return !!market?.analysis;
}

export function getLatestDateWithData(): string | null {
  const manifest = getManifest();
  if (manifest?.latestDateWithData) return manifest.latestDateWithData;

  const dates = getAvailableDates();

  for (const date of dates) {
    const news = getNewsData(date);
    const hn = getHnData(date);
    const x = getXData(date);
    const stockNews = getStockNewsData(date);

    const newsCount = (news?.us?.length ?? 0) + (news?.kr?.length ?? 0);
    const hnCount = hn?.posts?.length ?? 0;
    const xCount = x?.posts?.length ?? 0;
    const stockNewsCount = stockNews?.articles?.length ?? 0;

    const totalItems = newsCount + hnCount + xCount + stockNewsCount;

    if (totalItems > 0) {
      return date;
    }
  }

  return dates.length > 0 ? dates[0] : null;
}

export { formatNumber, formatPrice, formatPercent } from "./format";

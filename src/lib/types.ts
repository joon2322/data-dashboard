// ═══════════════════════════════════════════════════════
// JJ News — Data Types v2
// All new fields are OPTIONAL for backward compatibility
// v1 JSON files continue to work without changes
// ═══════════════════════════════════════════════════════

// ─── Common ───

export type Sentiment = "bullish" | "bearish" | "neutral";
export type Relevance = "high" | "medium" | "low";
export type Impact = "positive" | "negative" | "neutral";

/** Jarvis analysis block — reused across data types */
export interface JarvisAnalysis {
  summary_kr: string;
  sentiment?: Sentiment;
  key_points?: string[];
  outlook?: string;
  jarvis_take?: string;
}

// ─── Market ───

export interface Quote {
  symbol: string;
  name: string;
  category: "tech" | "crypto" | "index";
  price: number;
  change_percent: number;
  volume: number;
  captured_at: string;
  // v2 enhanced (optional)
  summary_kr?: string;
  analysis?: string;
  sector?: string;
}

export interface MarketData {
  date: string;
  quotes: Quote[];
  // v2 enhanced (optional)
  analysis?: JarvisAnalysis & {
    key_drivers?: string[];
    market_mood?: string;
  };
}

// ─── News ───

export interface UsNewsItem {
  title: string;
  url: string;
  snippet: string | null;
  source: string | null;
  category: string;
  fetched_at?: string;
  // v2 enhanced (optional)
  summary_kr?: string;
  analysis?: string;
  sentiment?: Sentiment;
  relevance?: Relevance;
  tags?: string[];
}

export interface KrNewsItem {
  title: string;
  url: string;
  source: string | null;
  category: string;
  published_at: string | null;
  // v2 enhanced (optional)
  summary_kr?: string;
  analysis?: string;
  sentiment?: Sentiment;
  relevance?: Relevance;
  tags?: string[];
}

export interface NewsData {
  date: string;
  us: UsNewsItem[];
  kr: KrNewsItem[];
  // v2 enhanced (optional)
  analysis?: JarvisAnalysis & {
    top_themes?: string[];
  };
}

// ─── X / Twitter ───

export interface XPost {
  id: string;
  username: string;
  text: string;
  created_at: string;
  source_type: string;
  like_count: number;
  retweet_count: number;
  url: string | null;
  // v2 enhanced (optional)
  summary_kr?: string;
  analysis?: string;
  relevance?: Relevance;
  tags?: string[];
}

export interface XData {
  date: string;
  posts: XPost[];
  // v2 enhanced (optional)
  analysis?: JarvisAnalysis;
}

// ─── HackerNews ───

export interface HnPost {
  id: number;
  title: string;
  url: string;
  score: number;
  author: string;
  comments: number;
  posted_at: string;
  // v2 enhanced (optional)
  summary_kr?: string;
  why_important?: string;
  tags?: string[];
}

export interface HnData {
  date: string;
  posts: HnPost[];
  // v2 enhanced (optional)
  analysis?: JarvisAnalysis & {
    trends?: string[];
  };
}

// ─── Stock News ───

export interface StockArticle {
  symbol: string;
  title: string;
  url: string;
  source: string;
  summary: string | null;
  published_at: string;
  // v2 enhanced (optional)
  summary_kr?: string;
  impact?: Impact;
  analysis?: string;
}

export interface StockNewsData {
  date: string;
  articles: StockArticle[];
  // v2 enhanced (optional)
  analysis?: JarvisAnalysis;
}

// ─── Structured Briefing (alongside existing HTML) ───

export interface BriefingItem {
  headline: string;
  detail: string;
  source?: string;
  url?: string;
  sentiment?: Sentiment;
}

export interface BriefingSection {
  title: string;
  category: string;
  items: BriefingItem[];
}

export interface StructuredBriefing {
  date: string;
  period: "am" | "pm";
  tldr: string[];
  sections: BriefingSection[];
  jarvis_take?: string;
  generated_at?: string;
}

// ─── Weekly Briefing ───

export interface WeeklyHighlight {
  title: string;
  detail: string;
  category: string;
  date: string;
}

export interface WeeklyBriefing {
  week: string; // "2026-W06"
  date_range: { start: string; end: string };
  title?: string;
  summary_kr: string;
  key_events: WeeklyHighlight[];
  market_recap?: {
    start_values?: Record<string, number>;
    end_values?: Record<string, number>;
    best_performers?: Array<{ symbol: string; change_percent: number }>;
    worst_performers?: Array<{ symbol: string; change_percent: number }>;
  };
  top_themes: string[];
  analysis: string;
  outlook: string;
  jarvis_take: string;
  generated_at?: string;
}

// ─── Monthly Briefing ───

export interface MonthlyBriefing {
  month: string; // "2026-02"
  title?: string;
  summary_kr: string;
  key_themes: string[];
  market_recap?: {
    start_values?: Record<string, number>;
    end_values?: Record<string, number>;
    monthly_change?: Record<string, number>;
  };
  notable_events: Array<{
    date: string;
    title: string;
    detail: string;
  }>;
  analysis: string;
  outlook: string;
  jarvis_take: string;
  generated_at?: string;
}

// ─── Section config ───

export interface SectionConfig {
  key: string;
  label: string;
  labelKr?: string;
  href: string;
  icon?: string;
}

export const DAILY_SECTIONS: SectionConfig[] = [
  { key: "overview", label: "Overview", labelKr: "오버뷰", href: "" },
  { key: "market", label: "Market", labelKr: "시장", href: "/market" },
  { key: "news", label: "News", labelKr: "뉴스", href: "/news" },
  { key: "x", label: "X", labelKr: "X", href: "/x" },
  { key: "hn", label: "HackerNews", labelKr: "해커뉴스", href: "/hn" },
  { key: "stock-news", label: "Stock News", labelKr: "종목뉴스", href: "/stock-news" },
  { key: "briefing", label: "Briefing", labelKr: "브리핑", href: "/briefing" },
];

/** @deprecated Use DAILY_SECTIONS */
export const SECTIONS = DAILY_SECTIONS;

// ─── Time period types ───

export type TimePeriod = "daily" | "weekly" | "monthly";

export interface TimeNavItem {
  label: string;
  href: string;
  period: TimePeriod;
}

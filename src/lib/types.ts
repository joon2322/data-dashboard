// ─── Market ───
export interface Quote {
  symbol: string;
  name: string;
  category: "tech" | "crypto" | "index";
  price: number;
  change_percent: number;
  volume: number;
  captured_at: string;
}

export interface MarketData {
  date: string;
  quotes: Quote[];
}

// ─── News ───
export interface UsNewsItem {
  title: string;
  url: string;
  snippet: string | null;
  source: string | null;
  category: string;
  fetched_at?: string;
}

export interface KrNewsItem {
  title: string;
  url: string;
  source: string | null;
  category: string;
  published_at: string | null;
}

export interface NewsData {
  date: string;
  us: UsNewsItem[];
  kr: KrNewsItem[];
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
}

export interface XData {
  date: string;
  posts: XPost[];
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
}

export interface HnData {
  date: string;
  posts: HnPost[];
}

// ─── Stock News ───
export interface StockArticle {
  symbol: string;
  title: string;
  url: string;
  source: string;
  summary: string | null;
  published_at: string;
}

export interface StockNewsData {
  date: string;
  articles: StockArticle[];
}

// ─── Section config ───
export interface SectionConfig {
  key: string;
  label: string;
  href: string;
}

export const SECTIONS: SectionConfig[] = [
  { key: "overview", label: "Overview", href: "" },
  { key: "market", label: "Market", href: "/market" },
  { key: "news", label: "News", href: "/news" },
  { key: "x", label: "X", href: "/x" },
  { key: "hn", label: "HackerNews", href: "/hn" },
  { key: "stock-news", label: "Stock News", href: "/stock-news" },
  { key: "briefing", label: "Briefing", href: "/briefing" },
];

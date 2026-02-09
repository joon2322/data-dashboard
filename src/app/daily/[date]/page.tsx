import Link from "next/link";
import {
  getMarketData,
  getNewsData,
  getXData,
  getHnData,
  getStockNewsData,
  getBriefingHtml,
  getStructuredBriefing,
  formatPrice,
  formatPercent,
} from "@/lib/data";
import { MarketCard } from "@/components/market-card";
import { SentimentBadge } from "@/components/sentiment-badge";

function SectionHeader({ children, href, linkText = "전체보기" }: { children: React.ReactNode; href?: string; linkText?: string }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-text-tertiary">
        <span className="inline-block h-4 w-1 rounded-full bg-accent" />
        {children}
      </h2>
      {href && (
        <Link href={href} className="text-xs text-accent hover:underline">
          {linkText} &#8594;
        </Link>
      )}
    </div>
  );
}

interface OverviewPageProps {
  params: Promise<{ date: string }>;
}

export default async function OverviewPage({ params }: OverviewPageProps) {
  const { date } = await params;

  const market = getMarketData(date);
  const news = getNewsData(date);
  const xData = getXData(date);
  const hn = getHnData(date);
  const stockNews = getStockNewsData(date);
  const hasAmBriefing = getBriefingHtml(date, "am") !== null;
  const hasPmBriefing = getBriefingHtml(date, "pm") !== null;
  const briefing = getStructuredBriefing(date, "am");

  const indices = market?.quotes.filter((q) => q.category === "index") ?? [];
  const topMovers = market
    ? [...market.quotes]
        .sort(
          (a, b) => Math.abs(b.change_percent) - Math.abs(a.change_percent)
        )
        .slice(0, 4)
    : [];

  const topStockArticles = (stockNews?.articles ?? []).slice(0, 3);
  const usNews = (news?.us ?? []).slice(0, 3);
  const krNews = (news?.kr ?? []).slice(0, 3);

  const topXPosts =
    xData?.posts && xData.posts.length > 0
      ? [...xData.posts].sort((a, b) => b.like_count - a.like_count).slice(0, 2)
      : [];

  const topHn = hn?.posts ? [...hn.posts].sort((a, b) => b.score - a.score).slice(0, 3) : [];

  return (
    <div className="space-y-8">
      {/* ── 오늘의 핵심 (TL;DR) ── */}
      {briefing && briefing.tldr.length > 0 && (
        <section className="rounded-2xl border-2 border-accent/25 bg-gradient-to-br from-accent/5 to-transparent p-5">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-sm font-bold text-accent">오늘의 핵심</span>
            {briefing.jarvis_take && (
              <span className="rounded-md bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent">
                Jarvis
              </span>
            )}
          </div>
          <ul className="space-y-1.5">
            {briefing.tldr.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                {item}
              </li>
            ))}
          </ul>
          {briefing.jarvis_take && (
            <div className="mt-4 rounded-xl bg-surface-hover/50 px-4 py-3">
              <div className="mb-1 flex items-center gap-2">
                <span>🤖</span>
                <span className="text-xs font-bold text-accent">Jarvis&apos;s Take</span>
              </div>
              <p className="text-sm leading-relaxed text-text-secondary">{briefing.jarvis_take}</p>
            </div>
          )}
        </section>
      )}

      {/* ── 시장 분석 (Jarvis) ── */}
      {market?.analysis && (
        <section className="rounded-xl border border-border bg-surface p-5">
          <div className="mb-2 flex items-center gap-2">
            <h2 className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-text-tertiary">
              <span className="inline-block h-4 w-1 rounded-full bg-accent" />
              시장 분석
            </h2>
            {market.analysis.sentiment && (
              <SentimentBadge sentiment={market.analysis.sentiment} />
            )}
          </div>
          <p className="text-sm leading-relaxed text-text-secondary">
            {market.analysis.summary_kr}
          </p>
          {market.analysis.jarvis_take && (
            <div className="mt-3 border-t border-border-subtle pt-3">
              <p className="text-xs font-medium text-accent">Jarvis&apos;s Take</p>
              <p className="mt-1 text-sm text-text-secondary">{market.analysis.jarvis_take}</p>
            </div>
          )}
        </section>
      )}

      {/* ── 주요 지수 ── */}
      {indices.length > 0 && (
        <section>
          <SectionHeader href={`/daily/${date}/market`}>주요 지수</SectionHeader>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {indices.map((q) => {
              const isUp = q.change_percent >= 0;
              return (
                <div
                  key={q.symbol}
                  className="rounded-xl border border-border bg-surface p-4 transition-all hover:shadow-md hover:shadow-accent/5"
                >
                  <p className="text-xs text-text-tertiary">{q.name}</p>
                  <p className="mt-1 text-xl font-bold tabular-nums text-text-primary">
                    {formatPrice(q.price)}
                  </p>
                  <p
                    className={`mt-1 text-sm font-medium tabular-nums ${
                      isUp ? "text-up" : "text-down"
                    }`}
                  >
                    {isUp ? "\u25B2" : "\u25BC"}{" "}
                    {formatPercent(q.change_percent)}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── 주요 변동 ── */}
      {topMovers.length > 0 && (
        <section>
          <SectionHeader>주요 변동</SectionHeader>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {topMovers.map((q) => (
              <MarketCard key={q.symbol} quote={q} />
            ))}
          </div>
        </section>
      )}

      {/* ── 종목 뉴스 ── */}
      {topStockArticles.length > 0 && (
        <section>
          <SectionHeader href={`/daily/${date}/stock-news`}>종목 뉴스</SectionHeader>
          <div className="space-y-2">
            {topStockArticles.map((article, i) => (
              <a
                key={i}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-secondary transition-colors hover:border-accent/20 hover:text-text-primary"
              >
                <span className="flex items-start justify-between gap-2">
                  <span className="font-medium">{article.title}</span>
                  <span className="shrink-0 rounded-md bg-surface-hover px-2 py-0.5 text-xs text-text-tertiary">{article.symbol}</span>
                </span>
                {article.summary_kr && (
                  <span className="mt-1 block text-xs text-text-tertiary">{article.summary_kr}</span>
                )}
                {article.analysis && (
                  <span className="mt-1 flex items-start gap-1.5 text-xs italic text-accent/70">
                    <span className="shrink-0">🤖</span>
                    <span>{article.analysis}</span>
                  </span>
                )}
              </a>
            ))}
          </div>
        </section>
      )}

      {/* ── 뉴스 ── */}
      {(usNews.length > 0 || krNews.length > 0) && (
        <section>
          <SectionHeader href={`/daily/${date}/news`}>뉴스</SectionHeader>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {usNews.length > 0 && (
              <div>
                <h3 className="mb-2 text-xs font-medium text-text-tertiary">
                  미국 주요 뉴스
                </h3>
                <div className="space-y-2">
                  {usNews.map((item, i) => (
                    <a
                      key={i}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text-secondary transition-colors hover:border-accent/20 hover:text-text-primary"
                    >
                      <span className="flex items-start justify-between gap-2">
                        <span>{item.title}</span>
                        {item.sentiment && <SentimentBadge sentiment={item.sentiment} />}
                      </span>
                      {item.summary_kr && (
                        <span className="mt-1 block text-xs text-text-tertiary">{item.summary_kr}</span>
                      )}
                    </a>
                  ))}
                </div>
              </div>
            )}
            {krNews.length > 0 && (
              <div>
                <h3 className="mb-2 text-xs font-medium text-text-tertiary">
                  한국 주요 뉴스
                </h3>
                <div className="space-y-2">
                  {krNews.map((item, i) => (
                    <a
                      key={i}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text-secondary transition-colors hover:border-accent/20 hover:text-text-primary"
                    >
                      {item.title}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── X 포스트 ── */}
      {topXPosts.length > 0 && (
        <section>
          <SectionHeader href={`/daily/${date}/x`}>X 포스트</SectionHeader>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {topXPosts.map((post) => (
              <div
                key={post.id}
                className="rounded-xl border border-border bg-surface p-4 transition-all hover:shadow-md hover:shadow-accent/5"
              >
                <p className="text-sm font-semibold text-accent">
                  @{post.username}
                </p>
                <p className="mt-1 line-clamp-3 text-sm text-text-secondary">
                  {post.text}
                </p>
                {post.summary_kr && (
                  <p className="mt-2 text-xs text-text-tertiary">{post.summary_kr}</p>
                )}
                <p className="mt-2 text-xs text-text-tertiary">
                  {post.like_count.toLocaleString()} 좋아요
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── 해커뉴스 ── */}
      {topHn.length > 0 && (
        <section>
          <SectionHeader href={`/daily/${date}/hn`}>해커뉴스</SectionHeader>
          <div className="space-y-2">
            {topHn.map((post) => (
              <div
                key={post.id}
                className="flex items-center gap-4 rounded-lg border border-border bg-surface px-4 py-2.5 transition-all hover:shadow-md hover:shadow-accent/5"
              >
                <span className="text-lg font-bold tabular-nums text-accent">
                  {post.score}
                </span>
                <div className="min-w-0 flex-1">
                  <a
                    href={post.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-text-secondary hover:text-text-primary"
                  >
                    {post.title}
                  </a>
                  {post.summary_kr && (
                    <p className="mt-0.5 text-xs text-text-tertiary">{post.summary_kr}</p>
                  )}
                </div>
                <span className="shrink-0 text-xs text-text-tertiary">
                  {post.comments} 댓글
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── 브리핑 ── */}
      {(hasAmBriefing || hasPmBriefing) && (
        <section>
          <SectionHeader href={`/daily/${date}/briefing`} linkText="보기">브리핑</SectionHeader>
          <div className="flex gap-2">
            {hasAmBriefing && (
              <Link
                href={`/daily/${date}/briefing`}
                className="flex min-h-[44px] items-center rounded-lg border border-accent/20 bg-accent/5 px-4 py-2.5 text-sm font-medium text-accent transition-colors hover:bg-accent/10"
              >
                오전 브리핑
              </Link>
            )}
            {hasPmBriefing && (
              <Link
                href={`/daily/${date}/briefing`}
                className="flex min-h-[44px] items-center rounded-lg border border-accent/20 bg-accent/5 px-4 py-2.5 text-sm font-medium text-accent transition-colors hover:bg-accent/10"
              >
                오후 브리핑
              </Link>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

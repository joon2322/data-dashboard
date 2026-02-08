import Link from "next/link";
import {
  getMarketData,
  getNewsData,
  getXData,
  getHnData,
  getBriefingHtml,
  formatPrice,
  formatPercent,
} from "@/lib/data";
import { MarketCard } from "@/components/market-card";

interface OverviewPageProps {
  params: Promise<{ date: string }>;
}

export default async function OverviewPage({ params }: OverviewPageProps) {
  const { date } = await params;

  const market = getMarketData(date);
  const news = getNewsData(date);
  const xData = getXData(date);
  const hn = getHnData(date);
  const hasAmBriefing = getBriefingHtml(date, "am") !== null;
  const hasPmBriefing = getBriefingHtml(date, "pm") !== null;

  const indices = market?.quotes.filter((q) => q.category === "index") ?? [];
  const topMovers = market
    ? [...market.quotes]
        .sort(
          (a, b) => Math.abs(b.change_percent) - Math.abs(a.change_percent)
        )
        .slice(0, 4)
    : [];

  const usNews = (news?.us ?? []).slice(0, 3);
  const krNews = (news?.kr ?? []).slice(0, 3);

  const topXPosts =
    xData?.posts && xData.posts.length > 0
      ? [...xData.posts].sort((a, b) => b.like_count - a.like_count).slice(0, 2)
      : [];

  const topHn = hn?.posts ? [...hn.posts].sort((a, b) => b.score - a.score).slice(0, 3) : [];

  return (
    <div className="space-y-8">
      {indices.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xs font-medium uppercase tracking-widest text-text-tertiary">
              Market Indices
            </h2>
            <Link
              href={`/${date}/market`}
              className="text-xs text-accent hover:underline"
            >
              View all &#8594;
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {indices.map((q) => {
              const isUp = q.change_percent >= 0;
              return (
                <div
                  key={q.symbol}
                  className="rounded-xl border border-border bg-surface p-4"
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

      {topMovers.length > 0 && (
        <section>
          <h2 className="mb-3 text-xs font-medium uppercase tracking-widest text-text-tertiary">
            Top Movers
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {topMovers.map((q) => (
              <MarketCard key={q.symbol} quote={q} />
            ))}
          </div>
        </section>
      )}

      {(usNews.length > 0 || krNews.length > 0) && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xs font-medium uppercase tracking-widest text-text-tertiary">
              News
            </h2>
            <Link
              href={`/${date}/news`}
              className="text-xs text-accent hover:underline"
            >
              View all &#8594;
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {usNews.length > 0 && (
              <div>
                <h3 className="mb-2 text-xs font-medium text-text-tertiary">
                  US Headlines
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
                      {item.title}
                    </a>
                  ))}
                </div>
              </div>
            )}
            {krNews.length > 0 && (
              <div>
                <h3 className="mb-2 text-xs font-medium text-text-tertiary">
                  KR Headlines
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

      {topXPosts.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xs font-medium uppercase tracking-widest text-text-tertiary">
              X Posts
            </h2>
            <Link
              href={`/${date}/x`}
              className="text-xs text-accent hover:underline"
            >
              View all &#8594;
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {topXPosts.map((post) => (
              <div
                key={post.id}
                className="rounded-xl border border-border bg-surface p-4"
              >
                <p className="text-sm font-semibold text-accent">
                  @{post.username}
                </p>
                <p className="mt-1 line-clamp-3 text-sm text-text-secondary">
                  {post.text}
                </p>
                <p className="mt-2 text-xs text-text-tertiary">
                  {post.like_count.toLocaleString()} likes
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {topHn.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xs font-medium uppercase tracking-widest text-text-tertiary">
              HackerNews
            </h2>
            <Link
              href={`/${date}/hn`}
              className="text-xs text-accent hover:underline"
            >
              View all &#8594;
            </Link>
          </div>
          <div className="space-y-2">
            {topHn.map((post) => (
              <div
                key={post.id}
                className="flex items-center gap-4 rounded-lg border border-border bg-surface px-4 py-2.5"
              >
                <span className="text-lg font-bold tabular-nums text-accent">
                  {post.score}
                </span>
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-sm text-text-secondary hover:text-text-primary"
                >
                  {post.title}
                </a>
                <span className="text-xs text-text-tertiary">
                  {post.comments} cmts
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {(hasAmBriefing || hasPmBriefing) && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xs font-medium uppercase tracking-widest text-text-tertiary">
              Briefing
            </h2>
            <Link
              href={`/${date}/briefing`}
              className="text-xs text-accent hover:underline"
            >
              View &#8594;
            </Link>
          </div>
          <div className="flex gap-2">
            {hasAmBriefing && (
              <Link
                href={`/${date}/briefing`}
                className="rounded-lg border border-accent/20 bg-accent/5 px-4 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent/10"
              >
                AM Available
              </Link>
            )}
            {hasPmBriefing && (
              <Link
                href={`/${date}/briefing`}
                className="rounded-lg border border-accent/20 bg-accent/5 px-4 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent/10"
              >
                PM Available
              </Link>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

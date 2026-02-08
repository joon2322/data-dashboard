import Link from "next/link";
import {
  getAvailableDates,
  getMarketData,
  getNewsData,
  getXData,
  formatPrice,
  formatPercent,
} from "@/lib/data";
import { MarketCard } from "@/components/market-card";

export default function Home() {
  const dates = getAvailableDates();
  const latestDate = dates[0];

  if (!latestDate) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-text-tertiary">No data available yet.</p>
      </div>
    );
  }

  const market = getMarketData(latestDate);
  const news = getNewsData(latestDate);
  const xData = getXData(latestDate);

  const indices =
    market?.quotes.filter((q) => q.category === "index") ?? [];
  const allQuotes = market?.quotes ?? [];
  const topMovers = [...allQuotes]
    .sort(
      (a, b) =>
        Math.abs(b.change_percent) - Math.abs(a.change_percent)
    )
    .slice(0, 4);

  const latestUsNews = (news?.us ?? []).slice(0, 5);
  const topXPost =
    xData?.posts && xData.posts.length > 0
      ? [...xData.posts].sort((a, b) => b.like_count - a.like_count)[0]
      : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
          Jinko Data
        </h1>
        <p className="mt-2 text-sm text-text-tertiary">
          Daily market data, news, and signals &mdash; {latestDate}
        </p>
      </header>

      <section className="mb-10">
        <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-text-tertiary">
          Market Indices
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {indices.map((q) => {
            const isUp = q.change_percent >= 0;
            return (
              <div
                key={q.symbol}
                className="rounded-xl border border-border bg-surface p-5"
              >
                <p className="text-xs text-text-tertiary">{q.name}</p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-text-primary">
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

      <section className="mb-10">
        <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-text-tertiary">
          Top Movers
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {topMovers.map((q) => (
            <MarketCard key={q.symbol} quote={q} />
          ))}
        </div>
      </section>

      {latestUsNews.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-text-tertiary">
            Latest Headlines
          </h2>
          <div className="space-y-2">
            {latestUsNews.map((item, i) => (
              <a
                key={i}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-secondary transition-colors hover:border-accent/20 hover:bg-surface-hover hover:text-text-primary"
              >
                {item.title}
              </a>
            ))}
          </div>
        </section>
      )}

      {topXPost && (
        <section className="mb-10">
          <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-text-tertiary">
            Latest from X
          </h2>
          <div className="rounded-xl border border-border bg-surface p-5">
            <p className="text-sm font-semibold text-accent">
              @{topXPost.username}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              {topXPost.text}
            </p>
            <p className="mt-2 text-xs text-text-tertiary">
              {topXPost.like_count.toLocaleString()} likes
            </p>
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-text-tertiary">
          All Dates
        </h2>
        <div className="flex flex-wrap gap-2">
          {dates.map((d) => (
            <Link
              key={d}
              href={`/${d}`}
              className={`rounded-lg border px-4 py-2 text-sm font-medium tabular-nums transition-colors ${
                d === latestDate
                  ? "border-accent/30 bg-accent/10 text-accent"
                  : "border-border bg-surface text-text-secondary hover:border-accent/20 hover:bg-surface-hover hover:text-text-primary"
              }`}
            >
              {d}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

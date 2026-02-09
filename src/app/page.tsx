import Link from "next/link";
import {
  getAvailableDates,
  getAvailableWeeks,
  getAvailableMonths,
  getMarketData,
  getStructuredBriefing,
  formatPrice,
  formatPercent,
} from "@/lib/data";
import { MarketCard } from "@/components/market-card";
import { SentimentBadge } from "@/components/sentiment-badge";

function SectionHeader({ children, href, linkText = "더보기" }: { children: React.ReactNode; href?: string; linkText?: string }) {
  return (
    <div className="mb-4 flex items-center justify-between">
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

export default function Home() {
  const dates = getAvailableDates();
  const weeks = getAvailableWeeks();
  const months = getAvailableMonths();
  const latestDate = dates[0];

  if (!latestDate) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-text-tertiary">아직 데이터가 없습니다.</p>
      </div>
    );
  }

  const market = getMarketData(latestDate);
  const briefing = getStructuredBriefing(latestDate, "am");

  const indices = market?.quotes.filter((q) => q.category === "index") ?? [];
  const allQuotes = market?.quotes ?? [];
  const topMovers = [...allQuotes]
    .sort((a, b) => Math.abs(b.change_percent) - Math.abs(a.change_percent))
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-3 py-8 sm:px-6">
      <header className="mb-10">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent-dim text-lg font-black tracking-tighter text-base">
            JJ
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
              JJ News
            </h1>
            <p className="text-sm text-text-tertiary">
              AI 데일리 브리핑 by Jarvis
            </p>
          </div>
        </div>
      </header>

      <div className="mb-10 flex flex-wrap gap-2">
        <Link href="/daily" className="flex min-h-[44px] items-center rounded-lg border border-accent/30 bg-accent/10 px-4 py-2.5 text-sm font-medium text-accent transition-colors hover:bg-accent/15">
          데일리
        </Link>
        <Link href="/weekly" className="flex min-h-[44px] items-center rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:border-accent/20 hover:bg-surface-hover hover:text-text-primary">
          위클리
        </Link>
        <Link href="/monthly" className="flex min-h-[44px] items-center rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:border-accent/20 hover:bg-surface-hover hover:text-text-primary">
          먼슬리
        </Link>
      </div>

      {/* ── TL;DR + Jarvis Take 상단 대시보드 ── */}
      {briefing && briefing.tldr.length > 0 && (
        <section className="mb-10">
          <div className="rounded-2xl border-2 border-accent/25 bg-gradient-to-br from-accent/5 to-transparent p-5 sm:p-6">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-bold text-accent">오늘의 핵심 — {latestDate}</span>
              <Link href={`/daily/${latestDate}/briefing`} className="text-xs text-accent hover:underline">
                전체 브리핑 &#8594;
              </Link>
            </div>
            <ul className="space-y-2">
              {briefing.tldr.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {market?.analysis && (
        <section className="mb-10">
          <div className="relative rounded-2xl border border-border bg-surface p-5 sm:p-6">
            <div className="mb-3 flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/10 text-lg">
                🤖
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-accent">Jarvis&apos;s Take</span>
                {market.analysis.sentiment && <SentimentBadge sentiment={market.analysis.sentiment} />}
              </div>
            </div>
            <div className="rounded-xl bg-surface-hover/50 px-4 py-3">
              <p className="text-sm leading-relaxed text-text-secondary">
                {market.analysis.jarvis_take ?? market.analysis.summary_kr}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ── 하단 섹션별 카드 피드 ── */}
      {indices.length > 0 && (
        <section className="mb-10">
          <SectionHeader href={`/daily/${latestDate}/market`}>시장 현황</SectionHeader>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {indices.map((q) => {
              const isUp = q.change_percent >= 0;
              return (
                <div key={q.symbol} className="rounded-xl border border-border bg-surface p-4 transition-all hover:shadow-md hover:shadow-accent/5 sm:p-5">
                  <p className="text-xs text-text-tertiary">{q.name}</p>
                  <p className="mt-1 text-2xl font-bold tabular-nums text-text-primary">
                    {formatPrice(q.price)}
                  </p>
                  <p className={`mt-1 text-sm font-medium tabular-nums ${isUp ? "text-up" : "text-down"}`}>
                    {isUp ? "\u25B2" : "\u25BC"} {formatPercent(q.change_percent)}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {topMovers.length > 0 && (
        <section className="mb-10">
          <SectionHeader>주요 변동</SectionHeader>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {topMovers.map((q) => (
              <MarketCard key={q.symbol} quote={q} />
            ))}
          </div>
        </section>
      )}

      {briefing && briefing.sections.length > 0 && (
        <section className="mb-10">
          <SectionHeader>브리핑 하이라이트</SectionHeader>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {briefing.sections.map((section, i) => (
              <div key={i} className="rounded-xl border border-border bg-surface p-4 transition-all hover:shadow-md hover:shadow-accent/5">
                <div className="mb-2 flex items-center gap-2">
                  <span className="rounded-md bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent">
                    {section.category}
                  </span>
                  <span className="text-sm font-medium text-text-primary">{section.title}</span>
                </div>
                {section.items.slice(0, 1).map((item, j) => (
                  <div key={j}>
                    <p className="text-sm text-text-secondary">{item.headline}</p>
                    {item.sentiment && (
                      <div className="mt-2">
                        <SentimentBadge sentiment={item.sentiment} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <SectionHeader>최근 날짜</SectionHeader>
        <div className="flex flex-wrap gap-2">
          {dates.map((d) => (
            <Link
              key={d}
              href={`/daily/${d}`}
              className={`flex min-h-[44px] items-center rounded-lg border px-4 py-2.5 text-sm font-medium tabular-nums transition-colors ${
                d === latestDate
                  ? "border-accent/30 bg-accent/10 text-accent"
                  : "border-border bg-surface text-text-secondary hover:border-accent/20 hover:bg-surface-hover hover:text-text-primary"
              }`}
            >
              {d}
            </Link>
          ))}
        </div>
        {(weeks.length > 0 || months.length > 0) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {weeks.map((w) => (
              <Link key={w} href={`/weekly/${w}`} className="flex min-h-[44px] items-center rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium tabular-nums text-text-tertiary transition-colors hover:border-accent/20 hover:text-text-primary">
                {w}
              </Link>
            ))}
            {months.map((m) => (
              <Link key={m} href={`/monthly/${m}`} className="flex min-h-[44px] items-center rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium tabular-nums text-text-tertiary transition-colors hover:border-accent/20 hover:text-text-primary">
                {m}
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

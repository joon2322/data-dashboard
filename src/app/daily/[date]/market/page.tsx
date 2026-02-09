import { getMarketData } from "@/lib/data";
import { MarketTable } from "@/components/market-table";
import { SentimentBadge } from "@/components/sentiment-badge";

interface MarketPageProps {
  params: Promise<{ date: string }>;
}

export default async function MarketPage({ params }: MarketPageProps) {
  const { date } = await params;
  const data = getMarketData(date);

  if (!data || data.quotes.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface p-8 text-center text-text-tertiary">
        No market data available for {date}.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-text-primary">
        Market Data
      </h2>

      {data.analysis && (
        <div className="rounded-xl border border-border bg-surface p-5">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-widest text-text-tertiary">
              Analysis
            </span>
            {data.analysis.sentiment && (
              <SentimentBadge sentiment={data.analysis.sentiment} />
            )}
          </div>
          <p className="text-sm leading-relaxed text-text-secondary">
            {data.analysis.summary_kr}
          </p>
          {data.analysis.key_drivers && data.analysis.key_drivers.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {data.analysis.key_drivers.map((d, i) => (
                <span key={i} className="rounded-md bg-surface-hover px-2 py-0.5 text-xs text-text-tertiary">
                  {d}
                </span>
              ))}
            </div>
          )}
          {data.analysis.jarvis_take && (
            <div className="mt-3 border-t border-border-subtle pt-3">
              <p className="text-xs font-medium text-accent">Jarvis&apos;s Take</p>
              <p className="mt-1 text-sm text-text-secondary">{data.analysis.jarvis_take}</p>
            </div>
          )}
        </div>
      )}

      <MarketTable quotes={data.quotes} />
      <p className="text-xs text-text-tertiary">
        Last captured: {data.quotes[0]?.captured_at ?? "N/A"}
      </p>
    </div>
  );
}

import { getMarketData } from "@/lib/data";
import { MarketTable } from "@/components/market-table";

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
    <div>
      <h2 className="mb-4 text-lg font-semibold text-text-primary">
        Market Data
      </h2>
      <MarketTable quotes={data.quotes} />
      <p className="mt-3 text-xs text-text-tertiary">
        Last captured: {data.quotes[0]?.captured_at ?? "N/A"}
      </p>
    </div>
  );
}

import type { Quote } from "@/lib/types";
import { formatPrice, formatPercent, formatNumber } from "@/lib/format";

interface MarketCardProps {
  quote: Quote;
}

export function MarketCard({ quote }: MarketCardProps) {
  const isUp = quote.change_percent >= 0;

  return (
    <div className="rounded-xl border border-border bg-surface p-4 transition-colors hover:border-border/80 hover:bg-surface-hover">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-bold text-text-primary">{quote.symbol}</p>
          <p className="text-xs text-text-tertiary">{quote.name}</p>
        </div>
        <span
          className={`rounded-md px-2 py-0.5 text-xs font-medium ${
            isUp
              ? "bg-up/10 text-up"
              : "bg-down/10 text-down"
          }`}
        >
          {isUp ? "\u25B2" : "\u25BC"} {formatPercent(quote.change_percent)}
        </span>
      </div>
      <p className="mt-2 text-xl font-semibold tabular-nums text-text-primary">
        {formatPrice(quote.price)}
      </p>
      <p className="mt-1 text-xs text-text-tertiary">
        Vol: {formatNumber(quote.volume)}
      </p>
    </div>
  );
}

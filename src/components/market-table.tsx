"use client";

import { useState, useMemo } from "react";
import type { Quote } from "@/lib/types";
import { formatPrice, formatPercent, formatNumber } from "@/lib/format";

interface MarketTableProps {
  quotes: Quote[];
}

type SortKey = "symbol" | "name" | "price" | "change_percent" | "volume";
type SortDir = "asc" | "desc";

const CATEGORY_ORDER: Record<string, number> = {
  index: 0,
  tech: 1,
  crypto: 2,
};

const CATEGORY_LABELS: Record<string, string> = {
  index: "Indices",
  tech: "Tech",
  crypto: "Crypto",
};

function SortHeader({
  label,
  col,
  align = "left",
  active,
  sortDir,
  onSort,
}: {
  label: string;
  col: SortKey;
  align?: "left" | "right";
  active: boolean;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
}) {
  return (
    <th
      className={`cursor-pointer px-4 py-3 text-xs font-medium uppercase tracking-wider transition-colors select-none ${
        align === "right" ? "text-right" : "text-left"
      } ${
        active ? "text-accent" : "text-text-tertiary hover:text-text-secondary"
      }`}
      onClick={() => onSort(col)}
    >
      {label}
      {active && (
        <span className="ml-1">
          {sortDir === "asc" ? "\u2191" : "\u2193"}
        </span>
      )}
    </th>
  );
}

export function MarketTable({ quotes }: MarketTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("symbol");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const sorted = useMemo(() => {
    const copy = [...quotes];
    copy.sort((a, b) => {
      const catDiff =
        (CATEGORY_ORDER[a.category] ?? 99) -
        (CATEGORY_ORDER[b.category] ?? 99);
      if (catDiff !== 0) return catDiff;

      let cmp = 0;
      if (sortKey === "symbol" || sortKey === "name") {
        cmp = a[sortKey].localeCompare(b[sortKey]);
      } else {
        cmp = a[sortKey] - b[sortKey];
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [quotes, sortKey, sortDir]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "change_percent" ? "desc" : "asc");
    }
  }

  let lastCategory = "";

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead className="bg-surface">
          <tr>
            <SortHeader label="Symbol" col="symbol" active={sortKey === "symbol"} sortDir={sortDir} onSort={handleSort} />
            <SortHeader label="Name" col="name" active={sortKey === "name"} sortDir={sortDir} onSort={handleSort} />
            <SortHeader label="Price" col="price" align="right" active={sortKey === "price"} sortDir={sortDir} onSort={handleSort} />
            <SortHeader label="Change %" col="change_percent" align="right" active={sortKey === "change_percent"} sortDir={sortDir} onSort={handleSort} />
            <SortHeader label="Volume" col="volume" align="right" active={sortKey === "volume"} sortDir={sortDir} onSort={handleSort} />
          </tr>
        </thead>
        <tbody>
          {sorted.map((q) => {
            const isUp = q.change_percent >= 0;
            const showDivider = q.category !== lastCategory;
            lastCategory = q.category;

            return (
              <tr
                key={q.symbol}
                className="border-t border-border-subtle transition-colors hover:bg-surface-hover"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {showDivider && (
                      <span className="rounded bg-accent/10 px-1.5 py-0.5 text-[10px] font-medium text-accent">
                        {CATEGORY_LABELS[q.category] ?? q.category}
                      </span>
                    )}
                    <span className="font-semibold text-text-primary">
                      {q.symbol}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-text-secondary">{q.name}</td>
                <td className="px-4 py-3 text-right font-mono tabular-nums text-text-primary">
                  {formatPrice(q.price)}
                </td>
                <td
                  className={`px-4 py-3 text-right font-mono tabular-nums font-medium ${
                    isUp ? "text-up" : "text-down"
                  }`}
                >
                  {isUp ? "\u25B2" : "\u25BC"} {formatPercent(q.change_percent)}
                </td>
                <td className="px-4 py-3 text-right font-mono tabular-nums text-text-tertiary">
                  {formatNumber(q.volume)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

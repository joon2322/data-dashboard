export function formatNumber(n: number | null | undefined): string {
  if (n == null) return "-";
  return n.toLocaleString("en-US");
}

export function formatPrice(n: number | null | undefined): string {
  if (n == null) return "-";
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatPercent(n: number | null | undefined): string {
  if (n == null) return "-";
  const sign = n >= 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}%`;
}

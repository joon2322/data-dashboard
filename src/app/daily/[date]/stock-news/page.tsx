import { getStockNewsData } from "@/lib/data";
import { StockNewsCard } from "@/components/stock-news-card";

interface StockNewsPageProps {
  params: Promise<{ date: string }>;
}

export default async function StockNewsPage({ params }: StockNewsPageProps) {
  const { date } = await params;
  const data = getStockNewsData(date);

  if (!data || data.articles.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface p-8 text-center text-text-tertiary">
        No stock news available for {date}.
      </div>
    );
  }

  const grouped = new Map<string, typeof data.articles>();
  for (const article of data.articles) {
    const existing = grouped.get(article.symbol) ?? [];
    existing.push(article);
    grouped.set(article.symbol, existing);
  }

  const symbols = Array.from(grouped.keys()).sort();

  return (
    <div>
      <h2 className="mb-6 text-lg font-semibold text-text-primary">
        Stock News
        <span className="ml-2 text-sm font-normal text-text-tertiary">
          ({data.articles.length})
        </span>
      </h2>

      {data.analysis && (
        <div className="mb-6 rounded-xl border border-border bg-surface p-5">
          <p className="text-xs font-medium uppercase tracking-widest text-text-tertiary">Analysis</p>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            {data.analysis.summary_kr}
          </p>
        </div>
      )}

      <div className="space-y-8">
        {symbols.map((symbol) => {
          const articles = grouped.get(symbol) ?? [];
          return (
            <section key={symbol}>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-text-primary">
                <span className="rounded-md bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">
                  {symbol}
                </span>
                <span className="text-text-tertiary">
                  {articles.length} article{articles.length !== 1 ? "s" : ""}
                </span>
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {articles.map((article, i) => (
                  <StockNewsCard key={i} article={article} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

import { getNewsData } from "@/lib/data";
import { UsNewsCard, KrNewsCard } from "@/components/news-card";

interface NewsPageProps {
  params: Promise<{ date: string }>;
}

export default async function NewsPage({ params }: NewsPageProps) {
  const { date } = await params;
  const data = getNewsData(date);

  if (!data) {
    return (
      <div className="rounded-xl border border-border bg-surface p-8 text-center text-text-tertiary">
        No news data available for {date}.
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {data.analysis && (
        <div className="rounded-xl border border-border bg-surface p-5">
          <p className="text-xs font-medium uppercase tracking-widest text-text-tertiary">Analysis</p>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            {data.analysis.summary_kr}
          </p>
          {data.analysis.top_themes && data.analysis.top_themes.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {data.analysis.top_themes.map((theme, i) => (
                <span key={i} className="rounded-md bg-accent/10 px-2 py-0.5 text-xs text-accent">
                  {theme}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <section>
        <h2 className="mb-4 text-lg font-semibold text-text-primary">
          US / EN News
          <span className="ml-2 text-sm font-normal text-text-tertiary">
            ({data.us.length})
          </span>
        </h2>
        {data.us.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.us.map((item, i) => (
              <UsNewsCard key={i} item={item} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-tertiary">No US news available.</p>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-text-primary">
          KR News
          <span className="ml-2 text-sm font-normal text-text-tertiary">
            ({data.kr.length})
          </span>
        </h2>
        {data.kr.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.kr.map((item, i) => (
              <KrNewsCard key={i} item={item} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-tertiary">No KR news available.</p>
        )}
      </section>
    </div>
  );
}

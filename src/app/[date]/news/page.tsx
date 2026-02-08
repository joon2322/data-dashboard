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

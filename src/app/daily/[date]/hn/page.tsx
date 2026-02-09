import { getHnData } from "@/lib/data";
import { HnCard } from "@/components/hn-card";

interface HnPageProps {
  params: Promise<{ date: string }>;
}

export default async function HnPage({ params }: HnPageProps) {
  const { date } = await params;
  const data = getHnData(date);

  if (!data || data.posts.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface p-8 text-center text-text-tertiary">
        No HackerNews data available for {date}.
      </div>
    );
  }

  const sorted = [...data.posts].sort((a, b) => b.score - a.score);

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-text-primary">
        HackerNews
        <span className="ml-2 text-sm font-normal text-text-tertiary">
          ({data.posts.length})
        </span>
      </h2>

      {data.analysis && (
        <div className="rounded-xl border border-border bg-surface p-5">
          <p className="text-xs font-medium uppercase tracking-widest text-text-tertiary">Analysis</p>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            {data.analysis.summary_kr}
          </p>
          {data.analysis.trends && data.analysis.trends.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {data.analysis.trends.map((t, i) => (
                <span key={i} className="rounded-md bg-accent/10 px-2 py-0.5 text-xs text-accent">{t}</span>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="space-y-2">
        {sorted.map((post) => (
          <HnCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}

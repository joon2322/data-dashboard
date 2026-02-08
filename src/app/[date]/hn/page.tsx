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
    <div>
      <h2 className="mb-4 text-lg font-semibold text-text-primary">
        HackerNews
        <span className="ml-2 text-sm font-normal text-text-tertiary">
          ({data.posts.length})
        </span>
      </h2>
      <div className="space-y-2">
        {sorted.map((post) => (
          <HnCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}

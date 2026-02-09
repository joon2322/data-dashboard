import { getXData } from "@/lib/data";
import { XPostCard } from "@/components/x-post-card";

interface XPageProps {
  params: Promise<{ date: string }>;
}

export default async function XPage({ params }: XPageProps) {
  const { date } = await params;
  const data = getXData(date);

  if (!data || data.posts.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface p-8 text-center text-text-tertiary">
        No X posts available for {date}.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-text-primary">
        X Posts
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
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {data.posts.map((post) => (
          <XPostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}

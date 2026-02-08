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
    <div>
      <h2 className="mb-4 text-lg font-semibold text-text-primary">
        X Posts
        <span className="ml-2 text-sm font-normal text-text-tertiary">
          ({data.posts.length})
        </span>
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {data.posts.map((post) => (
          <XPostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}

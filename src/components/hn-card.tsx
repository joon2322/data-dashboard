import type { HnPost } from "@/lib/types";

interface HnCardProps {
  post: HnPost;
}

export function HnCard({ post }: HnCardProps) {
  const hnLink = `https://news.ycombinator.com/item?id=${post.id}`;

  return (
    <div className="flex items-start gap-4 rounded-xl border border-border bg-surface px-4 py-3 transition-colors hover:border-accent/20 hover:bg-surface-hover">
      <div className="flex min-w-[3rem] flex-col items-center pt-0.5">
        <span className="text-lg font-bold tabular-nums text-accent">
          {post.score}
        </span>
        <span className="text-[10px] uppercase tracking-wider text-text-tertiary">
          pts
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <a
          href={post.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium leading-relaxed text-text-primary hover:text-accent"
        >
          {post.title}
        </a>
        <div className="mt-1 flex items-center gap-3 text-xs text-text-tertiary">
          <span>{post.author}</span>
          <span>{post.posted_at}</span>
        </div>
      </div>

      <a
        href={hnLink}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-w-[3.5rem] flex-col items-center rounded-lg bg-surface-hover px-2 py-1.5 text-text-tertiary transition-colors hover:bg-surface-active hover:text-accent"
      >
        <span className="text-sm font-semibold tabular-nums">
          {post.comments}
        </span>
        <span className="text-[10px] uppercase tracking-wider">cmts</span>
      </a>
    </div>
  );
}

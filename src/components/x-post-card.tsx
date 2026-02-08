import type { XPost } from "@/lib/types";

interface XPostCardProps {
  post: XPost;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function XPostCard({ post }: XPostCardProps) {
  const tweetUrl =
    post.url ?? `https://x.com/${post.username}/status/${post.id}`;

  return (
    <article className="rounded-xl border border-border bg-surface p-5 transition-colors hover:border-accent/20 hover:bg-surface-hover">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-hover text-xs font-bold text-accent">
          {post.username[0].toUpperCase()}
        </span>
        <div>
          <a
            href={`https://x.com/${post.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-text-primary hover:text-accent"
          >
            @{post.username}
          </a>
          <p className="text-xs text-text-tertiary">{formatDate(post.created_at)}</p>
        </div>
      </div>

      <a
        href={tweetUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 block text-sm leading-relaxed text-text-secondary hover:text-text-primary"
      >
        {post.text}
      </a>

      <div className="mt-3 flex gap-5 text-xs text-text-tertiary">
        <span className="flex items-center gap-1">
          <span className="text-down/60">&#9829;</span>
          {post.like_count.toLocaleString()}
        </span>
        <span className="flex items-center gap-1">
          <span className="text-accent/60">&#8634;</span>
          {post.retweet_count.toLocaleString()}
        </span>
      </div>
    </article>
  );
}

import type { StockArticle } from "@/lib/types";

interface StockNewsCardProps {
  article: StockArticle;
}

export function StockNewsCard({ article }: StockNewsCardProps) {
  return (
    <article className="group rounded-xl border border-border bg-surface p-4 transition-colors hover:border-accent/20 hover:bg-surface-hover">
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <h3 className="text-sm font-medium leading-relaxed text-text-primary transition-colors group-hover:text-accent">
          {article.title}
        </h3>
      </a>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-surface-hover px-2 py-0.5 text-xs text-text-tertiary">
          {article.source}
        </span>
        {article.published_at && (
          <span className="text-xs text-text-tertiary">
            {new Date(article.published_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
      </div>
      {article.summary && (
        <p className="mt-2 text-xs leading-relaxed text-text-tertiary">
          {article.summary}
        </p>
      )}
    </article>
  );
}

import type { UsNewsItem, KrNewsItem } from "@/lib/types";

interface UsNewsCardProps {
  item: UsNewsItem;
}

export function UsNewsCard({ item }: UsNewsCardProps) {
  return (
    <article className="group rounded-xl border border-border bg-surface p-4 transition-colors hover:border-accent/20 hover:bg-surface-hover">
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <h3 className="text-sm font-medium leading-relaxed text-text-primary transition-colors group-hover:text-accent">
          {item.title}
        </h3>
      </a>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {item.source && (
          <span className="rounded-md bg-surface-hover px-2 py-0.5 text-xs text-text-tertiary">
            {item.source}
          </span>
        )}
        <span className="rounded-md bg-accent/5 px-2 py-0.5 text-xs text-accent/70">
          {item.category}
        </span>
      </div>
      {item.snippet && (
        <p className="mt-2 text-xs leading-relaxed text-text-tertiary">
          {item.snippet}
        </p>
      )}
    </article>
  );
}

interface KrNewsCardProps {
  item: KrNewsItem;
}

export function KrNewsCard({ item }: KrNewsCardProps) {
  return (
    <article className="group rounded-xl border border-border bg-surface p-4 transition-colors hover:border-accent/20 hover:bg-surface-hover">
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <h3 className="text-sm font-medium leading-relaxed text-text-primary transition-colors group-hover:text-accent">
          {item.title}
        </h3>
      </a>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {item.source && (
          <span className="rounded-md bg-surface-hover px-2 py-0.5 text-xs text-text-tertiary">
            {item.source}
          </span>
        )}
        <span className="rounded-md bg-accent/5 px-2 py-0.5 text-xs text-accent/70">
          {item.category}
        </span>
        {item.published_at && (
          <span className="text-xs text-text-tertiary">
            {item.published_at}
          </span>
        )}
      </div>
    </article>
  );
}

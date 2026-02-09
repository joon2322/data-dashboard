import type { UsNewsItem, KrNewsItem } from "@/lib/types";
import { SentimentBadge, RelevanceBadge } from "@/components/sentiment-badge";
import { decodeEntities } from "@/lib/decode-entities";

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
          {decodeEntities(item.title)}
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
        {item.sentiment && <SentimentBadge sentiment={item.sentiment} />}
        {item.relevance && <RelevanceBadge relevance={item.relevance} />}
      </div>
      {item.summary_kr && (
        <p className="mt-2 text-xs leading-relaxed text-text-tertiary">
          {item.summary_kr}
        </p>
      )}
      {!item.summary_kr && item.snippet && (
        <p className="mt-2 text-xs leading-relaxed text-text-tertiary">
          {item.snippet}
        </p>
      )}
      {item.analysis && (
        <p className="mt-2 flex items-start gap-1.5 text-xs italic leading-relaxed text-accent/70">
          <span className="shrink-0 pt-px">🤖</span>
          <span>{item.analysis}</span>
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
          {decodeEntities(item.title)}
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
        {item.sentiment && <SentimentBadge sentiment={item.sentiment} />}
        {item.relevance && <RelevanceBadge relevance={item.relevance} />}
        {item.published_at && (
          <span className="text-xs text-text-tertiary">
            {item.published_at}
          </span>
        )}
      </div>
      {item.summary_kr && (
        <p className="mt-2 text-xs leading-relaxed text-text-tertiary">
          {item.summary_kr}
        </p>
      )}
      {item.analysis && (
        <p className="mt-2 flex items-start gap-1.5 text-xs italic leading-relaxed text-accent/70">
          <span className="shrink-0 pt-px">🤖</span>
          <span>{item.analysis}</span>
        </p>
      )}
    </article>
  );
}

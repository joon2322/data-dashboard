import type { Sentiment, Relevance, Impact } from "@/lib/types";

interface SentimentBadgeProps {
  sentiment: Sentiment;
}

const SENTIMENT_STYLES: Record<Sentiment, string> = {
  bullish: "bg-up/10 text-up",
  bearish: "bg-down/10 text-down",
  neutral: "bg-text-tertiary/10 text-text-tertiary",
};

const SENTIMENT_LABELS: Record<Sentiment, string> = {
  bullish: "강세",
  bearish: "약세",
  neutral: "중립",
};

export function SentimentBadge({ sentiment }: SentimentBadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${SENTIMENT_STYLES[sentiment]}`}>
      {SENTIMENT_LABELS[sentiment]}
    </span>
  );
}

interface RelevanceBadgeProps {
  relevance: Relevance;
}

const RELEVANCE_STYLES: Record<Relevance, string> = {
  high: "bg-accent/10 text-accent",
  medium: "bg-text-secondary/10 text-text-secondary",
  low: "bg-text-tertiary/10 text-text-tertiary",
};

const RELEVANCE_LABELS: Record<Relevance, string> = {
  high: "높음",
  medium: "보통",
  low: "낮음",
};

export function RelevanceBadge({ relevance }: RelevanceBadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${RELEVANCE_STYLES[relevance]}`}>
      {RELEVANCE_LABELS[relevance]}
    </span>
  );
}

interface ImpactBadgeProps {
  impact: Impact;
}

const IMPACT_STYLES: Record<Impact, string> = {
  positive: "bg-up/10 text-up",
  negative: "bg-down/10 text-down",
  neutral: "bg-text-tertiary/10 text-text-tertiary",
};

const IMPACT_LABELS: Record<Impact, string> = {
  positive: "긍정",
  negative: "부정",
  neutral: "중립",
};

export function ImpactBadge({ impact }: ImpactBadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${IMPACT_STYLES[impact]}`}>
      {IMPACT_LABELS[impact]}
    </span>
  );
}

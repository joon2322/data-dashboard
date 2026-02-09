import { getBriefingHtml, getStructuredBriefing } from "@/lib/data";
import { BriefingViewer } from "@/components/briefing-viewer";
import { SentimentBadge } from "@/components/sentiment-badge";

interface BriefingPageProps {
  params: Promise<{ date: string }>;
}

export default async function BriefingPage({ params }: BriefingPageProps) {
  const { date } = await params;

  const amHtml = getBriefingHtml(date, "am");
  const pmHtml = getBriefingHtml(date, "pm");
  const structuredAm = getStructuredBriefing(date, "am");
  const structuredPm = getStructuredBriefing(date, "pm");

  const briefing = structuredAm ?? structuredPm;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-text-primary">
        Daily Briefing
      </h2>

      {briefing && (
        <div className="space-y-4">
          {briefing.tldr.length > 0 && (
            <div className="rounded-xl border border-accent/20 bg-accent/5 p-5">
              <p className="mb-2 text-sm font-bold text-accent">TL;DR</p>
              <ul className="space-y-1.5">
                {briefing.tldr.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {briefing.sections.map((section, i) => (
            <div key={i} className="rounded-xl border border-border bg-surface p-5">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-text-primary">
                <span className="rounded-md bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent">
                  {section.category}
                </span>
                {section.title}
              </h3>
              <div className="space-y-3">
                {section.items.map((item, j) => (
                  <div key={j} className="border-l-2 border-border-subtle pl-3">
                    <div className="flex items-start gap-2">
                      <p className="text-sm font-medium text-text-primary">{item.headline}</p>
                      {item.sentiment && <SentimentBadge sentiment={item.sentiment} />}
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-text-tertiary">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {briefing.jarvis_take && (
            <div className="rounded-xl border border-accent/20 bg-surface p-5">
              <p className="text-xs font-medium text-accent">Jarvis&apos;s Take</p>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">{briefing.jarvis_take}</p>
            </div>
          )}
        </div>
      )}

      <BriefingViewer amHtml={amHtml} pmHtml={pmHtml} />
    </div>
  );
}

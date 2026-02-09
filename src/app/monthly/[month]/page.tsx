import { notFound } from "next/navigation";
import { getMonthlyBriefing, getAvailableMonths } from "@/lib/data";

interface MonthlyPageProps {
  params: Promise<{ month: string }>;
}

export default async function MonthlyPage({ params }: MonthlyPageProps) {
  const { month } = await params;
  const data = getMonthlyBriefing(month);

  if (!data) {
    notFound();
  }

  const months = getAvailableMonths();
  const idx = months.indexOf(month);
  const newerMonth = idx > 0 ? months[idx - 1] : null;
  const olderMonth = idx < months.length - 1 ? months[idx + 1] : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex items-center gap-3">
        {olderMonth ? (
          <a href={`/monthly/${olderMonth}`} className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-tertiary transition-colors hover:border-accent/40 hover:text-accent">&#8592;</a>
        ) : (
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-subtle text-text-tertiary/30">&#8592;</span>
        )}
        <h1 className="text-xl font-bold text-text-primary">{month}</h1>
        {newerMonth ? (
          <a href={`/monthly/${newerMonth}`} className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-tertiary transition-colors hover:border-accent/40 hover:text-accent">&#8594;</a>
        ) : (
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-subtle text-text-tertiary/30">&#8594;</span>
        )}
      </div>

      <div className="space-y-6">
        {data.title && (
          <h2 className="text-2xl font-bold tracking-tight text-text-primary">{data.title}</h2>
        )}

        <div className="rounded-xl border border-border bg-surface p-5">
          <p className="text-sm leading-relaxed text-text-secondary">{data.summary_kr}</p>
        </div>

        {data.key_themes.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {data.key_themes.map((theme, i) => (
              <span key={i} className="rounded-lg bg-accent/10 px-3 py-1.5 text-sm font-medium text-accent">{theme}</span>
            ))}
          </div>
        )}

        {data.notable_events.length > 0 && (
          <section>
            <h3 className="mb-4 text-xs font-medium uppercase tracking-widest text-text-tertiary">주요 이벤트</h3>
            <div className="space-y-3">
              {data.notable_events.map((event, i) => (
                <div key={i} className="flex gap-4 rounded-xl border border-border bg-surface p-4">
                  <span className="shrink-0 rounded-md bg-surface-hover px-2 py-1 text-xs font-mono tabular-nums text-text-tertiary">{event.date}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-text-primary">{event.title}</p>
                    <p className="mt-1 text-xs text-text-tertiary">{event.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="rounded-xl border border-border bg-surface p-5">
          <h3 className="mb-2 text-xs font-medium uppercase tracking-widest text-text-tertiary">분석</h3>
          <p className="text-sm leading-relaxed text-text-secondary">{data.analysis}</p>
        </section>

        <section className="rounded-xl border border-border bg-surface p-5">
          <h3 className="mb-2 text-xs font-medium uppercase tracking-widest text-text-tertiary">전망</h3>
          <p className="text-sm leading-relaxed text-text-secondary">{data.outlook}</p>
        </section>

        <section className="rounded-xl border border-accent/20 bg-surface p-5">
          <p className="text-xs font-medium text-accent">Jarvis&apos;s Take</p>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">{data.jarvis_take}</p>
        </section>
      </div>
    </div>
  );
}

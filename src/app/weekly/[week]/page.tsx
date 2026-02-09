import { notFound } from "next/navigation";
import { getWeeklyBriefing, getAvailableWeeks } from "@/lib/data";
import { formatPercent } from "@/lib/format";

interface WeeklyPageProps {
  params: Promise<{ week: string }>;
}

export default async function WeeklyPage({ params }: WeeklyPageProps) {
  const { week } = await params;
  const data = getWeeklyBriefing(week);

  if (!data) {
    notFound();
  }

  const weeks = getAvailableWeeks();
  const idx = weeks.indexOf(week);
  const newerWeek = idx > 0 ? weeks[idx - 1] : null;
  const olderWeek = idx < weeks.length - 1 ? weeks[idx + 1] : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex items-center gap-3">
        {olderWeek ? (
          <a href={`/weekly/${olderWeek}`} className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-tertiary transition-colors hover:border-accent/40 hover:text-accent">&#8592;</a>
        ) : (
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-subtle text-text-tertiary/30">&#8592;</span>
        )}
        <div>
          <h1 className="text-xl font-bold text-text-primary">{week}</h1>
          <p className="text-xs text-text-tertiary">{data.date_range.start} — {data.date_range.end}</p>
        </div>
        {newerWeek ? (
          <a href={`/weekly/${newerWeek}`} className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-tertiary transition-colors hover:border-accent/40 hover:text-accent">&#8594;</a>
        ) : (
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-subtle text-text-tertiary/30">&#8594;</span>
        )}
      </div>

      <div className="space-y-6">
        {data.title && (
          <h2 className="text-2xl font-bold tracking-tight text-text-primary">
            {data.title}
          </h2>
        )}

        <div className="rounded-xl border border-border bg-surface p-5">
          <p className="text-sm leading-relaxed text-text-secondary">{data.summary_kr}</p>
        </div>

        {data.top_themes.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {data.top_themes.map((theme, i) => (
              <span key={i} className="rounded-lg bg-accent/10 px-3 py-1.5 text-sm font-medium text-accent">{theme}</span>
            ))}
          </div>
        )}

        {data.key_events.length > 0 && (
          <section>
            <h3 className="mb-4 text-xs font-medium uppercase tracking-widest text-text-tertiary">주요 이벤트</h3>
            <div className="space-y-3">
              {data.key_events.map((event, i) => (
                <div key={i} className="flex gap-4 rounded-xl border border-border bg-surface p-4">
                  <div className="shrink-0">
                    <span className="rounded-md bg-surface-hover px-2 py-1 text-xs font-mono tabular-nums text-text-tertiary">{event.date}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2">
                      <p className="text-sm font-medium text-text-primary">{event.title}</p>
                      <span className="shrink-0 rounded-md bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent">{event.category}</span>
                    </div>
                    <p className="mt-1 text-xs text-text-tertiary">{event.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {data.market_recap && (
          <section>
            <h3 className="mb-4 text-xs font-medium uppercase tracking-widest text-text-tertiary">시장 리캡</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {data.market_recap.best_performers && data.market_recap.best_performers.length > 0 && (
                <div className="rounded-xl border border-border bg-surface p-4">
                  <p className="mb-3 text-xs font-medium text-up">최고 상승</p>
                  <div className="space-y-2">
                    {data.market_recap.best_performers.map((p, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-text-primary">{p.symbol}</span>
                        <span className="text-sm font-medium tabular-nums text-up">{formatPercent(p.change_percent)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {data.market_recap.worst_performers && data.market_recap.worst_performers.length > 0 && (
                <div className="rounded-xl border border-border bg-surface p-4">
                  <p className="mb-3 text-xs font-medium text-down">최대 하락</p>
                  <div className="space-y-2">
                    {data.market_recap.worst_performers.map((p, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-text-primary">{p.symbol}</span>
                        <span className="text-sm font-medium tabular-nums text-down">{formatPercent(p.change_percent)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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

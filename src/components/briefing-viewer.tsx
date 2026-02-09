"use client";

import { useState } from "react";
import { useTheme } from "next-themes";

interface BriefingViewerProps {
  amHtml: string | null;
  pmHtml: string | null;
}

export function BriefingViewer({ amHtml, pmHtml }: BriefingViewerProps) {
  const hasAm = amHtml !== null;
  const hasPm = pmHtml !== null;
  const [tab, setTab] = useState<"am" | "pm">(hasPm ? "pm" : "am");
  const { theme } = useTheme();
  const isDark = theme !== "light";

  if (!hasAm && !hasPm) {
    return (
      <div className="rounded-xl border border-border bg-surface p-8 text-center text-text-tertiary">
        No briefing available for this date.
      </div>
    );
  }

  const currentHtml = tab === "am" ? amHtml : pmHtml;

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setTab("am")}
          disabled={!hasAm}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            tab === "am"
              ? "bg-accent/10 text-accent border border-accent/30"
              : hasAm
                ? "bg-surface text-text-tertiary border border-border hover:bg-surface-hover hover:text-text-secondary"
                : "bg-surface/50 text-text-tertiary/30 border border-border-subtle cursor-not-allowed"
          }`}
        >
          AM Briefing
        </button>
        <button
          onClick={() => setTab("pm")}
          disabled={!hasPm}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            tab === "pm"
              ? "bg-accent/10 text-accent border border-accent/30"
              : hasPm
                ? "bg-surface text-text-tertiary border border-border hover:bg-surface-hover hover:text-text-secondary"
                : "bg-surface/50 text-text-tertiary/30 border border-border-subtle cursor-not-allowed"
          }`}
        >
          PM Briefing
        </button>
      </div>

      {currentHtml ? (
        <div className="overflow-hidden rounded-xl border border-border">
          <iframe
            srcDoc={currentHtml}
            className={`h-[80vh] w-full border-0 ${isDark ? "bg-[#0c0c14]" : "bg-white"}`}
            title={`${tab.toUpperCase()} Briefing`}
            sandbox="allow-same-origin"
          />
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-surface p-8 text-center text-text-tertiary">
          No {tab.toUpperCase()} briefing available.
        </div>
      )}
    </div>
  );
}

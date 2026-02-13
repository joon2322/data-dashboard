"use client";

import { useState } from "react";
import { useTheme } from "next-themes";

interface BriefingViewerProps {
  amHtml: string | null;
  pmHtml: string | null;
}

function injectThemeOverride(html: string, isDark: boolean): string {
  const mintOverrides = [
    ".tldr { background: linear-gradient(135deg, #0a1a18 0%, #0c1f1a 50%, #0a1a18 100%) !important; border-color: rgba(20, 240, 197, 0.12) !important; }",
    ".tldr::before { background: linear-gradient(90deg, transparent, #14f0c5, #0bb89a, #14f0c5, transparent) !important; }",
    ".tldr-badge { color: #14f0c5 !important; background: rgba(20, 240, 197, 0.1) !important; border-color: rgba(20, 240, 197, 0.15) !important; }",
    ".tldr-item::before { background: #14f0c5 !important; box-shadow: 0 0 8px rgba(20, 240, 197, 0.4) !important; }",
    ".tldr-item em { color: #0bb89a !important; }",
    ".news-sources a:hover { color: #14f0c5 !important; }",
    ".header-title, .section-title { font-family: 'Pretendard Variable', 'Pretendard', -apple-system, sans-serif !important; font-weight: 700 !important; }",
  ].join("\n");

  const lightOverrides = isDark
    ? ""
    : [
        "body { background: #f8f9fc !important; color: #374151 !important; }",
        ".header { border-color: #e0e2ea !important; }",
        ".header-title { color: #111827 !important; }",
        ".header-label { color: #9ca3af !important; }",
        ".header-meta { color: #9ca3af !important; }",
        ".section-title { color: #111827 !important; }",
        ".section-count { color: #9ca3af !important; }",
        ".tldr { background: linear-gradient(135deg, #f0fdf9 0%, #ecfdf5 50%, #f0fdf9 100%) !important; border-color: rgba(10, 158, 128, 0.2) !important; }",
        ".tldr::before { background: linear-gradient(90deg, transparent, #0a9e80, #078a6e, #0a9e80, transparent) !important; }",
        ".tldr-badge { color: #0a9e80 !important; background: rgba(10, 158, 128, 0.08) !important; border-color: rgba(10, 158, 128, 0.15) !important; }",
        ".tldr-item { color: #1f2937 !important; }",
        ".tldr-item::before { background: #0a9e80 !important; box-shadow: 0 0 8px rgba(10, 158, 128, 0.3) !important; }",
        ".tldr-item strong { color: #111827 !important; }",
        ".tldr-item em { color: #078a6e !important; }",
        ".tldr-item + .tldr-item { border-color: rgba(0, 0, 0, 0.06) !important; }",
        ".section { border-color: rgba(0, 0, 0, 0.06) !important; }",
        ".news-headline { color: #374151 !important; }",
        ".news-headline strong { color: #111827 !important; }",
        ".news-sources, .news-sources a { color: #9ca3af !important; }",
        ".news-sources a:hover { color: #0a9e80 !important; }",
        ".news-item + .news-item, .x-post + .x-post { border-color: rgba(0, 0, 0, 0.06) !important; }",
        ".x-text { color: #374151 !important; }",
        ".x-text strong { color: #111827 !important; }",
        ".x-marker { color: #9ca3af !important; }",
        ".news-bullet { background: #d1d5db !important; }",
        ".context-inline { background: rgba(0, 0, 0, 0.02) !important; border-color: rgba(0, 0, 0, 0.08) !important; }",
        ".context-label { color: #9ca3af !important; }",
        ".context-item { color: #6b7280 !important; }",
        ".footer { border-color: rgba(0, 0, 0, 0.06) !important; }",
        ".health-pill { color: #059669 !important; background: rgba(5, 150, 105, 0.06) !important; border-color: rgba(5, 150, 105, 0.1) !important; }",
        ".health-pill::before { background: #059669 !important; }",
      ].join("\n");

  const overrideCSS = `<style data-jj-theme>\n${mintOverrides}\n${lightOverrides}\n</style>`;

  if (html.includes("</head>")) {
    return html.replace("</head>", overrideCSS + "</head>");
  }
  return overrideCSS + html;
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

  const rawHtml = tab === "am" ? amHtml : pmHtml;
  const currentHtml = rawHtml ? injectThemeOverride(rawHtml, isDark) : null;

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

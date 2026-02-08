"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface DateNavProps {
  currentDate: string;
  dates: string[];
}

export function DateNav({ currentDate, dates }: DateNavProps) {
  const pathname = usePathname();
  const idx = dates.indexOf(currentDate);
  const newerDate = idx > 0 ? dates[idx - 1] : null;
  const olderDate = idx < dates.length - 1 ? dates[idx + 1] : null;

  const subPath = pathname.replace(`/${currentDate}`, "");

  return (
    <div className="flex items-center gap-3">
      {olderDate ? (
        <Link
          href={`/${olderDate}${subPath}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-tertiary transition-colors hover:border-accent/40 hover:text-accent"
          aria-label="Previous day"
        >
          &#8592;
        </Link>
      ) : (
        <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-subtle text-text-tertiary/30">
          &#8592;
        </span>
      )}

      <time className="text-lg font-semibold tracking-tight text-text-primary">
        {currentDate}
      </time>

      {newerDate ? (
        <Link
          href={`/${newerDate}${subPath}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-tertiary transition-colors hover:border-accent/40 hover:text-accent"
          aria-label="Next day"
        >
          &#8594;
        </Link>
      ) : (
        <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-subtle text-text-tertiary/30">
          &#8594;
        </span>
      )}
    </div>
  );
}

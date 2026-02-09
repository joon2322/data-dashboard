"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useCallback } from "react";

interface DateNavProps {
  currentDate: string;
  dates: string[];
}

export function DateNav({ currentDate, dates }: DateNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const idx = dates.indexOf(currentDate);
  const newerDate = idx > 0 ? dates[idx - 1] : null;
  const olderDate = idx < dates.length - 1 ? dates[idx + 1] : null;

  const subPath = pathname.replace(`/daily/${currentDate}`, "");
  const touchStartX = useRef<number | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartX.current === null) return;
      const diff = e.changedTouches[0].clientX - touchStartX.current;
      touchStartX.current = null;
      if (Math.abs(diff) < 60) return;
      if (diff > 0 && olderDate) {
        router.push(`/daily/${olderDate}${subPath}`);
      } else if (diff < 0 && newerDate) {
        router.push(`/daily/${newerDate}${subPath}`);
      }
    },
    [olderDate, newerDate, subPath, router]
  );

  return (
    <div
      className="flex items-center gap-3"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {olderDate ? (
        <Link
          href={`/daily/${olderDate}${subPath}`}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-tertiary transition-colors hover:border-accent/40 hover:text-accent"
          aria-label="Previous day"
        >
          &#8592;
        </Link>
      ) : (
        <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-subtle text-text-tertiary/30">
          &#8592;
        </span>
      )}

      <time className="text-lg font-semibold tracking-tight text-text-primary">
        {(() => {
          const d = new Date(currentDate + "T00:00:00");
          const month = d.getMonth() + 1;
          const day = d.getDate();
          const weekday = ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];
          return `${month}월 ${day}일 ${weekday}요일`;
        })()}
      </time>

      {newerDate ? (
        <Link
          href={`/daily/${newerDate}${subPath}`}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-tertiary transition-colors hover:border-accent/40 hover:text-accent"
          aria-label="Next day"
        >
          &#8594;
        </Link>
      ) : (
        <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-subtle text-text-tertiary/30">
          &#8594;
        </span>
      )}
    </div>
  );
}

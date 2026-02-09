"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DAILY_SECTIONS } from "@/lib/types";

interface SectionTabsProps {
  date: string;
}

export function SectionTabs({ date }: SectionTabsProps) {
  const pathname = usePathname();

  return (
    <div className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-px sm:mx-0 sm:px-0">
      {DAILY_SECTIONS.map((s) => {
        const href = `/daily/${date}${s.href}`;
        const isActive =
          s.href === ""
            ? pathname === `/daily/${date}`
            : pathname === `/daily/${date}${s.href}`;

        return (
          <Link
            key={s.key}
            href={href}
            className={`shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "bg-accent/10 text-accent"
                : "text-text-tertiary hover:bg-surface-hover hover:text-text-secondary"
            }`}
          >
            {s.labelKr ?? s.label}
          </Link>
        );
      })}
    </div>
  );
}

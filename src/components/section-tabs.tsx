"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SECTIONS } from "@/lib/types";

interface SectionTabsProps {
  date: string;
}

export function SectionTabs({ date }: SectionTabsProps) {
  const pathname = usePathname();

  return (
    <div className="flex gap-1 overflow-x-auto border-b border-border-subtle pb-px">
      {SECTIONS.map((s) => {
        const href = `/${date}${s.href}`;
        const isActive =
          s.href === ""
            ? pathname === `/${date}`
            : pathname === `/${date}${s.href}`;

        return (
          <Link
            key={s.key}
            href={href}
            className={`shrink-0 rounded-t-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "border-b-2 border-accent bg-surface text-accent"
                : "text-text-tertiary hover:bg-surface-hover hover:text-text-secondary"
            }`}
          >
            {s.label}
          </Link>
        );
      })}
    </div>
  );
}

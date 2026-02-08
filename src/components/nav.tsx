import Link from "next/link";

export function Nav() {
  return (
    <nav className="fixed top-0 z-50 w-full border-b border-border-subtle bg-base/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="text-lg font-bold tracking-tight text-accent">
            JD
          </span>
          <span className="hidden text-sm text-text-tertiary sm:inline">
            data.jinkojoon.com
          </span>
        </Link>
      </div>
    </nav>
  );
}

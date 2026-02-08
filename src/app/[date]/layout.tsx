import { notFound } from "next/navigation";
import { getAvailableDates } from "@/lib/data";
import { DateNav } from "@/components/date-nav";
import { SectionTabs } from "@/components/section-tabs";

interface DateLayoutProps {
  children: React.ReactNode;
  params: Promise<{ date: string }>;
}

export default async function DateLayout({ children, params }: DateLayoutProps) {
  const { date } = await params;
  const dates = getAvailableDates();

  if (!dates.includes(date)) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <DateNav currentDate={date} dates={dates} />
      </div>
      <SectionTabs date={date} />
      <div className="mt-6">{children}</div>
    </div>
  );
}

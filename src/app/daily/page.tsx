import { redirect } from "next/navigation";
import { getAvailableDates } from "@/lib/data";

export default function DailyIndexPage() {
  const dates = getAvailableDates();
  if (dates.length > 0) {
    redirect(`/daily/${dates[0]}`);
  }
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center px-4">
      <p className="text-text-tertiary">No daily data available yet.</p>
    </div>
  );
}

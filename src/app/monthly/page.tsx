import { redirect } from "next/navigation";
import { getAvailableMonths } from "@/lib/data";

export default function MonthlyIndexPage() {
  const months = getAvailableMonths();
  if (months.length > 0) {
    redirect(`/monthly/${months[0]}`);
  }
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center px-4">
      <p className="text-text-tertiary">No monthly briefings available yet.</p>
    </div>
  );
}

import { redirect } from "next/navigation";
import { getAvailableWeeks } from "@/lib/data";

export default function WeeklyIndexPage() {
  const weeks = getAvailableWeeks();
  if (weeks.length > 0) {
    redirect(`/weekly/${weeks[0]}`);
  }
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center px-4">
      <p className="text-text-tertiary">No weekly briefings available yet.</p>
    </div>
  );
}

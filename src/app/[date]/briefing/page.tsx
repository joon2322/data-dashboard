import { getBriefingHtml } from "@/lib/data";
import { BriefingViewer } from "@/components/briefing-viewer";

interface BriefingPageProps {
  params: Promise<{ date: string }>;
}

export default async function BriefingPage({ params }: BriefingPageProps) {
  const { date } = await params;

  const amHtml = getBriefingHtml(date, "am");
  const pmHtml = getBriefingHtml(date, "pm");

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-text-primary">
        Daily Briefing
      </h2>
      <BriefingViewer amHtml={amHtml} pmHtml={pmHtml} />
    </div>
  );
}

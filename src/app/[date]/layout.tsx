import { redirect } from "next/navigation";

interface DateLayoutProps {
  children: React.ReactNode;
  params: Promise<{ date: string }>;
}

export default async function DateLayout({ children, params }: DateLayoutProps) {
  const { date } = await params;
  redirect(`/daily/${date}`);
  return <>{children}</>;
}

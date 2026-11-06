import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Wordmark } from "@/components/chrome";
import { StopButton } from "@/components/unsubscribe";
import { buyerByToken } from "@/lib/store";
export const metadata: Metadata = { title: "Stop reminders", robots: { index: false } };
export const dynamic = "force-dynamic";
export default async function Unsub({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!(await buyerByToken(token))) notFound();
  return <main className="wrap max-w-xl py-16"><Wordmark /><h1 className="mb-3 mt-10 text-4xl font-semibold">Stop reminders?</h1><p className="mb-6 text-muted-foreground">We'll stop automatic reminders about this listing. Advisors can still reply if you contact them.</p><StopButton token={token} /></main>;
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AccessFlow } from "@/components/access-flow";
import { Wordmark } from "@/components/chrome";
import { getListing } from "@/content/listings";
import { nda } from "@/content/nda";
import { publicBuyer } from "@/lib/flow";
import { ruleFor } from "@/lib/rules";
import { buyerByToken } from "@/lib/store";

export const metadata: Metadata = { title: "Your private access", robots: { index: false } };
export const dynamic = "force-dynamic";
export default async function Access({ params, searchParams }: { params: Promise<{ token: string }>; searchParams: Promise<{ v?: string }> }) {
  const { token } = await params; const { v } = await searchParams;
  const b = await buyerByToken(token);
  if (!b) notFound();
  const l = getListing(b.listingSlug)!;
  const verified = v === b.verifyCode;
  const rule = await ruleFor(l);
  const local = process.env.TEST_MODE === "true" || (!process.env.RESEND_API_KEY && !process.env.VERCEL);
  return (
    <div className="min-h-dvh">
      <header className="border-b"><div className="wrap flex h-14 items-center"><Wordmark /></div></header>
      <main className="wrap max-w-xl py-8 md:py-12">
        <AccessFlow token={token} code={verified ? v! : undefined} buyer={publicBuyer(b)} listing={{ title: l.title, askLabel: l.askLabel, floor: rule.floorUsd, idealBuyer: l.idealBuyer, gate: rule.gate }} clauses={nda.clauses} ndaDraft={process.env.NDA_APPROVED !== "true"} localLink={local ? `/access/${token}?v=${b.verifyCode}` : undefined} />
      </main>
    </div>
  );
}

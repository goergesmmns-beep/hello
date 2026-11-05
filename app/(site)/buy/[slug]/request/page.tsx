import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RequestForm } from "@/components/forms";
import { getListing, listings } from "@/content/listings";
export const metadata: Metadata = { title: "Request access", robots: { index: false } };
export const generateStaticParams = () => listings.filter((l) => l.status !== "pending").map((l) => ({ slug: l.slug }));
export default async function Req({ params }: { params: Promise<{ slug: string }> }) {
  const l = getListing((await params).slug);
  if (!l || l.status === "pending") notFound();
  return <section className="wrap max-w-2xl py-16"><p className="eyebrow mb-3">{l.title}</p><h1 className="h2">Start your NDA.</h1><p className="lede mb-8 mt-4">Tell us who you are. We will email you a private link so you can finish on any device.</p><RequestForm slug={l.slug} /></section>;
}

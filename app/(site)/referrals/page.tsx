import type { Metadata } from "next";
import Link from "next/link";
import { PageHead } from "@/components/ui";
export const metadata: Metadata = { title: "Referral program" };
const rules = [["Who qualifies", "Owners selling a business with at least $1M in annual revenue, or owners who want to acquire."], ["What you earn", "A $1,000 payment for a signed client engagement, plus 10% of additional success fees, commissions or retainers."], ["How it counts", "Make an active introduction by email or, preferably, a Zoom meeting. Contact us first to confirm fit."], ["In writing", "We offer a written referral contract."]];
export default function Referrals() {
  return (<><PageHead eyebrow="Referral program" title="Introduce a business owner. Get paid." lede="We reward people who introduce us to owners ready to sell or acquire." />
    <section className="wrap py-14 md:py-20"><dl className="border-t">{rules.map(([h, t]) => <div key={h} className="grid gap-2 border-b py-5 md:grid-cols-[260px_1fr]"><dt className="text-xl font-semibold tracking-tight">{h}</dt><dd className="text-muted-foreground">{t}</dd></div>)}</dl><Link href="/contact" className="btn btn-primary mt-8">Contact us</Link></section></>);
}

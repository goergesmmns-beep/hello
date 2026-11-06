import type { Metadata } from "next";
import { Banknote, Crosshair, FileSearch, Handshake, PieChart, Search, TrendingUp, Users } from "lucide-react";
import { Cta, PageHead } from "@/components/ui";
import { GrowCompare } from "@/components/grow-compare";
import { SectionHead } from "@/components/sections";
export const metadata: Metadata = { title: "Grow through acquisition" };
const why = [[PieChart, "Expand market share", "Buy a competitor, vendor or strategic partner."], [TrendingUp, "Boost profitability", "Add profitable revenue you do not have to build from zero."], [Users, "Bring in talent", "Acquire a team that already knows the work."], [Banknote, "Increase enterprise value", "Grow what your own business is worth."]] as const;
const steps = [[Crosshair, "Acquisition strategy", "Decide if buying fits your plan, what to buy and when."], [Search, "Sourcing", "Find on-market and off-market targets that match."], [Banknote, "Funding plan", "Structure the deal so you keep your cash reserves."], [Handshake, "Offer and LOI", "Price, terms and structure, negotiated for you."], [FileSearch, "Diligence and close", "Coordinated diligence through to closing day."]] as const;
export default function Grow() {
  return (<>
    <PageHead eyebrow="Buy-side advisory" title="Growth through acquisition, with advisors who have done it." lede="We help you decide if an acquisition is right, when to act and how to structure the deal. Add $1M, $5M or even $20M in profitable revenue." stats={[["230+", "acquisition funding strategies"], ["$1M to $20M", "profitable revenue you can add"], ["CM&AA", "Certified M&A Advisors lead"], ["1", "advisor team from plan to close"]]} />
    <section className="wrap py-16 md:py-24"><SectionHead eyebrow="Why acquire" title="Buy the growth you would otherwise build." /><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{why.map(([I, h, t]) => <article key={h} className="lift ringcard p-6"><I size={22} className="text-brand-ink" /><h3 className="mt-5 text-lg font-semibold tracking-tight">{h}</h3><p className="mt-2 text-[15px] text-muted-foreground">{t}</p></article>)}</div></section>
    <section className="border-y bg-muted/40"><div className="wrap py-16 md:py-24"><SectionHead eyebrow="Compare" title="Organic growth or acquisition?" /><GrowCompare /></div></section>
    <section className="wrap py-16 md:py-24"><SectionHead eyebrow="How it works" title="A buy-side search, run for you." /><ol className="grid gap-px overflow-hidden ringcard bg-border md:grid-cols-5">{steps.map(([I, h, t], i) => <li key={h} className="bg-background p-6"><div className="flex items-center justify-between"><I size={20} className="text-brand-ink" /><span className="num text-sm text-muted-foreground">0{i + 1}</span></div><h3 className="mt-6 font-semibold">{h}</h3><p className="mt-2 text-[15px] text-muted-foreground">{t}</p></li>)}</ol></section>
    <Cta title="You don't need a pile of cash." text="We have over 230 creative funding strategies that can help you acquire without draining your reserves." href="/contact" label="Get a strategy session" />
  </>);
}

import type { Metadata } from "next";
import { Building2, Rocket, Store } from "lucide-react";
import { Cta, PageHead } from "@/components/ui";
import { RouteCards, SectionHead } from "@/components/sections";
import { differences, stats, team } from "@/content/site";
export const metadata: Metadata = { title: "About" };
export default function About() {
  return (<>
    <PageHead eyebrow="About" title="Save jobs, grow companies and add enterprise value." lede="Westbound Road helps people buy and sell digital businesses, including e-commerce, software and SaaS, and marketing and business-services agencies, for clients around the world." stats={stats.map((s) => [s.value, s.label] as [string, string])} />
    <section className="wrap py-16 md:py-24"><SectionHead eyebrow="What we do" title="One team for every side of the deal." />
      <RouteCards items={[["For sellers", "A complimentary strategy session covers timing, pricing, risk, and how to handle employee and customer communication during a sale.", "/sell", Store], ["For buyers", "Curated businesses, a one-tap NDA and a private deal room, with over 230 strategies for acquiring without depleting cash reserves.", "/buy", Building2], ["For growing companies", "We help companies decide if acquisition fits their growth plans, when to act, and how to execute.", "/grow", Rocket]]} /></section>
    <section className="border-y bg-muted/40"><div className="wrap py-16 md:py-24"><SectionHead eyebrow="How we work" title="Operators first, advisors always." /><div className="grid gap-px overflow-hidden ringcard bg-border md:grid-cols-2 lg:grid-cols-3">{differences.map(([h, t], i) => <article key={h} className="bg-background p-7"><span className="num text-sm text-brand-ink">0{i + 1}</span><h3 className="mt-4 text-lg font-semibold tracking-tight">{h}</h3><p className="mt-2 text-[15px] text-muted-foreground">{t}</p></article>)}</div></div></section>
    <section className="wrap py-16 md:py-24"><SectionHead eyebrow="The team" title="Who you will work with." action={<a href="/team" className="btn btn-ghost">Meet the team</a>} /><ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">{team.map((m) => <li key={m.id}><a href={`/team#${m.id}`} className="lift block ringcard p-5"><span className="grid size-12 place-items-center rounded-xl bg-foreground font-semibold text-background">{m.name.split(" ").filter((x) => /^[A-Z]/.test(x) && !x.endsWith(".")).map((x) => x[0]).slice(0, 2).join("")}</span><b className="mt-4 block leading-snug">{m.name}</b><span className="text-sm text-muted-foreground">{m.role}</span></a></li>)}</ul></section>
    <Cta title="Both founding partners are Certified M&A Advisors." text="Designated by the Alliance of M&A Advisors." href="/team" label="Meet the team" />
  </>);
}

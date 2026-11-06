import type { Metadata } from "next";
import { Check, Clock, Lock, UserCheck } from "lucide-react";
import { PageHead } from "@/components/ui";
import { Faq, SectionHead } from "@/components/sections";
import { ValuationWizard } from "@/components/valuation-wizard";
export const metadata: Metadata = { title: "What's my business worth?", description: "A free, confidential business valuation from Certified M&A Advisors." };
const factors = ["Financial analysis, including SDE or EBITDA and add-backs", "Market research", "Asset evaluation", "Market timing", "Growth potential", "Comparison against industry peers", "Deal structure, including cash at close, seller financing and earn-outs"];
export default function Valuation() {
  return (<>
    <PageHead eyebrow="Business valuation" title="What is your business really worth?" lede="A free, confidential valuation for qualifying owners considering an exit. Four short steps, on any device." />
    <section className="wrap grid gap-12 py-12 md:py-20 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
      <div className="lg:order-2"><ValuationWizard /></div>
      <div className="lg:order-1">
        <ul className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">{[[Lock, "Confidential", "Seen only by our advisors. Nothing goes to buyers."], [UserCheck, "Done by a person", "A Certified M&A Advisor reviews it, not an algorithm."], [Clock, "Built for decisions", "Value, timing and structure, so you can plan your exit."]].map(([I, h, t]) => { const X = I as typeof Lock; return <li key={h as string} className="flex gap-4 rounded-2xl border p-5"><span className="grid size-10 shrink-0 place-items-center rounded-lg bg-foreground text-background"><X size={18} /></span><span><b className="block">{h as string}</b><span className="text-[15px] text-muted-foreground">{t as string}</span></span></li>; })}</ul>
        <h2 className="mt-10 text-2xl font-semibold tracking-tight">What we review</h2>
        <ul className="mt-4 space-y-2.5">{factors.map((f) => <li key={f} className="flex gap-2.5"><Check size={18} className="mt-0.5 shrink-0 text-brand-ink" />{f}</li>)}</ul>
      </div>
    </section>
    <section className="wrap pb-16 md:pb-24"><SectionHead eyebrow="Questions" title="Before you start." /><Faq items={[["Is it really free?", "Yes, for qualifying owners considering an exit. There is no obligation to list with us."], ["Will anyone know I asked?", "No. Your answers go only to Westbound Road advisors."], ["What should I have ready?", "Rough annual revenue and profit are enough to start. We ask for detail later if it helps."]]} /></section>
  </>);
}

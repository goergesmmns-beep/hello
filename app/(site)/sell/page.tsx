import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BarChart3, Cpu, FileSearch, FileText, GraduationCap, Handshake, Megaphone, Newspaper, Repeat, ShieldCheck, ShoppingBag, Target, Users } from "lucide-react";
import { Cta, PageHead } from "@/components/ui";
import { ContactForm } from "@/components/forms";
import { Faq, Quotes, SectionHead, Tombstones } from "@/components/sections";
import { SellerPreview } from "@/components/seller-preview";
import { differences, soldDeals, stats } from "@/content/site";
export const metadata: Metadata = { title: "Sell your business", description: "Sell-side M&A advisory for founders of digital and tech-enabled businesses, from valuation to close." };
const sectors = [[Cpu, "SaaS and software"], [ShoppingBag, "eCommerce and DTC"], [Megaphone, "Marketing and digital agencies"], [GraduationCap, "eLearning"], [Repeat, "Subscription and membership"], [Newspaper, "Publishing and media"]] as const;
const steps = [
  [Target, "Valuation and exit preparation", "We tell you what your business is really worth, then prepare your financials and sale materials. Allow a couple of months.", ["Valuation and positioning", "Financial clean-up and add-backs", "Confidential Information Memorandum"]],
  [Megaphone, "Confidential marketing", "We take the opportunity to market without disclosing your identity until a buyer signs an NDA.", ["Anonymous teaser and listing", "Multi-channel buyer outreach", "Deal alerts to matched buyers"]],
  [ShieldCheck, "Buyer screening", "We qualify entrepreneurial and corporate buyers before they reach you.", ["E-signed NDA on every buyer", "Proof of funds reviewed by an advisor", "Financing routes for serious buyers"]],
  [Handshake, "Offers and LOI", "We manage competing offers and negotiate price and terms, including cash at close, seller financing and earn-outs.", ["Every offer logged and compared", "Negotiation on price and structure", "LOI with clear terms"]],
  [FileSearch, "Due diligence", "We coordinate requests and keep the deal moving while you run the business.", ["Private deal room with watermarked files", "Buyer Q&A handled by advisors", "Diligence tracking"]],
  [FileText, "Close and transition", "We stay with you until the deal is done and your money is in the bank.", ["Closing coordination", "Transition planning", "Staff and customer communication plan"]],
] as const;
const qs = [
  ["Will my staff and customers find out?", "Confidentiality is built into the process. Buyers sign an NDA before they learn who you are, every file they open is stamped with their email, and we plan how and when to tell your team."],
  ["Will I leave money on the table?", "We position the business for maximum value and create competition among buyers. Our deals average 5 offers."],
  ["Can I keep running the business?", "Yes. We handle buyer calls, questions and paperwork so you can stay focused on the company."],
  ["How do you know a buyer is real?", "Every buyer signs the NDA electronically and shows proof of funds or a financing plan. An advisor reviews it before your CIM is released."],
  ["Is it the right time to sell?", "A complimentary strategy session gives you straight answers on timing, value and what buyers want."],
] as const;
export default function Sell() {
  return (<>
    <PageHead eyebrow="Sell-side advisory" title="Sell your business, from valuation to close." lede="A confidential, competitive process run by Certified M&A Advisors who have built and sold businesses themselves, so you can stay focused on running the company." stats={stats.map((s) => [s.value, s.label] as [string, string])}>
      <div className="mt-8 flex flex-wrap gap-3"><Link href="/valuation" className="btn btn-brand">Get a free valuation <ArrowRight size={17} /></Link><Link href="/login?intent=sell&next=%2Faccount%2Fsell%2Fnew" className="btn btn-ghost">List your business online</Link><a href="#session" className="btn btn-ghost">Book a strategy session</a></div>
    </PageHead>
    <section className="border-b"><div className="wrap flex flex-wrap items-center gap-x-8 gap-y-3 py-6"><p className="eyebrow">We sell</p>{sectors.map(([I, t]) => <span key={t} className="flex items-center gap-2 text-[15px] font-medium"><I size={17} className="text-brand-ink" />{t}</span>)}</div></section>

    <section className="wrap py-16 md:py-28"><SectionHead eyebrow="The process" title="Every sale deserves a strategy, not just a listing." lede="Six stages, one advisor team, no handoffs." />
      <ol className="relative grid gap-3 md:grid-cols-2 lg:grid-cols-3">{steps.map(([I, h, t, gets], i) => <li key={h} className="lift flex flex-col ringcard p-6"><div className="flex items-center justify-between"><span className="grid size-11 place-items-center rounded-xl bg-foreground text-background"><I size={20} /></span><span className="num text-sm text-muted-foreground">0{i + 1}</span></div><h3 className="mt-6 text-xl font-semibold tracking-tight">{h}</h3><p className="mt-2 text-muted-foreground">{t}</p><ul className="mt-auto space-y-1.5 border-t pt-4 text-sm [margin-top:max(1.25rem,auto)]">{gets.map((g) => <li key={g} className="flex gap-2"><span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-brand" />{g}</li>)}</ul></li>)}</ol>
    </section>

    <section className="overflow-hidden border-y bg-muted/40"><div className="wrap grid items-center gap-12 py-16 md:py-24 lg:grid-cols-2">
      <div><p className="eyebrow mb-3 flex items-center gap-2"><span aria-hidden className="inline-block h-px w-6 bg-brand" />See every buyer</p><h2 className="h2">Know exactly who is serious.</h2><p className="lede mt-4">Most brokers send you a weekly email. You get a live report: who signed, who showed funds, who opened the deal room and who made an offer, without exposing a single name.</p>
        <ul className="mt-7 grid gap-3 sm:grid-cols-2">{[[ShieldCheck, "NDA and funds checked before your CIM goes out"], [BarChart3, "Live funnel from inquiry to offer"], [Users, "Buyers routed to financing, not lost"], [Handshake, "Every offer and term in one place"]].map(([I, t]) => { const X = I as typeof ShieldCheck; return <li key={t as string} className="flex gap-3"><X size={19} className="mt-0.5 shrink-0 text-brand-ink" /><span className="font-medium">{t as string}</span></li>; })}</ul></div>
      <SellerPreview />
    </div></section>

    <section className="wrap py-16 md:py-28"><SectionHead eyebrow="Why Westbound Road" title="Advisors, not listing agents." />
      <div className="grid gap-px overflow-hidden ringcard bg-border md:grid-cols-2 lg:grid-cols-3">{differences.map(([h, t], i) => <article key={h} className="bg-background p-7"><span className="num text-sm text-brand-ink">0{i + 1}</span><h3 className="mt-4 text-lg font-semibold tracking-tight">{h}</h3><p className="mt-2 text-[15px] text-muted-foreground">{t}</p></article>)}</div></section>

    <section className="border-t bg-muted/40"><div className="wrap py-16 md:py-24"><SectionHead eyebrow="Track record" title={`${soldDeals.length}+ exits across SaaS, DTC, agencies and more.`} action={<Link href="/success" className="btn btn-ghost">All results</Link>} /><Tombstones limit={8} /></div></section>
    <section className="wrap py-16 md:py-24"><SectionHead eyebrow="From founders" title="In their own words." /><Quotes side="Seller" /></section>
    <section className="wrap pb-16 md:pb-24"><SectionHead eyebrow="Questions" title="What founders ask us." /><Faq items={qs} /></section>

    <section id="session" className="dark mesh scroll-mt-16 bg-background text-foreground"><div className="wrap grid gap-10 py-16 md:grid-cols-[1fr_1.2fr] md:py-24"><div><p className="eyebrow mb-3 !text-brand">Strictly confidential</p><h2 className="h2">Start with a strategy session.</h2><p className="lede mt-4">Tell us about your business. Your inquiry goes only to our advisors, never to a buyer.</p></div>
      <div className="ringcard bg-card/60 p-5 backdrop-blur md:p-7"><ContactForm kind="Seller inquiry" submit="Request a confidential strategy session" done="Thanks. An advisor will be in touch shortly." fields={[{ name: "name", label: "Name", required: true }, { name: "email", label: "Email", type: "email", required: true }, { name: "phone", label: "Phone", type: "tel", required: true }, { name: "company", label: "Company name", required: true }, { name: "url", label: "Business URL", required: true }, { name: "details", label: "Details about your business", area: true, required: true }]} /></div></div></section>
  </>);
}

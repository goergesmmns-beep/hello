import type { Metadata } from "next";
import { Cta, PageHead } from "@/components/ui";
import { ContactForm } from "@/components/forms";
export const metadata: Metadata = { title: "Sell your business", description: "Sell-side M&A advisory for founders of digital businesses, from valuation to close." };
const steps = [
  ["Valuation and exit preparation", "We tell you what your business is really worth, then prepare your financials and sale materials. Allow a couple of months."],
  ["Confidential marketing", "We take the opportunity to market without disclosing your identity until a buyer signs an NDA."],
  ["Buyer screening", "We qualify entrepreneurial and corporate buyers before they reach you."],
  ["Offers and LOI", "We manage competing offers and negotiate price and terms, including cash at close, seller financing and earn-outs."],
  ["Due diligence", "We coordinate requests and keep the deal moving while you run the business."],
  ["Close and transition", "We stay with you until the deal is done and your money is in the bank."],
];
const qs = [
  ["Will my staff and customers find out?", "Confidentiality is built into the process. Buyers sign an NDA before they learn who you are, and we plan how and when to tell your team."],
  ["Will I leave money on the table?", "We position the business for maximum value and create competition among buyers. Our deals average 5 offers."],
  ["Can I keep running the business?", "Yes. We handle buyer calls, questions and paperwork so you can stay focused on the company."],
  ["Is it the right time to sell?", "A complimentary strategy session gives you straight answers on timing, value and what buyers want."],
];
export default function Sell() {
  return (<>
    <PageHead eyebrow="Sell-side advisory" title="Sell your business, from valuation to close." lede="A confidential, competitive process run by advisors who have built and sold businesses themselves, so you can stay focused on running the company." />
    <section className="wrap py-16 md:py-24"><h2 className="h2 max-w-2xl">Every sale deserves a strategy, not just a listing.</h2>
      <ol className="mt-10 border-t">{steps.map(([h, t], i) => <li key={h} className="grid gap-2 border-b py-6 md:grid-cols-[60px_340px_1fr]"><span className="num text-brand-ink">0{i + 1}</span><h3 className="text-xl font-semibold tracking-tight">{h}</h3><p className="text-muted-foreground">{t}</p></li>)}</ol></section>
    <section className="dark bg-background text-foreground"><div className="wrap py-16 md:py-24"><h2 className="h2 mb-8">What founders ask us.</h2><dl className="grid gap-px overflow-hidden rounded-lg border bg-border md:grid-cols-2">{qs.map(([q, a]) => <div key={q} className="bg-background p-7"><dt className="text-xl font-semibold tracking-tight">{q}</dt><dd className="mt-2 text-muted-foreground">{a}</dd></div>)}</dl></div></section>
    <section><div className="wrap grid gap-10 py-16 md:grid-cols-2 md:py-24"><div><p className="eyebrow mb-3">Strictly confidential</p><h2 className="h2">Start with a strategy session.</h2><p className="lede mt-4">Tell us about your business. Your inquiry goes only to our advisors.</p></div>
      <ContactForm kind="Seller inquiry" submit="Request a confidential strategy session" done="Thanks. An advisor will be in touch shortly." fields={[{ name: "name", label: "Name", required: true }, { name: "email", label: "Email", type: "email", required: true }, { name: "phone", label: "Phone", type: "tel", required: true }, { name: "company", label: "Company name", required: true }, { name: "url", label: "Business URL", required: true }, { name: "details", label: "Details about your business", area: true, required: true }]} /></div></section>
    <Cta title="Not sure what it's worth?" text="Start with a free, confidential valuation." href="/valuation" label="Get a free valuation" />
  </>);
}

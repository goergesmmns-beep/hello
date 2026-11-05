import type { Metadata } from "next";
import { Cta, PageHead } from "@/components/ui";
import { ContactForm } from "@/components/forms";
export const metadata: Metadata = { title: "Sell your business" };
const steps = [
  ["Valuation and preparation", "We tell you what your business is really worth and get financials and marketing materials ready. Allow a couple of months."],
  ["Buyer outreach", "A multi-channel campaign reaches entrepreneurial and corporate buyers, with confidentiality protected."],
  ["Negotiation", "We manage offers and terms, including upfront cash, seller financing and earn-outs."],
  ["Due diligence and closing", "We stay with you until the deal is done and your money is in the bank."],
];
export default function Sell() {
  return (<>
    <PageHead eyebrow="Sell your business" title="Maximum value. Minimal hassle." lede="We guide founders through the entire exit process with clarity, strategy and confidence." />
    <section className="wrap py-16 md:py-24"><h2 className="h2 max-w-2xl">Every sale deserves a strategy, not just a listing.</h2>
      <ol className="mt-10 border-t">{steps.map(([h, t], i) => <li key={h} className="grid gap-2 border-b py-6 md:grid-cols-[60px_320px_1fr]"><span className="num text-brand-ink">0{i + 1}</span><h3 className="text-xl font-semibold tracking-tight">{h}</h3><p className="text-muted-foreground">{t}</p></li>)}</ol></section>
    <section className="border-t"><div className="wrap grid gap-10 py-16 md:grid-cols-2 md:py-24"><div><p className="eyebrow mb-3">Timing</p><h2 className="h2">The best time to prepare is now.</h2><p className="lede mt-4">Entrepreneurial and corporate buyers both become active in January, and a sale needs a couple of months of preparation first.</p></div>
      <ContactForm kind="Seller inquiry" submit="Request a strategy session" done="Thanks. An advisor will be in touch shortly." fields={[{ name: "name", label: "Name", required: true }, { name: "email", label: "Email", type: "email", required: true }, { name: "phone", label: "Phone", type: "tel", required: true }, { name: "company", label: "Company name", required: true }, { name: "url", label: "Business URL", required: true }, { name: "details", label: "Details about your business", area: true, required: true }]} /></div></section>
    <Cta title="Not sure what it's worth?" text="Start with a valuation." href="/valuation" label="What's my business worth?" />
  </>);
}

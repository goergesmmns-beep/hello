import type { Metadata } from "next";
import { PageHead } from "@/components/ui";
import { ContactForm } from "@/components/forms";
export const metadata: Metadata = { title: "What's my business worth?" };
const factors = ["Financial analysis, including SDE or EBITDA and add-backs", "Market research", "Asset evaluation", "Market timing", "Growth potential", "Comparison against industry peers", "Deal structure, including cash at close, seller financing and earn-outs"];
export default function Valuation() {
  return (<>
    <PageHead eyebrow="Business valuation" title="What is your business really worth?" lede="A free, confidential valuation for qualifying owners considering an exit." />
    <section className="wrap grid gap-12 py-16 md:grid-cols-[1fr_1.4fr] md:py-24">
      <div><h2 className="text-3xl font-semibold">What we review</h2><ol className="mt-6 border-t">{factors.map((f, i) => <li key={f} className="grid grid-cols-[40px_1fr] border-b py-3"><span className="num text-brand-ink">{i + 1}</span>{f}</li>)}</ol></div>
      <ContactForm kind="Valuation request" submit="Get my free valuation" done="Thanks. An advisor will review your details and be in touch." fields={[
        { name: "name", label: "Name", required: true }, { name: "email", label: "Email", type: "email", required: true }, { name: "phone", label: "Phone", type: "tel", required: true }, { name: "company", label: "Company name", required: true }, { name: "url", label: "Business URL", required: true },
        { name: "industry", label: "Industry", required: true, options: ["Agency (marketing, advertising, digital)", "DTC", "eCommerce", "eLearning", "Membership/Subscription", "Publishing", "SaaS / Software / Mobile Apps", "Other"] },
        { name: "revenue", label: "Annual revenue", required: true, options: ["Under $1 million", "$1 million to $5 million", "$5 million to $10 million", "$10 million to $20 million", "$20 million or more"] },
        { name: "timeline", label: "Desired timeline to sell", required: true, options: ["Within the next 90 days", "3 to 6 months", "6 to 12 months", "1 year or more"] },
        { name: "details", label: "Details about your business", area: true, required: true }]} />
    </section></>);
}

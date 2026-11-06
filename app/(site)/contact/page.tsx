import type { Metadata } from "next";
import { Building2, Phone, Rocket, Store } from "lucide-react";
import { PageHead } from "@/components/ui";
import { ContactForm } from "@/components/forms";
import { RouteCards } from "@/components/sections";
import { company } from "@/content/site";
export const metadata: Metadata = { title: "Contact" };
export default function Contact() {
  return (<><PageHead eyebrow="Contact" title="Buying, selling or have questions?" lede="Every message goes straight to an advisor." />
    <section className="wrap py-12 md:py-16"><RouteCards items={[["Selling a business", "Start with a free, confidential valuation.", "/valuation", Store], ["Buying a business", "Browse listings and request a deal room.", "/buy", Building2], ["Growing by acquisition", "Plan a buy-side search and funding.", "/grow", Rocket]]} /></section>
    <section className="wrap grid gap-10 pb-16 md:pb-24 lg:grid-cols-[1fr_1.6fr]">
      <div className="space-y-5"><a href={`tel:${company.phone.replace(/\D/g, "")}`} className="lift flex items-center gap-4 ringcard p-6"><span className="grid size-11 place-items-center rounded-xl bg-foreground text-background"><Phone size={19} /></span><span><span className="eyebrow block">Call</span><span className="num text-xl">{company.phone}</span></span></a><div className="ringcard p-6"><span className="eyebrow block">Office</span><p className="mt-2">{company.legal}<br />{company.address[0]}<br />{company.address[1]}</p></div></div>
      <div className="gborder rounded-3xl p-5 md:p-8"><h2 className="mb-6 text-2xl font-semibold tracking-tight">Send a message</h2><ContactForm kind="Contact" submit="Send message" done="Thanks. We will be in touch shortly." fields={[{ name: "name", label: "Name", required: true }, { name: "company", label: "Company", required: true }, { name: "email", label: "Email", type: "email", required: true }, { name: "phone", label: "Phone", type: "tel", required: true }, { name: "url", label: "URL" }, { name: "comments", label: "Comments", area: true, required: true }]} /></div>
    </section></>);
}

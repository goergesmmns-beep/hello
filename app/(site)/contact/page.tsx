import type { Metadata } from "next";
import { PageHead } from "@/components/ui";
import { ContactForm } from "@/components/forms";
import { company } from "@/content/site";
export const metadata: Metadata = { title: "Contact" };
export default function Contact() {
  return (<><PageHead eyebrow="Contact" title="Buying, selling or have questions?" />
    <section className="wrap grid gap-12 py-14 md:grid-cols-[1fr_1.6fr] md:py-20"><div><p className="eyebrow mb-2">Phone</p><p className="num text-2xl">{company.phone}</p><p className="eyebrow mb-2 mt-8">Office</p><p>{company.legal}<br />{company.address[0]}<br />{company.address[1]}</p></div>
    <ContactForm kind="Contact" submit="Send message" done="Thanks. We will be in touch shortly." fields={[{ name: "name", label: "Name", required: true }, { name: "company", label: "Company", required: true }, { name: "email", label: "Email", type: "email", required: true }, { name: "phone", label: "Phone", type: "tel", required: true }, { name: "url", label: "URL" }, { name: "comments", label: "Comments", area: true, required: true }]} /></section></>);
}

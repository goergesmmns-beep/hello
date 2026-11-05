import type { Metadata } from "next";
import { Cta, PageHead } from "@/components/ui";
import { testimonials } from "@/content/site";
export const metadata: Metadata = { title: "Client results" };
export default function Success() {
  return (<>
    <PageHead eyebrow="Client results" title="Founders and buyers, in their own words." />
    <section className="wrap py-14 md:py-20"><div className="grid gap-px overflow-hidden rounded-lg border bg-border md:grid-cols-2">{testimonials.map((t) => <figure key={t.name} className="flex flex-col justify-between gap-6 bg-background p-8"><blockquote className="text-2xl font-medium leading-tight tracking-tight">“{t.quote}”</blockquote><figcaption><span className="pill mb-2">{t.side}</span><p className="font-semibold">{t.name}</p><p className="text-sm text-muted-foreground">{t.role}</p></figcaption></figure>)}</div></section>
    <Cta title="Your exit could be next." text="Start with a complimentary strategy session." href="/contact" label="Talk to an advisor" />
  </>);
}

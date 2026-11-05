import type { Metadata } from "next";
import { Cta, PageHead } from "@/components/ui";
import { team } from "@/content/site";
export const metadata: Metadata = { title: "Your advisory team" };
export default function Team() {
  return (<>
    <PageHead eyebrow="Your advisory team" title="Acquisition experts who have been operators themselves." lede="Certified M&A advisors guiding buyers and sellers, from first acquisition to final exit." />
    <section className="wrap py-14 md:py-20"><div className="border-t">{team.map((m) => <article id={m.id} key={m.id} className="grid gap-3 border-b py-8 md:grid-cols-[320px_1fr]"><div><h2 className="text-2xl font-semibold">{m.name}</h2><p className="text-muted-foreground">{m.role}</p><p className="eyebrow mt-2 !text-brand-ink">{m.cred}</p></div><p className="max-w-[66ch] leading-relaxed">{m.bio}</p></article>)}</div></section>
    <Cta title="Talk with an advisor." text="Buying, selling or growing, start with a complimentary strategy session." href="/contact" label="Contact us" />
  </>);
}

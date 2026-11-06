import type { Metadata } from "next";
import Link from "next/link";
import { Award, Mic } from "lucide-react";
import { Cta, PageHead } from "@/components/ui";
import { team } from "@/content/site";
export const metadata: Metadata = { title: "Your advisory team" };
const initials = (n: string) => n.split(" ").filter((x) => /^[A-Z]/.test(x) && !x.endsWith(".")).map((x) => x[0]).slice(0, 2).join("");
export default function Team() {
  const [a, b, ...rest] = team;
  return (<>
    <PageHead eyebrow="Your advisory team" title="Acquisition experts who have been operators themselves." lede="Certified M&A advisors guiding buyers and sellers, from first acquisition to final exit. You work with them directly. No junior reps, no handoffs." />
    <section className="wrap py-14 md:py-20">
      <div className="grid gap-3 lg:grid-cols-2">{[a, b].map((m) => <article id={m.id} key={m.id} className="lift flex flex-col rounded-3xl border p-7 md:p-9"><div className="flex items-center gap-5"><span className="dark mesh grid size-20 shrink-0 place-items-center rounded-2xl bg-background text-2xl font-semibold text-foreground">{initials(m.name)}</span><div><h2 className="text-2xl font-semibold tracking-tight">{m.name}</h2><p className="text-muted-foreground">{m.role}</p><p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-brand px-2.5 py-1 text-xs font-semibold text-brand-foreground"><Award size={13} />{m.cred}</p></div></div><p className="mt-6 text-[17px] leading-relaxed">{m.bio}</p></article>)}</div>
      <div className="mt-3 grid gap-3 md:grid-cols-3">{rest.map((m) => <article id={m.id} key={m.id} className="lift flex flex-col rounded-3xl border p-6"><span className="grid size-14 place-items-center rounded-xl bg-foreground text-lg font-semibold text-background">{initials(m.name)}</span><h2 className="mt-5 text-xl font-semibold tracking-tight">{m.name}</h2><p className="text-sm text-muted-foreground">{m.role}</p><p className="eyebrow mt-2 !text-brand-ink">{m.cred}</p><p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">{m.bio}</p></article>)}</div>
      <div className="mt-3 grid gap-3 md:grid-cols-2"><div className="flex gap-4 rounded-3xl border p-6"><Award size={22} className="shrink-0 text-brand-ink" /><div><b>Certified M&A Advisors</b><p className="text-[15px] text-muted-foreground">Both founding partners hold the designation from the Alliance of M&A Advisors.</p></div></div><Link href="/media" className="lift flex gap-4 rounded-3xl border p-6"><Mic size={22} className="shrink-0 text-brand-ink" /><div><b>Podcasts, talks and articles</b><p className="text-[15px] text-muted-foreground">Hear how the team thinks about buying, selling and growing.</p></div></Link></div>
    </section>
    <Cta title="Talk with an advisor." text="Buying, selling or growing, start with a complimentary strategy session." href="/contact" label="Contact us" />
  </>);
}

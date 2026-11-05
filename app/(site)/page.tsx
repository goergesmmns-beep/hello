import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ListingRow } from "@/components/ui";
import { IntentHero } from "@/components/intent-hero";
import { SoldWall } from "@/components/sold-wall";
import { Journey } from "@/components/journey";
import { IsoStack } from "@/components/iso-stack";
import { Bento } from "@/components/bento";
import { JanuaryWindow } from "@/components/countdown";
import { GrowCompare } from "@/components/grow-compare";
import { Newsletter } from "@/components/newsletter";
import { listings } from "@/content/listings";
import { media, testimonials } from "@/content/site";

export default function Home() {
  const live = listings.filter((l) => l.status !== "pending").slice(0, 5);
  return (
    <>
      <IntentHero />
      <section className="wrap reveal py-20 md:py-28">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow mb-3">Acquisition opportunities</p><h2 className="h2 max-w-3xl">Active listings, professionally prepared for sale.</h2></div><Link href="/buy" className="btn btn-ghost">All {listings.length} listings</Link></div>
        <div className="border-t">{live.map((l) => <ListingRow key={l.slug} l={l} />)}</div>
      </section>
      <SoldWall />
      <IsoStack />
      <JanuaryWindow />
      <Journey />
      <section className="wrap grid gap-10 py-20 md:grid-cols-[.8fr_1.2fr] md:py-28"><div><p className="eyebrow mb-3">Grow your business</p><h2 className="h2">Buy the growth.</h2><p className="lede mt-4">Acquire a competitor, vendor or strategic partner without draining your cash reserves.</p><Link href="/grow" className="btn btn-primary mt-7">See how it works</Link></div><GrowCompare /></section>
      <section className="border-t"><div className="wrap py-20 md:py-28">
        <p className="eyebrow mb-3">How we are different</p><h2 className="h2 max-w-3xl">An advisory firm, not a listing service.</h2>
        <Bento />
      </div></section>
      <section className="dark bg-background text-foreground"><div className="wrap py-20 md:py-28"><div className="reveal grid gap-3 md:grid-cols-[1.5fr_1fr]">
        <figure className="mesh flex flex-col justify-between gap-8 rounded-xl border bg-background p-8 md:p-12"><blockquote className="text-[clamp(1.75rem,3.6vw,2.9rem)] font-medium leading-[1.1] tracking-[-.03em]">“{testimonials[2].quote}”</blockquote><figcaption className="text-muted-foreground">{testimonials[2].name}, {testimonials[2].role}</figcaption></figure>
        <div className="grid gap-3">{[testimonials[0], testimonials[3]].map((t) => <figure key={t.name} className="rounded-xl border bg-background p-7"><blockquote className="text-xl font-medium leading-snug tracking-tight">“{t.quote}”</blockquote><figcaption className="mt-4 text-sm text-muted-foreground">{t.name}, {t.role}</figcaption></figure>)}</div>
      </div><Link href="/success" className="btn btn-ghost mt-6">All client results</Link></div></section>
      <section className="wrap py-20 md:py-24"><div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow mb-3">Heard on</p><h2 className="h2">Interviews and podcasts.</h2></div><Link href="/media" className="btn btn-ghost">All media</Link></div>
        <ul className="border-t">{media.slice(0, 3).map(([t, k, u]) => <li key={u}><a href={u} target="_blank" rel="noreferrer" className="group grid grid-cols-[1fr_24px] gap-4 border-b py-5 md:grid-cols-[110px_1fr_24px]"><span className="eyebrow hidden pt-1 md:block">{k}</span><span className="text-xl font-medium tracking-tight">{t}</span><ArrowUpRight size={20} className="group-hover:text-brand-ink" /></a></li>)}</ul></section>
      <Newsletter />
      <section className="flow text-[#111]"><div className="wrap flex flex-col items-start justify-between gap-8 py-20 md:flex-row md:items-end md:py-28"><div><h2 className="text-[clamp(2.5rem,7vw,5.75rem)] font-semibold leading-[.98] tracking-[-.045em]">Should you sell? Buy? Grow?</h2><p className="mt-5 max-w-xl text-lg font-medium">Book a confidential, complimentary strategy session and get a clear path forward.</p></div><Link href="/contact" className="btn shrink-0 bg-[#000] text-white hover:bg-white hover:text-black">Talk to an advisor</Link></div></section>
    </>
  );
}

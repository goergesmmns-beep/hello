import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Cta, ListingRow } from "@/components/ui";
import { Road } from "@/components/road";
import { listings } from "@/content/listings";
import { differences, stats, testimonials } from "@/content/site";

const routes = [
  ["Own funds", "Show funds and move straight to advisor release."],
  ["Strategic company", "Skip the personal bank step. Tell us about the company."],
  ["Bank or lender letter", "Works for buyers in the UK, EU, Canada and beyond."],
  ["Using financing", "Share your plan. We have 230+ funding strategies to discuss."],
];
export default function Home() {
  const live = listings.filter((l) => l.status !== "pending").slice(0, 5);
  return (
    <>
      <section className="dark relative overflow-hidden bg-background text-foreground">
        <div className="wrap relative pb-14 pt-16 md:pb-20 md:pt-24">
          <p className="eyebrow mb-6">Certified M&A advisors · Around the world</p>
          <h1 className="display rise max-w-[11ch]">Sell. Buy. Grow.</h1>
          <p className="lede mt-7 !text-foreground/80">The team you trust from your first acquisition to a profitable exit. Boutique M&A advisory for digital businesses and the founders behind them.</p>
          <div className="mt-9 flex flex-wrap gap-3"><Link href="/buy" className="btn btn-brand">See current listings <ArrowRight size={17} /></Link><Link href="/sell" className="btn btn-ghost">Sell your business</Link></div>
          <Road />
          <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 border-t pt-7 md:grid-cols-4">
            {stats.map((s) => <div key={s.label}><dd className="num text-3xl font-medium md:text-4xl">{s.value}</dd><dt className="mt-1 text-sm text-muted-foreground">{s.label}</dt></div>)}
          </dl>
        </div>
      </section>

      <section className="wrap py-20 md:py-28">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow mb-3">Available for acquisition</p><h2 className="h2">Businesses prepared for sale by our advisors.</h2></div><Link href="/buy" className="btn btn-ghost">All listings</Link></div>
        <div className="border-t">{live.map((l) => <ListingRow key={l.slug} l={l} />)}</div>
      </section>

      <section className="dark bg-background text-foreground">
        <div className="wrap grid gap-12 py-20 md:grid-cols-[1fr_1.15fr] md:py-28">
          <div><p className="eyebrow mb-3 !text-brand">For buyers</p><h2 className="h2">Serious interest gets a fast answer.</h2><p className="lede mt-5">Request a listing and sign the NDA on your phone. Then tell us how you plan to buy. Every buyer gets a clear next step, and worried-about-funding is a conversation we are glad to have.</p></div>
          <ol className="border-t">{routes.map(([h, t], i) => <li key={h} className="grid grid-cols-[44px_1fr] border-b py-5"><span className="num text-brand">0{i + 1}</span><div><h3 className="text-xl font-semibold tracking-tight">{h}</h3><p className="mt-1 text-muted-foreground">{t}</p></div></li>)}</ol>
        </div>
      </section>

      <section className="wrap py-20 md:py-28">
        <p className="eyebrow mb-3">How we are different</p><h2 className="h2 max-w-3xl">Not all brokers are created equal.</h2>
        <div className="mt-12 grid gap-px overflow-hidden rounded-lg border bg-border md:grid-cols-2 lg:grid-cols-3">{differences.map(([h, t]) => <article key={h} className="bg-background p-7"><h3 className="text-lg font-semibold tracking-tight">{h}</h3><p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{t}</p></article>)}</div>
      </section>

      <section className="border-t"><div className="wrap py-20"><blockquote className="max-w-4xl"><p className="text-[clamp(1.75rem,3.8vw,3rem)] font-medium leading-[1.12] tracking-[-.03em]">“{testimonials[2].quote}”</p><footer className="mt-6 text-muted-foreground">{testimonials[2].name}, {testimonials[2].role}</footer></blockquote></div></section>

      <Cta title="Find out what your business is worth." text="Get expert answers on timing, value and buyers, and a clear path forward." href="/valuation" label="Get a valuation" />
    </>
  );
}

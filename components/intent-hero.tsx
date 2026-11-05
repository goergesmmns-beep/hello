"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { IsoCity } from "./iso-city";
import { CountUp } from "./count-up";
import { listings } from "@/content/listings";
import { stats } from "@/content/site";

const views = {
  Sell: {
    lede: "Sell-side advisory for founders of digital businesses. A confidential, competitive process with vetted buyers, from valuation to close.",
    primary: ["/valuation", "Get a free valuation"], secondary: ["/sell", "See our sell-side process"],
    panelTitle: "Our track record",
    rows: [["78.6%", "of the businesses we list get sold"], ["5", "offers on an average deal"], ["12", "competing buyers on one transaction"]],
  },
  Buy: {
    lede: "Curated acquisition opportunities, professionally prepared for sale. Sign the NDA, review the CIM and work with an advisor through LOI. Need financing? We have 230+ strategies.",
    primary: ["/buy", "See current listings"], secondary: ["/acquisitions-alliance", "Buyer coaching"],
    panelTitle: "Active listings",
    rows: listings.filter((l) => l.status === "available").slice(0, 3).map((l) => [l.askLabel, l.title]),
  },
  Grow: {
    lede: "Buy-side advisory for companies pursuing growth through acquisition. Add $1M, $5M or even $20M in profitable revenue with the right target, structure and funding.",
    primary: ["/grow", "Explore buy-side advisory"], secondary: ["/contact", "Book a strategy session"],
    panelTitle: "We help you decide",
    rows: [["If", "acquisition is the right strategy for your business"], ["When", "the timing makes the most sense"], ["How", "to structure a deal that fits your goals"]],
  },
} as const;
type K = keyof typeof views;

export function IntentHero() {
  const [k, setK] = useState<K>("Sell");
  const v = views[k];
  return (
    <section className="dark relative overflow-hidden bg-background text-foreground">
      <div className="aurora" aria-hidden><i /><i /></div>
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[64%] lg:block"><div className="absolute inset-0" style={{ maskImage: "linear-gradient(90deg, transparent, #000 34%)" }}><IsoCity /></div><div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-background to-transparent" /></div>
      <div className="wrap relative pb-12 pt-14 md:pb-16 md:pt-20">
        <p className="eyebrow mb-6">Sell-side and buy-side M&A advisory · Digital businesses worldwide</p>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end lg:gap-16">
          <div className="min-w-0">
            <h1 className="sr-only">Sell, buy and grow a business with Westbound Road</h1>
            <div role="tablist" aria-label="What do you want to do?" className="display flex flex-wrap gap-x-[.26em] !text-[clamp(2.75rem,7.4vw,6.4rem)]">
              {(Object.keys(views) as K[]).map((w, n) => (
                <button key={w} role="tab" id={`tab-${w}`} aria-selected={k === w} onClick={() => setK(w)} style={{ animationDelay: `${n * 110}ms` }} className={`word-in cursor-pointer text-left transition-colors ${k === w ? "text-foreground" : "text-foreground/35 hover:text-brand"}`}>{w}.</button>
              ))}
            </div>
            <div key={k} className="fade-in max-w-[600px]" role="tabpanel" aria-labelledby={`tab-${k}`}>
              <p className="lede mt-7 !text-foreground/85">{v.lede}</p>
              <div className="mt-8 flex flex-wrap gap-3"><Link href={v.primary[0]} className="btn btn-brand">{v.primary[1]} <ArrowRight size={17} /></Link><Link href={v.secondary[0]} className="btn btn-ghost bg-background/60 backdrop-blur">{v.secondary[1]}</Link></div>
            </div>
          </div>
          <aside key={`p-${k}`} className="gborder fade-in rounded-xl p-5">
            <p className="eyebrow mb-2">{v.panelTitle}</p>
            <ul>{v.rows.map(([a, b]) => <li key={b} className="grid grid-cols-[minmax(88px,auto)_1fr] gap-3 border-t py-3 first:border-t-0"><span className="num text-lg font-medium text-brand">{a}</span><span className="text-[15px] text-card-foreground/85">{b}</span></li>)}</ul>
          </aside>
        </div>
        <div className="relative -mx-5 mt-8 h-72 overflow-hidden lg:hidden" aria-hidden><IsoCity /></div>
        <dl className="relative mt-10 grid grid-cols-2 gap-x-6 gap-y-7 border-t pt-7 md:grid-cols-4 lg:mt-24">
          {stats.map((s) => <div key={s.label}><dd className="num text-3xl font-medium md:text-4xl"><CountUp value={s.value} /></dd><dt className="mt-1 text-sm text-muted-foreground">{s.label}</dt></div>)}
        </dl>
      </div>
    </section>
  );
}

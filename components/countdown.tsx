"use client";
import Link from "next/link";

const days = () => { const n = new Date(); const j = new Date(n.getFullYear() + 1, 0, 1); return Math.ceil((j.getTime() - n.getTime()) / 864e5); };
export function JanuaryWindow() {
  const d = days();
  const prepared = d >= 60;
  return (
    <section className="wrap grid gap-10 py-20 md:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)] md:items-center md:py-28">
      <div><p className="num text-[clamp(5.5rem,15vw,11rem)] font-medium leading-none tracking-[-.06em] flow flow-text" suppressHydrationWarning>{d}</p><p className="eyebrow mt-3">days until January 1</p></div>
      <div className="min-w-0"><p className="eyebrow mb-3">Timing your exit</p><h2 className="h2">The January buying window is coming.</h2>
        <p className="lede mt-4">Entrepreneurial and corporate buyers both become active on January 1, and going to market takes a couple of months of preparation. {prepared ? "There is still time to be ready." : "Start now to be in the market early in the year."}</p>
        <Link href="/valuation" className="btn btn-primary mt-7">Get a free valuation</Link></div>
    </section>
  );
}

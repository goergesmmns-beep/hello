"use client";
import { useEffect, useState } from "react";
const stages = [
  ["Valuation", "We tell you what the business is really worth."],
  ["Preparation", "Financials and sale materials, ready for buyers."],
  ["Confidential marketing", "Your identity stays private until an NDA is signed."],
  ["Buyer screening", "Entrepreneurial and corporate buyers, qualified first."],
  ["Offers and LOI", "Competing offers, negotiated on price and terms."],
  ["Due diligence and close", "We stay until your money is in the bank."],
];
export function IsoStack() {
  const [i, setI] = useState(0); const [held, setHeld] = useState(false);
  useEffect(() => { if (held || matchMedia("(prefers-reduced-motion: reduce)").matches) return; const t = setInterval(() => setI((n) => (n + 1) % stages.length), 2400); return () => clearInterval(t); }, [held]);
  return (
    <section className="dark relative overflow-hidden bg-background text-foreground">
      <div className="wrap grid gap-10 py-20 md:grid-cols-2 md:items-center md:py-28">
        <div className="iso-scene relative order-2 mx-auto h-[380px] w-full max-w-[420px] md:order-1 md:h-[480px]" aria-hidden>
          <div className="iso-stack absolute left-1/2 top-[72%] h-[190px] w-[190px] md:h-[240px] md:w-[240px]" style={{ transform: "translate(-50%,-50%) rotateX(56deg) rotateZ(-42deg)" }}>
            {stages.map((_, n) => <div key={n} className={`plate ${n === i ? "on" : ""}`} style={{ transform: `translateZ(${n * 46 + (n > i ? 34 : 0)}px)` }} />)}
          </div>
        </div>
        <div className="order-1 min-w-0 md:order-2">
          <p className="eyebrow mb-3 !text-brand">The sell-side process</p><h2 className="h2">Six stages. One team, from valuation to close.</h2>
          <ol className="mt-8">{stages.map(([h, t], n) => <li key={h}><button id={`stage-${n}`} aria-current={n === i ? "step" : undefined} onClick={() => { setI(n); setHeld(true); }} className="grid w-full cursor-pointer grid-cols-[38px_1fr] border-b py-3 text-left"><span className={`num ${n === i ? "text-brand" : "text-muted-foreground"}`}>{n + 1}</span><span><span className={`block text-lg font-semibold tracking-tight ${n === i ? "" : "text-foreground/55"}`}>{h}</span>{n === i && <span className="fade-in block text-[15px] text-muted-foreground">{t}</span>}</span></button></li>)}</ol>
        </div>
      </div>
    </section>
  );
}

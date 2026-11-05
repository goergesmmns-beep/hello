"use client";
import { useEffect, useState } from "react";
import { Check, FileText, Lock, Pen, UserRound } from "lucide-react";

const steps = [
  { icon: UserRound, title: "Share your buyer profile", text: "Your background, your buyer type and why this business.", screen: ["How are you buying?", "Company, strategic purchase", "Using financing"] },
  { icon: Pen, title: "Sign the NDA", text: "E-sign on your phone and keep a copy. No printing or scanning.", screen: ["Sign the NDA", "Type your full name", "I agree to this NDA"] },
  { icon: Lock, title: "Confirm your funding", text: "Proof of funds, a lender letter, a corporate purchase or a financing plan. Each has a next step.", screen: ["Your plan", "Bank or lender letter", "Sent to an advisor"] },
  { icon: FileText, title: "Review the CIM", text: "Read it on any device, then speak with an advisor about next steps toward an LOI.", screen: ["Your CIM is open", "Your email appears on every page", "Request a call"] },
];
export function Journey() {
  const [i, setI] = useState(0);
  const [held, setHeld] = useState(false);
  useEffect(() => {
    if (held || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((n) => (n + 1) % steps.length), 3200);
    return () => clearInterval(t);
  }, [held]);
  const s = steps[i];
  return (
    <section className="dark mesh bg-background text-foreground">
      <div className="wrap grid gap-12 py-20 md:grid-cols-[minmax(0,1.1fr)_minmax(0,.9fr)] md:items-center md:py-28">
        <div className="min-w-0">
          <p className="eyebrow mb-3 !text-brand">For buyers</p><h2 className="h2">From inquiry to CIM, without the back and forth.</h2>
          <p className="lede mt-5">A clear process for qualified buyers, built to protect seller confidentiality and move fast.</p>
          <ol className="mt-8 border-t">{steps.map((st, n) => <li key={st.title} className="border-b"><button id={`step-${n}`} aria-current={n === i ? "step" : undefined} onClick={() => { setI(n); setHeld(true); }} className="grid w-full cursor-pointer grid-cols-[44px_1fr] py-4 text-left"><span className={`num ${n === i ? "text-brand" : "text-muted-foreground"}`}>0{n + 1}</span><span><span className={`block text-xl font-semibold tracking-tight ${n === i ? "" : "text-foreground/60"}`}>{st.title}</span>{n === i && <span className="fade-in mt-1 block text-muted-foreground">{st.text}</span>}</span></button></li>)}</ol>
        </div>
        <div className="mx-auto w-full max-w-[300px]" aria-hidden>
          <div className="gborder rounded-[34px] p-2.5"><div className="min-h-[470px] rounded-[26px] bg-[#fff] p-5 text-[#111]">
            <div className="mb-5 flex gap-1">{steps.map((_, n) => <i key={n} className={`h-1 flex-1 rounded-full ${n <= i ? "bg-brand" : "bg-[#e5e5e5]"}`} />)}</div>
            <div key={i} className="fade-in"><p className="text-2xl font-semibold tracking-tight">{s.screen[0]}</p>
              {s.screen.slice(1).map((l, n) => <p key={l} className={`mt-3 rounded-md border border-[#e5e5e5] p-3 text-sm ${n === 0 ? "bg-[#111] text-white" : ""}`}>{l}</p>)}
              {i === 3 && <div className="mt-3 space-y-2 rounded-md border border-[#e5e5e5] p-3" >{[90, 70, 84].map((w) => <i key={w} className="block h-2 rounded bg-[#ececec]" style={{ width: `${w}%` }} />)}</div>}
              <p className="mt-5 flex items-center gap-1.5 text-xs text-[#666]"><Check size={14} /> Saved to your private link</p>
            </div>
          </div></div>
        </div>
      </div>
    </section>
  );
}

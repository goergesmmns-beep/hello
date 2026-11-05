"use client";
import { differences } from "@/content/site";
const sizes = ["lg:col-span-2", "", "", "", "", "lg:col-span-2"];
export function Bento() {
  return (
    <div className="mt-12 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
      {[...differences].slice(0, 6).map(([h, t], i) => (
        <article key={h} onPointerMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`); e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`); }}
          className={`spot reveal min-h-52 rounded-xl border bg-background p-7 transition-colors hover:border-foreground/30 ${sizes[i]}`}>
          <span className="num relative text-sm text-brand-ink">0{i + 1}</span>
          <h3 className="relative mt-8 text-xl font-semibold tracking-tight">{h}</h3>
          <p className="relative mt-2 max-w-[46ch] text-[15px] leading-relaxed text-muted-foreground">{t}</p>
        </article>
      ))}
    </div>
  );
}

"use client";
import { useState } from "react";

/** Inquiries per day: one series, one hue, with hover on each bar. */
export function DailyBars({ data }: { data: { key: string; label: string; value: number }[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.value));
  const shown = hover ?? data.length - 1;
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between"><p className="text-sm text-muted-foreground"><span className="num text-foreground">{data[shown].value}</span> on {data[shown].label}</p><p className="num text-sm text-muted-foreground">{total} in 30 days</p></div>
      <div className="relative h-36 border-b" role="img" aria-label={`Inquiries per day. ${total} in the last 30 days.`}>
        <div className="absolute inset-x-0 top-0 border-t border-dashed" aria-hidden /><span className="num absolute right-0 top-1 text-[11px] text-muted-foreground" aria-hidden>{max}</span>
        <div className="absolute inset-0 grid items-end gap-[2px]" style={{ gridTemplateColumns: `repeat(${data.length}, minmax(0, 1fr))` }} onMouseLeave={() => setHover(null)}>
          {data.map((d, i) => <div key={d.key} className="flex h-full items-end" onMouseEnter={() => setHover(i)}><div className={`w-full rounded-t-[3px] transition-colors ${d.value ? (hover === i ? "bg-foreground" : "bg-brand") : "bg-border"}`} style={{ height: d.value ? `${(d.value / max) * 100}%` : 2 }} /></div>)}
        </div>
      </div>
      <div className="mt-1.5 flex justify-between text-[11px] text-muted-foreground"><span>{data[0].label}</span><span>{data[data.length - 1].label}</span></div>
    </div>
  );
}
export function Funnel({ steps }: { steps: { label: string; value: number }[] }) {
  const top = Math.max(1, steps[0].value);
  return <ol className="space-y-2.5">{steps.map((s, i) => { const prev = i ? steps[i - 1].value : 0; const rate = i && prev ? Math.round((s.value / prev) * 100) : null; return <li key={s.label}><div className="mb-1 flex items-baseline justify-between text-sm"><span>{s.label}</span><span className="num"><span className="font-medium">{s.value}</span>{rate !== null && <span className="ml-2 text-muted-foreground">{rate}%</span>}</span></div><div className="h-2 overflow-hidden rounded bg-muted"><div className="h-full rounded bg-brand transition-[width] duration-700" style={{ width: `${(s.value / top) * 100}%` }} /></div></li>; })}</ol>;
}
export function Breakdown({ rows }: { rows: { label: string; value: number }[] }) {
  const total = rows.reduce((s, r) => s + r.value, 0) || 1;
  return <ul className="space-y-2.5">{rows.map((r) => <li key={r.label}><div className="mb-1 flex justify-between text-sm"><span>{r.label}</span><span className="num">{r.value} <span className="text-muted-foreground">{Math.round((r.value / total) * 100)}%</span></span></div><div className="h-1.5 rounded bg-muted"><div className="h-full rounded bg-foreground/70" style={{ width: `${(r.value / total) * 100}%` }} /></div></li>)}</ul>;
}

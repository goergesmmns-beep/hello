"use client";
import { useEffect, useMemo, useState } from "react";

export const palette = ["var(--c-orange)", "var(--c-blue)", "var(--c-green)", "var(--c-purple)", "var(--c-gray)"];
type Item = { label: string; value: number; color?: string };
const pct = (v: number, t: number) => (t ? Math.round((v / t) * 100) : 0);

export function Greeting({ name = "" }: { name?: string }) {
  const [h, setH] = useState<number | null>(null); useEffect(() => setH(new Date().getHours()), []);
  const word = h === null ? "Hello" : h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  return <h1 className="text-[22px] font-semibold tracking-tight md:text-[26px]">{word}{name ? `, ${name}` : ","} <span className="font-normal text-muted-foreground">here is what&apos;s happening today</span></h1>;
}

/** One bar split into coloured segments, with a legend that carries a coloured edge. */
export function SegBar({ items, unit = "" }: { items: Item[]; unit?: string }) {
  const t = items.reduce((s, x) => s + x.value, 0); const shown = items.filter((x) => x.value > 0);
  return <div className="@container">
    <div className="flex h-2.5 gap-1" role="img" aria-label={items.map((x) => `${x.label} ${x.value}`).join(", ")}>{shown.length ? shown.map((x, i) => <i key={x.label} className="block h-full rounded-full transition-[flex-grow] duration-700" style={{ flexGrow: x.value, background: x.color ?? palette[i % 5] }} />) : <i className="block h-full flex-1 rounded-full bg-muted" />}</div>
    <div className="my-5 border-t" />
    <ul className="grid grid-cols-2 gap-x-4 gap-y-4 @[460px]:grid-cols-3">{items.map((x, i) => <li key={x.label} className="legend min-w-0" style={{ ["--c" as string]: x.color ?? palette[i % 5] }}><p className="truncate text-[15px] font-medium">{x.label}</p><p className="num text-[13px] text-muted-foreground">{x.value}{unit} · {pct(x.value, t)}%</p></li>)}</ul>
  </div>;
}

/** Ring chart with the total in the middle. */
export function Donut({ items, center, sub }: { items: Item[]; center: string; sub: string }) {
  const t = items.reduce((s, x) => s + x.value, 0); const R = 52, C = 2 * Math.PI * R; let acc = 0; const gap = items.filter((x) => x.value).length > 1 ? 6 : 0;
  return <div className="@container"><div className="grid items-center gap-6 @[380px]:grid-cols-[170px_1fr]">
    <div className="relative mx-auto size-[160px]">
      <svg viewBox="0 0 128 128" className="size-full -rotate-90" role="img" aria-label={items.map((x) => `${x.label} ${pct(x.value, t)}%`).join(", ")}><circle cx="64" cy="64" r={R} fill="none" stroke="var(--line-2)" strokeWidth="13" />{t > 0 && items.map((x, i) => { const len = (x.value / t) * C; const el = x.value ? <circle key={x.label} cx="64" cy="64" r={R} fill="none" stroke={x.color ?? palette[i % 5]} strokeWidth="13" strokeLinecap="round" strokeDasharray={`${Math.max(len - gap, .1)} ${C}`} strokeDashoffset={-acc - gap / 2} /> : null; acc += len; return el; })}</svg>
      <div className="absolute inset-0 grid place-items-center text-center"><div><p className="num text-[28px] font-semibold leading-none">{center}</p><p className="mt-1 text-xs text-muted-foreground">{sub}</p></div></div>
    </div>
    <ul className="space-y-3">{items.map((x, i) => <li key={x.label} className="flex items-center gap-3 text-[15px]"><i className="block size-2.5 rounded-[3px]" style={{ background: x.color ?? palette[i % 5] }} /><span className="min-w-0 flex-1 truncate text-muted-foreground">{x.label}</span><span className="num font-medium">{pct(x.value, t)}%</span></li>)}</ul>
  </div></div>;
}

/** Striped tracks with a solid fill, like a rate meter. */
export function Rates({ rows, base }: { rows: (Item & { note?: string })[]; base?: number }) {
  const max = base ?? Math.max(1, ...rows.map((r) => r.value));
  return <ul className="space-y-3">{rows.map((r, i) => <li key={r.label} className="grid grid-cols-[minmax(84px,120px)_1fr] items-center gap-3"><span className="truncate text-[14.5px]">{r.label}</span><div className="track" style={{ ["--c" as string]: r.color ?? palette[i % 5] }}><i style={{ width: `${Math.max(r.value ? 5 : 0, (r.value / max) * 100)}%` }} /><span style={r.value / max > 0.78 ? { color: "rgba(0,0,0,.72)", fontWeight: 600 } : undefined}>{r.note ?? `${r.value}`}</span></div></li>)}</ul>;
}

type Day = { d: string; a: number; b: number };
/** Two-series columns with striped bodies and solid caps, plus a range switch. */
export function Columns({ days, aLabel, bLabel }: { days: Day[]; aLabel: string; bLabel: string }) {
  const [range, setRange] = useState(30);
  const rows = days.slice(-range); const prev = days.slice(-range * 2, -range);
  const sum = rows.reduce((s, x) => s + x.a, 0), psum = prev.reduce((s, x) => s + x.a, 0);
  const delta = psum ? Math.round(((sum - psum) / psum) * 100) : null;
  const max = Math.max(4, ...rows.map((x) => Math.max(x.a, x.b))); const ticks = [0, .25, .5, .75, 1].map((t) => Math.round(max * t));
  return <div>
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3"><div><p className="num text-[32px] font-semibold leading-none">{sum}{delta !== null && <span className={`ml-2 text-sm font-medium ${delta >= 0 ? "text-c-green" : "text-destructive"}`}>{delta >= 0 ? "+" : ""}{delta}%</span>}</p><p className="mt-1.5 text-sm text-muted-foreground">{aLabel.toLowerCase()} in the last {range} days</p></div>
      <div className="flex flex-wrap items-center gap-4"><span className="flex items-center gap-4 text-sm"><span className="flex items-center gap-1.5"><i className="block size-2.5 rounded-[3px] bg-c-orange" />{aLabel}</span><span className="flex items-center gap-1.5"><i className="block size-2.5 rounded-[3px] bg-c-blue" />{bLabel}</span></span><div className="seg" role="group" aria-label="Range">{[7, 30, 90].map((r) => <button key={r} type="button" aria-pressed={range === r} onClick={() => setRange(r)}>{r}D</button>)}</div></div></div>
    <div className="grid grid-cols-[28px_1fr] gap-2">
      <div className="relative h-56">{ticks.map((t, i) => <span key={i} className="num absolute right-0 -translate-y-1/2 text-[11px] text-muted-foreground" style={{ bottom: `${(i / 4) * 100}%`, transform: "translateY(50%)" }}>{t}</span>)}</div>
      <div className="relative h-56">{ticks.map((_, i) => <i key={i} className="absolute inset-x-0 border-t border-dashed" style={{ bottom: `${(i / 4) * 100}%` }} />)}
        <div className="absolute inset-0 flex items-end gap-[3px]">{rows.map((x) => <div key={x.d} className="group relative flex h-full flex-1 items-end justify-center gap-[2px]" title={`${x.d}: ${x.a} ${aLabel.toLowerCase()}, ${x.b} ${bLabel.toLowerCase()}`}>{[["a", "var(--c-orange)"], ["b", "var(--c-blue)"]].map(([k, c]) => { const v = x[k as "a" | "b"]; const h = (v / max) * 100; return <div key={k} className="relative w-full max-w-[18px]" style={{ height: `${h}%`, ["--c" as string]: c }}>{v > 0 && <><i className="hatch absolute inset-x-0 bottom-0 top-[5px] rounded-b-[3px]" style={{ color: c, background: `color-mix(in oklch, ${c} 16%, transparent)`, backgroundImage: `repeating-linear-gradient(135deg, color-mix(in oklch, ${c} 45%, transparent) 0 1px, transparent 1px 6px)` }} /><i className="absolute inset-x-0 top-0 h-[5px] rounded-full" style={{ background: c }} /></>}</div>; })}</div>)}</div>
      </div>
    </div>
    <div className="ml-[36px] mt-2 flex justify-between text-[11px] text-muted-foreground"><span>{rows[0]?.d.slice(5)}</span><span>{rows[Math.floor(rows.length / 2)]?.d.slice(5)}</span><span>{rows[rows.length - 1]?.d.slice(5)}</span></div>
  </div>;
}

/** Cumulative area line per series, picked with dot chips. */
export function Area({ series, dates }: { series: { name: string; points: number[] }[]; dates: string[] }) {
  const [on, setOn] = useState(0); const s = series[on]; const pts = s?.points ?? [];
  const max = Math.max(1, ...pts); const last = pts[pts.length - 1] ?? 0; const first = pts[0] ?? 0;
  const path = useMemo(() => pts.map((v, i) => `${(i / Math.max(1, pts.length - 1)) * 100},${100 - (v / max) * 88}`).join(" "), [pts, max]);
  if (!series.length) return <p className="text-sm text-muted-foreground">No buyers yet.</p>;
  return <div>
    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]" role="group" aria-label="Listing">{series.map((x, i) => <button key={x.name} type="button" aria-pressed={on === i} onClick={() => setOn(i)} className="dchip" style={{ ["--c" as string]: palette[i % 5] }}>{x.name}</button>)}</div>
    <div className="mt-5 flex items-end justify-between gap-3"><div><p className="num text-[34px] font-semibold leading-none">{last}</p><p className="mt-1.5 flex items-center gap-2 text-sm text-muted-foreground"><span className="text-c-green">▲ {last - first}</span> buyers in 90 days <span className="flex items-center gap-1.5 text-c-green"><i className="live-dot" />Live</span></p></div></div>
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="mt-4 h-48 w-full overflow-visible" role="img" aria-label={`${s.name}: ${last} buyers`}><defs><linearGradient id="ag" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={palette[on % 5]} stopOpacity=".35" /><stop offset="1" stopColor={palette[on % 5]} stopOpacity="0" /></linearGradient></defs>{[25, 50, 75].map((y) => <line key={y} x1="0" x2="100" y1={y} y2={y} stroke="var(--line-2)" strokeDasharray="1 1.5" vectorEffect="non-scaling-stroke" />)}<polygon points={`0,100 ${path} 100,100`} fill="url(#ag)" /><polyline points={path} fill="none" stroke={palette[on % 5]} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" /></svg>
    <div className="mt-1 flex justify-between text-[11px] text-muted-foreground"><span>{dates[0]?.slice(5)}</span><span>{dates[dates.length - 1]?.slice(5)}</span></div>
  </div>;
}

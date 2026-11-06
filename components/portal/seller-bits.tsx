import { Check } from "lucide-react";
/** Views per day, last 30 days. */
export function ViewBars({ series }: { series: { d: string; n: number }[] }) {
  const max = Math.max(1, ...series.map((x) => x.n));
  return <figure><div className="flex h-40 items-end gap-[3px]" role="img" aria-label={`Listing views per day for the last 30 days, ${series.reduce((s, x) => s + x.n, 0)} in total`}>{series.map((x) => <span key={x.d} title={`${x.d}: ${x.n} view${x.n === 1 ? "" : "s"}`} className="group relative flex-1"><i className={`block rounded-t-[3px] ${x.n ? "bg-c-orange" : "bg-muted"} transition-opacity group-hover:opacity-80`} style={{ height: `${Math.max(x.n ? 6 : 3, (x.n / max) * 160)}px` }} /></span>)}</div>
    <figcaption className="mt-2 flex justify-between text-xs text-muted-foreground"><span>{new Date(series[0].d).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span><span>Today</span></figcaption></figure>;
}
/** Funnel from inquiry to offer. */
export function Funnel({ rows }: { rows: [string, number][] }) {
  const top = Math.max(1, rows[0]?.[1] ?? 1);
  return <ul className="space-y-3">{rows.map(([k, n], i) => <li key={k}><p className="mb-1.5 flex justify-between text-sm"><span>{k}</span><span className="num font-medium">{n}{i > 0 && rows[0][1] > 0 && <span className="ml-2 text-xs font-normal text-muted-foreground">{Math.round((n / rows[0][1]) * 100)}%</span>}</span></p><span className="track block h-2.5 overflow-hidden rounded-full"><i className="block h-full rounded-full bg-c-orange" style={{ width: `${(n / top) * 100}%`, opacity: 1 - i * 0.14 }} /></span></li>)}</ul>;
}
/** Draft to live, in five steps. */
export function Stepper({ steps }: { steps: [string, "done" | "now" | "todo"][] }) {
  return <ol className="grid grid-cols-5 gap-2">{steps.map(([k, s]) => <li key={k}><span className={`block h-1.5 rounded-full ${s === "done" ? "bg-c-green" : s === "now" ? "bg-c-orange" : "bg-muted"}`} /><span className={`mt-2 flex items-center gap-1.5 text-[13px] ${s === "todo" ? "text-muted-foreground" : "font-medium"}`}>{s === "done" && <Check size={13} className="text-c-green" />}<span className="truncate">{k}</span></span></li>)}</ol>;
}

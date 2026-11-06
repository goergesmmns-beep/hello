import { Activity, FileSignature, Landmark, MessagesSquare } from "lucide-react";
/** A picture of the seller report. Numbers are an example and labelled as one. */
export function SellerPreview() {
  const steps: [string, number][] = [["Inquiries", 48], ["NDAs signed", 31], ["Funds verified", 14], ["Deal room opened", 12], ["Calls", 7], ["Offers", 3]];
  return <div className="relative">
    <div aria-hidden className="absolute -inset-6 rounded-[32px] bg-[radial-gradient(60%_60%_at_60%_40%,color-mix(in_oklch,var(--brand)_35%,transparent),transparent)] blur-2xl" />
    <figure className="relative overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-2xl" aria-label="Example seller report">
      <div className="flex items-center justify-between border-b px-5 py-3"><span className="flex gap-1.5" aria-hidden><i className="size-2.5 rounded-full bg-border" /><i className="size-2.5 rounded-full bg-border" /><i className="size-2.5 rounded-full bg-border" /></span><span className="text-xs text-muted-foreground">Seller report · example</span></div>
      <div className="grid gap-5 p-5 md:grid-cols-[1.2fr_1fr] md:p-6">
        <div><p className="text-sm font-semibold">Buyer activity</p><ul className="mt-3 space-y-2.5">{steps.map(([k, n]) => <li key={k}><div className="flex justify-between text-sm"><span>{k}</span><span className="num">{n}</span></div><span className="mt-1 block h-1.5 rounded bg-muted"><i className="block h-full rounded bg-brand" style={{ width: `${(n / 48) * 100}%` }} /></span></li>)}</ul></div>
        <div className="space-y-2.5">{[[FileSignature, "NDA signed", "Buyer A · 2m"], [Landmark, "Funds verified", "Buyer B · 1h"], [MessagesSquare, "Question asked", "Buyer C · 3h"], [Activity, "Offer submitted", "Buyer D · 1d"]].map(([I, t, s]) => { const X = I as typeof Activity; return <div key={t as string} className="flex items-center gap-3 rounded-xl border p-3"><span className="grid size-8 place-items-center rounded-lg bg-muted"><X size={15} className="text-brand-ink" /></span><span className="min-w-0"><b className="block text-sm">{t as string}</b><span className="text-xs text-muted-foreground">{s as string}</span></span></div>; })}</div>
      </div>
      <figcaption className="border-t px-5 py-3 text-xs text-muted-foreground">Example figures. Your report shows live activity for your listing, without buyer names.</figcaption>
    </figure>
  </div>;
}

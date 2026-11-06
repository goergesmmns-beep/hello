import { FileSignature, Landmark, LayoutDashboard, PhoneCall } from "lucide-react";
const steps = [
  [FileSignature, "Sign in one tap", "Request a listing and sign the NDA on your phone. No printing, no PDFs to email back.", "About 2 minutes"],
  [Landmark, "Show funds or plan financing", "Upload proof of funds, or tell us you need financing. We route you to the right plan instead of turning you away.", "Reviewed by an advisor"],
  [LayoutDashboard, "Open the deal room", "Financials, documents, Q&A and the CIM in one private room, stamped with your email.", "After approval"],
  [PhoneCall, "Talk terms with an advisor", "Book a call, then send an indication of interest straight from the deal room.", "When you are ready"],
] as const;
export function BuySteps() {
  return <section className="wrap py-16 md:py-24"><div className="mb-10 max-w-2xl"><p className="eyebrow mb-3">How buying works</p><h2 className="h2">From first look to LOI, without the back-and-forth.</h2></div>
    <ol className="grid gap-px overflow-hidden ringcard bg-border md:grid-cols-4">{steps.map(([I, t, d, time], i) => <li key={t} className="reveal flex flex-col bg-background p-6"><div className="flex items-center justify-between"><span className="grid size-10 place-items-center rounded-lg border"><I size={18} className="text-brand-ink" /></span><span className="num text-sm text-muted-foreground">0{i + 1}</span></div><h3 className="mt-6 text-lg font-semibold">{t}</h3><p className="mt-2 text-[15px] text-muted-foreground">{d}</p><p className="num mt-auto pt-5 text-xs text-brand-ink">{time}</p></li>)}</ol></section>;
}

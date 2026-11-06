import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import type { Listing } from "@/content/listings";
import { categoryIcon } from "@/components/listing-card";
import type { Buyer } from "@/lib/types";

const steps = ["Inquiry", "Profile", "NDA", "Funding", "Deal room", "Call"];
export function progress(b: Buyer) { return b.events.some((e) => e.type === "call") ? 5 : b.cimViews > 0 || b.stage === "cim" ? 4 : b.funds?.status === "verified" || b.stage === "review" ? 3 : b.nda ? 2 : b.why ? 1 : 0; }
export function next(b: Buyer): [string, string | null] {
  const access = `/access/${b.token}?v=${b.verifyCode}`, room = `/room/${b.token}?v=${b.verifyCode}`;
  if (b.stage === "inquiry") return ["Complete your profile and sign the NDA", access];
  if (b.stage === "nda" || b.stage === "capacity") return [b.funds?.status === "more" ? "Your advisor needs more proof of funds" : "Confirm your funding", access];
  if (b.stage === "review") return ["An advisor is reviewing your profile", null];
  if (b.stage === "cim" || b.stage === "call") return ["Open the deal room", room];
  return ["Talk to an advisor about funding", access];
}
export function DealCard({ b, l }: { b: Buyer; l?: Listing }) {
  const p = progress(b); const [label, href] = next(b); const I = categoryIcon(l?.category ?? "");
  return <article className="panel"><div className="panel-head"><I size={17} className="text-muted-foreground" /><span className="min-w-0 flex-1 truncate text-[15px] font-semibold">{l?.category ?? "Listing"}</span><span className="text-xs text-muted-foreground">Updated {new Date(b.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span></div>
    <div className="well">
      <h3 className="text-lg font-semibold leading-tight tracking-tight">{l?.title ?? b.listingSlug}</h3>
      <ol className="mt-5 grid grid-cols-6 gap-1.5" aria-label="Progress">{steps.map((s, i) => <li key={s} aria-current={i === p ? "step" : undefined}><span className={`block h-1.5 rounded-full ${i < p ? "bg-c-green" : i === p ? "bg-c-orange" : "bg-muted"}`} /><span className={`mt-1.5 hidden truncate text-[11px] sm:block ${i === p ? "font-medium text-foreground" : "text-muted-foreground"}`}>{s}</span></li>)}</ol>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4"><p className="flex items-center gap-2 text-sm">{b.nda && <span className="flex items-center gap-1 rounded-md border bg-surface-1 px-2 py-0.5 text-xs"><Check size={12} className="text-c-green" />NDA</span>}{b.funds?.status === "verified" && <span className="flex items-center gap-1 rounded-md border bg-surface-1 px-2 py-0.5 text-xs"><Check size={12} className="text-c-green" />Funds verified</span>}<span className="text-muted-foreground">{label}</span></p>{href && <Link href={href} className="btn btn-primary !min-h-9 !rounded-[10px] !px-3.5 !text-[13.5px]">{b.stage === "cim" || b.stage === "call" ? "Deal room" : "Continue"} <ArrowRight size={15} /></Link>}</div>
    </div></article>;
}

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BadgeCheck, FileSignature, LayoutDashboard, LineChart, ShieldCheck, Store } from "lucide-react";
import { Wordmark } from "@/components/chrome";
import { LoginCard } from "@/components/account/login";
import { currentUser, googleReady, safeNext } from "@/lib/accounts";
export const metadata: Metadata = { title: "Sign in", robots: { index: false } };
export const dynamic = "force-dynamic";
export default async function Login({ searchParams }: { searchParams: Promise<{ next?: string; error?: string; intent?: string }> }) {
  const sp = await searchParams; const next = safeNext(sp.next ?? (sp.intent === "sell" ? "/account/sell" : "/account"));
  if (await currentUser()) redirect(next);
  const points = sp.intent === "sell" ? [[Store, "Submit your business privately", "A guided listing in about 15 minutes. Nothing goes public until you approve it."], [ShieldCheck, "Verified buyers only", "Every buyer signs an NDA and shows funds before seeing your name."], [LineChart, "Live seller report", "See inquiries, NDAs, verified buyers and offers as they happen."]] : [[FileSignature, "One-tap NDAs", "Sign once on your phone. Your signed copies live in your account."], [BadgeCheck, "Verified once, used everywhere", "Proof of funds carries across listings while it is valid."], [LayoutDashboard, "Every deal in one place", "Deal rooms, documents, questions and offers on one dashboard."]];
  return <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
    <aside className="dark relative hidden overflow-hidden bg-background p-12 text-foreground lg:flex lg:flex-col"><div className="aurora" aria-hidden><i /><i /></div><div aria-hidden className="grid-lines absolute inset-0" />
      <Link href="/" className="relative"><Wordmark /></Link>
      <div className="relative mt-auto max-w-lg"><p className="eyebrow mb-4 !text-brand">Westbound Road account</p><h2 className="text-[44px] font-semibold leading-[1.02] tracking-[-.04em]">{sp.intent === "sell" ? "Sell with advisors who have done it." : "Buy your next business with less friction."}</h2>
        <ul className="mt-10 space-y-5">{points.map(([I, h, t]) => { const X = I as typeof Store; return <li key={h as string} className="ringcard flex gap-4 p-4"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand text-brand-foreground"><X size={18} /></span><span><b className="block">{h as string}</b><span className="text-sm text-muted-foreground">{t as string}</span></span></li>; })}</ul></div>
      <p className="relative mt-12 text-xs text-muted-foreground">Certified M&A Advisors · Confidential by default</p>
    </aside>
    <main className="flex flex-col px-5 py-8 sm:px-10">
      <div className="flex items-center justify-between"><Link href="/" className="lg:invisible"><Wordmark /></Link><Link href="/" className="text-sm text-muted-foreground hover:text-foreground">Back to site</Link></div>
      <div className="grid flex-1 place-items-center py-10"><LoginCard next={next} google={googleReady()} intent={sp.intent} error={sp.error === "google" ? "Google sign-in did not finish. Try again, or use your email." : undefined} /></div>
    </main>
  </div>;
}

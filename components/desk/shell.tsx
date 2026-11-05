"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Building2, Inbox, LayoutDashboard, Menu, Plug, Users, Workflow, X } from "lucide-react";
import { useState } from "react";
import { Wordmark } from "@/components/chrome";
import { Logout } from "./actions";

const items = [["/admin", "Overview", LayoutDashboard], ["/admin/pipeline", "Pipeline", Workflow], ["/admin/buyers", "Buyers", Users], ["/admin/listings", "Listings", Building2], ["/admin/inbox", "Inbox", Inbox], ["/admin/activity", "Activity", Activity], ["/admin/integrations", "Connections", Plug]] as const;
export function Shell({ review, inbox, children }: { review: number; inbox: number; children: React.ReactNode }) {
  const path = usePathname(); const [open, setOpen] = useState(false);
  const badge = (h: string) => (h === "/admin/pipeline" ? review : h === "/admin/inbox" ? inbox : 0);
  const nav = <nav className="space-y-1" aria-label="Advisor desk">{items.map(([h, l, I]) => { const on = h === "/admin" ? path === h : path.startsWith(h); return <Link key={h} href={h} onClick={() => setOpen(false)} aria-current={on ? "page" : undefined} className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-[14.5px] font-medium transition-colors ${on ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}><I size={17} className={on ? "text-brand" : ""} />{l}{badge(h) > 0 && <span className="num ml-auto rounded bg-brand px-1.5 text-xs font-semibold text-brand-foreground">{badge(h)}</span>}</Link>; })}</nav>;
  return (
    <div className="lg:grid lg:grid-cols-[232px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-dvh flex-col border-r p-4 lg:flex"><Link href="/" className="mb-7 px-2 pt-1"><Wordmark /></Link>{nav}<div className="mt-auto flex items-center justify-between px-3"><Link href="/" className="text-sm text-muted-foreground hover:text-foreground">View site</Link><Logout /></div></aside>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background px-5 lg:hidden"><Wordmark /><button aria-label="Menu" aria-expanded={open} className="btn btn-ghost !min-h-9 !px-2" onClick={() => setOpen(!open)}>{open ? <X size={19} /> : <Menu size={19} />}</button></header>
      {open && <div className="border-b p-3 lg:hidden">{nav}<div className="mt-2 px-3"><Logout /></div></div>}
      <main className="min-w-0 px-5 py-7 lg:px-9 lg:py-9"><div className="mx-auto max-w-[1320px]">{children}</div></main>
    </div>
  );
}
export function PageTitle({ title, sub, children }: { title: string; sub?: string; children?: React.ReactNode }) {
  return <div className="mb-7 flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-[28px] font-semibold leading-tight">{title}</h1>{sub && <p className="mt-1 text-muted-foreground">{sub}</p>}</div>{children}</div>;
}
export function Card({ title, sub, action, children, className = "" }: { title?: string; sub?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return <section className={`min-w-0 rounded-xl border bg-card p-5 ${className}`}>{title && <div className="mb-4 flex items-start justify-between gap-3"><div><h2 className="text-[15px] font-semibold tracking-tight">{title}</h2>{sub && <p className="text-[13px] text-muted-foreground">{sub}</p>}</div>{action}</div>}{children}</section>;
}
export function Empty({ title, text }: { title: string; text: string }) { return <div className="rounded-lg border border-dashed p-7 text-center"><p className="font-semibold">{title}</p><p className="mt-1 text-sm text-muted-foreground">{text}</p></div>; }
export function StagePill({ stage, label }: { stage: string; label: string }) { return <span className={`inline-block rounded-md border px-2 py-0.5 text-xs font-medium ${stage === "review" ? "border-brand bg-brand text-brand-foreground" : stage === "call" || stage === "cim" ? "border-foreground/40" : "text-muted-foreground"}`}>{label}</span>; }

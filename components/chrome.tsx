"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { company, legalNote, nav } from "@/content/site";

export function Wordmark() {
  return <span className="inline-flex items-center gap-2.5 font-semibold tracking-tight text-[17px]"><span aria-hidden className="flex gap-[3px]"><i className="block h-[3px] w-3 bg-brand" /><i className="block h-[3px] w-3 bg-brand" /></span>Westbound Road</span>;
}
/** Shows the first name when signed in. Reads a display-only cookie; the session itself is HttpOnly. */
function AccountLink() {
  const [who, setWho] = useState<string | null>(null);
  useEffect(() => { const m = document.cookie.match(/(?:^|; )wb_who=([^;]+)/); setWho(m ? decodeURIComponent(m[1]) : ""); }, []);
  if (who === null) return <span className="hidden w-20 sm:block" />;
  return who ? <Link id="nav-account" href="/account" className="hidden items-center gap-2 rounded-full border py-1 pl-1 pr-3 text-sm font-medium hover:border-foreground/40 sm:flex"><span className="grad-av grid size-7 place-items-center rounded-full text-[11px] font-bold">{who[0]?.toUpperCase()}</span>{who}</Link> : <Link id="nav-login" href="/login" className="hidden px-2 text-[15px] font-medium text-muted-foreground hover:text-foreground sm:block">Log in</Link>;
}
export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="wrap flex h-16 items-center justify-between gap-6">
        <Link href="/" onClick={() => setOpen(false)} aria-label="Westbound Road home"><Wordmark /></Link>
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Main">
          {nav.map((n) => <Link key={n.href} href={n.href} className="text-[15px] font-medium text-muted-foreground transition-colors hover:text-foreground">{n.label}</Link>)}
        </nav>
        <div className="flex items-center gap-2">
          <AccountLink />
          <Link href="/contact" className="btn btn-primary hidden !min-h-10 sm:inline-flex">Talk to an advisor</Link>
          <button className="btn btn-ghost !min-h-10 !px-2.5 lg:hidden" aria-expanded={open} aria-label="Menu" onClick={() => setOpen(!open)}>{open ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
      </div>
      {open && <nav className="wrap flex flex-col border-t py-3 lg:hidden" aria-label="Mobile">
        {[...nav, { href: "/account", label: "Your account" }, { href: "/contact", label: "Contact" }].map((n) => <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="py-3 text-lg font-medium">{n.label}</Link>)}
      </nav>}
    </header>
  );
}
export function Footer() {
  const cols: [string, [string, string][]][] = [
    ["Buyers", [["/buy", "Current listings"], ["/acquisitions-alliance", "Acquisitions Alliance"], ["/insights", "Insights"]]],
    ["Sellers", [["/sell", "Sell your business"], ["/grow", "Grow through acquisition"], ["/valuation", "What's my business worth?"], ["/success", "Client results"]]],
    ["Firm", [["/about", "About"], ["/team", "Team"], ["/media", "Media"], ["/referrals", "Referral program"], ["/contact", "Contact"], ["/privacy", "Privacy"]]],
  ];
  return (
    <footer className="dark bg-background text-foreground">
      <div className="wrap grid gap-10 py-16 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="space-y-3"><Wordmark /><p className="text-sm text-muted-foreground">{company.address.join(", ")}<br /><span className="num">{company.phone}</span></p></div>
        {cols.map(([h, links]) => <div key={h}><p className="eyebrow mb-3">{h}</p><ul className="space-y-2 text-[15px]">{links.map(([href, l]) => <li key={href}><Link className="hover:text-brand" href={href}>{l}</Link></li>)}</ul></div>)}
      </div>
      <div className="wrap"><div className="border-t py-6 text-xs leading-relaxed text-muted-foreground"><p className="max-w-4xl">{legalNote}</p><p className="mt-3">© {new Date().getFullYear()} {company.legal}</p></div></div>
    </footer>
  );
}

"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, ExternalLink, LogOut, Repeat, type LucideIcon } from "lucide-react";
import { DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

export type PortalUser = { name: string; email: string; photo?: string; roles: ("buyer" | "seller")[] };
export const initials = (n: string) => n.split(" ").map((x) => x[0]).slice(0, 2).join("").toUpperCase();
export function Avatar({ u, size = 36 }: { u: PortalUser; size?: number }) {
  return u.photo ? <img src={u.photo} alt="" style={{ width: size, height: size }} className="shrink-0 rounded-lg object-cover" referrerPolicy="no-referrer" /> : <span style={{ width: size, height: size }} className="grad-av grid shrink-0 place-items-center rounded-lg text-[12px] font-bold">{initials(u.name)}</span>;
}
export function Mark() { return <span aria-hidden className="grid size-8 shrink-0 place-items-center rounded-lg border bg-surface-1"><span className="flex gap-[2px]"><i className="block h-[3px] w-[7px] rounded-full bg-c-orange" /><i className="block h-[3px] w-[7px] rounded-full bg-foreground" /></span></span>; }

/** Opens the other portal. Adds the role first when the account does not have it yet. */
export async function openPortal(role: "buyer" | "seller") {
  const r = await fetch("/api/account", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "portal", role }) });
  const d = await r.json().catch(() => ({})); window.location.assign(d.next ?? (role === "seller" ? "/seller" : "/buyer"));
}
/** The shared end of both account menus. */
export function MenuTail({ u, here, extra }: { u: PortalUser; here: "buyer" | "seller"; extra?: [string, string, LucideIcon][] }) {
  const other = here === "buyer" ? "seller" : "buyer"; const has = u.roles.includes(other);
  return <>
    <DropdownMenuLabel className="font-normal"><b className="block">{u.name}</b><span className="text-xs text-muted-foreground">{u.email}</span></DropdownMenuLabel><DropdownMenuSeparator />
    {extra?.map(([h, l, I]) => <DropdownMenuItem key={h} asChild><Link href={h}><I />{l}</Link></DropdownMenuItem>)}
    <DropdownMenuItem id="open-other-portal" onSelect={() => openPortal(other)}><Repeat />{has ? `Open ${other} dashboard` : other === "seller" ? "Sell a business" : "Start buying"}</DropdownMenuItem>
    <DropdownMenuItem asChild><Link href="/"><ExternalLink />Westbound Road site</Link></DropdownMenuItem><DropdownMenuSeparator />
    <DropdownMenuItem id="account-signout" onSelect={async () => { await fetch("/api/auth/logout", { method: "POST" }); window.location.assign("/"); }}><LogOut />Sign out</DropdownMenuItem>
  </>;
}
/** Shown when someone opens a portal their account is not set up for yet. */
export function Activate({ role, points }: { role: "buyer" | "seller"; points: string[] }) {
  const [busy, setBusy] = useState(false);
  return <div className="grid min-h-dvh place-items-center bg-background p-5"><div className="panel w-full max-w-lg"><div className="well p-7 md:p-9">
    <Mark /><h1 className="mt-6 text-[26px] font-semibold tracking-tight">{role === "buyer" ? "Set up your buyer dashboard" : "Set up your seller dashboard"}</h1>
    <p className="mt-2 text-muted-foreground">{role === "buyer" ? "Your account does not have a buyer side yet. It takes one click, and your seller dashboard stays as it is." : "Your account does not have a seller side yet. It takes one click, and your buyer dashboard stays as it is."}</p>
    <ul className="mt-5 space-y-2 text-sm">{points.map((p) => <li key={p} className="flex gap-2"><span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-c-orange" />{p}</li>)}</ul>
    <button id="activate-portal" disabled={busy} onClick={() => { setBusy(true); openPortal(role); }} className="btn btn-brand mt-7 w-full">{busy ? "Setting up…" : role === "buyer" ? "Open buyer dashboard" : "Open seller dashboard"} <ArrowRight size={17} /></button>
    <Link href="/account" className="mt-3 block text-center text-sm text-muted-foreground hover:text-foreground">Back to my dashboard</Link>
  </div></div></div>;
}

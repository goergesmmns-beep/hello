"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, ChevronsUpDown, LayoutList, MessagesSquare, Plus, UserRound } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/desk/theme";
import { Avatar, Mark, MenuTail, type PortalUser } from "./common";

export type ShellListing = { id: string; title: string; status: string; label: string; tone: string };
const tabs: [string, string, keyof SellerBadges | null][] = [["/seller", "Overview", null], ["/seller/listing", "Listing", null], ["/seller/buyers", "Buyers", "buyers"], ["/seller/offers", "Offers", "offers"], ["/seller/documents", "Documents", null], ["/seller/messages", "Messages", "unread"], ["/seller/valuation", "Valuation", null]];
export type SellerBadges = { buyers: number; offers: number; unread: number };

/** The seller's dashboard. One business at a time, picked from the switcher, with tabs across the top. */
export function SellerShell({ user, listings, current, badges, children }: { user: PortalUser; listings: ShellListing[]; current?: ShellListing; badges: SellerBadges; children: React.ReactNode }) {
  const p = usePathname(); const on = (h: string) => (h === "/seller" ? p === h : p === h || p.startsWith(h + "/"));
  const back = encodeURIComponent(p.startsWith("/seller/listings") ? "/seller" : p);
  return <div className="min-h-dvh bg-background">
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-[60px] max-w-[1240px] items-center gap-2 px-4 md:gap-3 md:px-6">
        <Link href="/seller" className="flex shrink-0 items-center gap-2.5"><Mark /><span className="hidden leading-tight sm:grid"><span className="text-[15px] font-semibold tracking-tight">Westbound Road</span><span className="text-[11.5px] font-medium uppercase tracking-[.12em] text-c-orange">Seller</span></span></Link>
        <span aria-hidden className="mx-1 hidden h-6 w-px rotate-12 bg-border sm:block" />
        <DropdownMenu><DropdownMenuTrigger asChild><button id="listing-switcher" type="button" className="flex min-w-0 max-w-[340px] cursor-pointer items-center gap-2 rounded-[10px] px-2 py-1.5 text-left outline-none hover:bg-surface-1">{current ? <><i className="block size-2 shrink-0 rounded-full" style={{ background: current.tone }} /><span className="truncate text-[14px] font-medium">{current.title}</span></> : <span className="text-[14px] font-medium">Your business</span>}<ChevronsUpDown size={14} className="shrink-0 text-muted-foreground" /></button></DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-72 rounded-xl"><DropdownMenuLabel className="text-xs font-medium text-muted-foreground">Your businesses</DropdownMenuLabel>
            {listings.map((l) => <DropdownMenuItem key={l.id} asChild><a href={`/seller/switch?id=${l.id}&to=${back}`} className="flex items-center gap-2.5"><i className="block size-2 shrink-0 rounded-full" style={{ background: l.tone }} /><span className="min-w-0 flex-1"><span className="block truncate">{l.title}</span><span className="text-xs text-muted-foreground">{l.label}</span></span>{l.id === current?.id && <Check size={15} />}</a></DropdownMenuItem>)}
            <DropdownMenuSeparator /><DropdownMenuItem asChild><Link href="/seller/listings"><LayoutList />All businesses</Link></DropdownMenuItem><DropdownMenuItem asChild><a href="/seller/new" id="new-listing"><Plus />List another business</a></DropdownMenuItem>
          </DropdownMenuContent></DropdownMenu>
        <div className="ml-auto flex items-center gap-1.5">
          <Link href="/seller/messages" className="tbtn !h-9 hidden sm:inline-flex"><MessagesSquare size={15} />Advisor{badges.unread > 0 && <span className="num grid size-5 place-items-center rounded-full bg-c-orange text-[11px] text-black">{badges.unread}</span>}</Link>
          <ThemeToggle />
          <DropdownMenu><DropdownMenuTrigger asChild><button id="account-menu" type="button" aria-label="Account" className="cursor-pointer rounded-lg outline-none ring-c-orange/60 focus-visible:ring-2"><Avatar u={user} size={34} /></button></DropdownMenuTrigger><DropdownMenuContent align="end" className="min-w-60 rounded-xl"><MenuTail u={user} here="seller" extra={[["/seller/profile", "Your details", UserRound], ["/seller/listings", "All businesses", LayoutList]]} /></DropdownMenuContent></DropdownMenu>
        </div>
      </div>
      <nav aria-label="Seller" className="mx-auto max-w-[1240px] px-2 md:px-4"><ul className="-mb-px flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{tabs.map(([h, l, k]) => <li key={h} className="shrink-0"><Link href={h} aria-current={on(h) ? "page" : undefined} className={`flex h-11 items-center gap-1.5 border-b-2 px-3 text-[14px] transition-colors ${on(h) ? "border-c-orange font-medium text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>{l}{k && badges[k] > 0 && <span className={`num grid h-5 min-w-5 place-items-center rounded-md px-1 text-[11px] ${k === "unread" ? "bg-c-orange text-black" : "border bg-surface-1"}`}>{badges[k]}</span>}</Link></li>)}</ul></nav>
    </header>
    <main className="mx-auto max-w-[1240px] px-4 pb-20 pt-7 md:px-6">{children}</main>
  </div>;
}

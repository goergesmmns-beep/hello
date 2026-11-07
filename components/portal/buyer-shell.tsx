"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { BadgeCheck, Bell, Bookmark, BriefcaseBusiness, ChevronDown, ChevronsUpDown, FolderLock, Home, Search, Store, UserRound, type LucideIcon } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarRail, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/desk/theme";
import { ExpandMark } from "@/components/desk/shell";
import { Avatar, MenuTail, type PortalUser } from "./common";

const item = "h-9 gap-2.5 rounded-lg px-2.5 text-[14px] text-sidebar-foreground/65 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-foreground data-[active=true]:shadow-[inset_0_0_0_1px_var(--line-2)] [&>svg]:size-[17px] group-data-[collapsible=icon]:[&>svg]:size-[18px] group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:text-sidebar-foreground/55 group-data-[collapsible=icon]:hover:text-sidebar-foreground group-data-[collapsible=icon]:data-[active=true]:text-sidebar-foreground";
const tile = (bg: string) => `nav-tile grid size-[22px] shrink-0 place-items-center rounded-md text-white shadow-[inset_0_1px_0_rgba(255,255,255,.25)] [&>svg]:!size-[13px] ${bg} group-data-[collapsible=icon]:!bg-transparent group-data-[collapsible=icon]:!text-current group-data-[collapsible=icon]:shadow-none group-data-[collapsible=icon]:[&>svg]:!size-[18px]`;
function L({ h, l, I, n, tileBg, exact }: { h: string; l: string; I: LucideIcon; n?: number; tileBg?: string; exact?: boolean }) {
  const p = usePathname(); const { isMobile, setOpenMobile } = useSidebar(); const on = exact ? p === h : p === h || p.startsWith(h + "/");
  return <SidebarMenuItem><SidebarMenuButton asChild isActive={on} tooltip={l} className={item}><Link href={h} onClick={() => isMobile && setOpenMobile(false)}>{tileBg ? <span className={tile(tileBg)}><I /></span> : <I />}<span>{l}</span></Link></SidebarMenuButton>{!!n && <SidebarMenuBadge className="num !top-1/2 h-5 -translate-y-1/2 rounded-md border border-sidebar-border bg-sidebar px-1.5 text-[11px] text-sidebar-foreground/70">{n}</SidebarMenuBadge>}</SidebarMenuItem>;
}
function G({ label, children }: { label: string; children: React.ReactNode }) {
  const { state } = useSidebar(); const [open, setOpen] = useState(true);
  return <Collapsible open={open || state === "collapsed"} onOpenChange={setOpen} className="group/coll"><span aria-hidden className="mx-auto my-2 hidden h-px w-6 bg-sidebar-border group-data-[collapsible=icon]:block" /><SidebarGroup className="py-1"><SidebarGroupLabel asChild className="h-8 px-2.5 text-[13px] font-medium text-sidebar-foreground/50"><CollapsibleTrigger className="flex w-fit cursor-pointer items-center gap-1.5 hover:text-sidebar-foreground">{label}<ChevronDown size={14} className="transition-transform group-data-[state=closed]/coll:-rotate-90" /></CollapsibleTrigger></SidebarGroupLabel><CollapsibleContent><SidebarMenu className="gap-0.5">{children}</SidebarMenu></CollapsibleContent></SidebarGroup></Collapsible>;
}
const titles: [RegExp, string][] = [[/^\/buyer$/, "Home"], [/listings\/./, "Listing"], [/listings/, "Marketplace"], [/deals\/./, "Deal"], [/deals/, "My deals"], [/saved/, "Saved"], [/searches/, "Saved searches"], [/documents/, "Documents"], [/profile/, "Buyer profile"]];
export type BuyerCounts = { open: number; deals: number; action: number; saved: number; searches: number; readiness: number; verified: boolean };

/** Header search. Enter jumps to the marketplace with the query applied. */
function QuickSearch() {
  const router = useRouter(); const [q, setQ] = useState("");
  return <form role="search" className="relative hidden w-full max-w-sm md:block" onSubmit={(e) => { e.preventDefault(); router.push(`/buyer/listings${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ""}`); }}><Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><label htmlFor="quick-search" className="sr-only">Search businesses</label><input id="quick-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search businesses for sale" className="h-9 w-full rounded-[10px] border bg-surface-1 pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-c-orange" /></form>;
}

/** The buyer's dashboard: marketplace first, then the deals they are working. */
export function BuyerShell({ user, counts, children }: { user: PortalUser; counts: BuyerCounts; children: React.ReactNode }) {
  const p = usePathname(); const title = titles.find(([r]) => r.test(p))?.[1] ?? "Buyer";
  return <SidebarProvider>
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-3 pb-2 pt-3.5 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:pt-4"><ExpandMark /><div className="flex items-center justify-between gap-2 group-data-[collapsible=icon]:hidden"><Link href="/buyer" className="flex min-w-0 items-center gap-2.5"><span aria-hidden className="grid size-8 shrink-0 place-items-center rounded-lg border border-sidebar-border bg-sidebar-accent"><span className="flex gap-[2px]"><i className="block h-[3px] w-[7px] rounded-full bg-c-orange" /><i className="block h-[3px] w-[7px] rounded-full bg-sidebar-foreground" /></span></span><span className="grid min-w-0 leading-tight group-data-[collapsible=icon]:hidden"><span className="truncate text-[15px] font-semibold tracking-tight">Westbound Road</span><span className="text-[11.5px] font-medium uppercase tracking-[.12em] text-c-orange">Buyer</span></span></Link><SidebarTrigger id="sidebar-collapse" className="size-7 shrink-0 rounded-md border border-sidebar-border bg-sidebar-accent/60 group-data-[collapsible=icon]:hidden [&>svg]:size-3.5" /></div></SidebarHeader>
      <SidebarContent className="gap-0 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <SidebarGroup className="pb-1 pt-2"><SidebarMenu className="gap-0.5"><L h="/buyer" l="Home" I={Home} exact /><L h="/buyer/listings" l="Marketplace" I={Store} n={counts.open} /></SidebarMenu></SidebarGroup>
        <G label="Deal flow"><L h="/buyer/deals" l="My deals" I={BriefcaseBusiness} n={counts.deals} tileBg="bg-[oklch(0.62_0.17_250)]" /><L h="/buyer/saved" l="Saved" I={Bookmark} n={counts.saved} tileBg="bg-[oklch(0.68_0.19_48)]" /><L h="/buyer/searches" l="Saved searches" I={Bell} n={counts.searches} tileBg="bg-[oklch(0.58_0.17_295)]" /></G>
        <G label="Records"><L h="/buyer/documents" l="Documents" I={FolderLock} tileBg="bg-[oklch(0.62_0.16_150)]" /><L h="/buyer/profile" l="Buyer profile" I={UserRound} /></G>
        <div className="mx-2 mb-2 mt-auto rounded-xl border border-sidebar-border bg-sidebar-accent/40 p-3 group-data-[collapsible=icon]:hidden">
          <p className="flex items-center justify-between text-[13px] font-medium">Buyer readiness<span className="num text-sidebar-foreground/60">{counts.readiness}%</span></p>
          <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-sidebar-accent"><i className="grad-bar block h-full rounded-full" style={{ width: `${counts.readiness}%` }} /></span>
          <p className="mt-2 flex items-center gap-1.5 text-xs text-sidebar-foreground/60">{counts.verified ? <><BadgeCheck size={13} className="text-c-green" />Funds verified</> : <Link href="/buyer/profile" className="hover:text-sidebar-foreground">Complete your profile to move faster</Link>}</p>
        </div>
      </SidebarContent>
      <SidebarFooter className="px-2 pb-3"><DropdownMenu><DropdownMenuTrigger asChild><button id="account-menu" type="button" className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl border border-sidebar-border bg-sidebar-accent/50 p-2 text-left outline-none hover:bg-sidebar-accent group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:border-0 group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-0"><Avatar u={user} /><span className="grid min-w-0 flex-1 leading-tight group-data-[collapsible=icon]:hidden"><span className="truncate text-[14px] font-medium">{user.name}</span><span className="truncate text-xs text-sidebar-foreground/55">{user.email}</span></span><ChevronsUpDown size={15} className="shrink-0 text-sidebar-foreground/50 group-data-[collapsible=icon]:hidden" /></button></DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-60 rounded-xl" side="top" align="end" sideOffset={8}><MenuTail u={user} here="buyer" extra={[["/buyer/profile", "Buyer profile", UserRound], ["/buyer/documents", "Documents", FolderLock]]} /></DropdownMenuContent></DropdownMenu></SidebarFooter>
      <SidebarRail />
    </Sidebar>
    <SidebarInset className="min-w-0">
      <header className="sticky top-0 z-30 flex h-[60px] items-center gap-3 border-b bg-background/90 px-3 backdrop-blur md:px-5"><SidebarTrigger className="-ml-1 size-9 md:hidden group-has-data-[collapsible=icon]/sidebar-wrapper:md:inline-flex" /><nav aria-label="Breadcrumb" className="flex min-w-0 shrink-0 items-center gap-1.5 text-sm"><Link href="/buyer" className="text-muted-foreground hover:text-foreground">Buyer</Link><span className="text-muted-foreground">/</span><span className="truncate font-medium">{title}</span></nav>
        <div className="ml-auto flex flex-1 items-center justify-end gap-2"><QuickSearch />{counts.action > 0 && <Link href="/buyer/deals" className="tbtn !h-9 shrink-0"><span className="live-dot !size-1.5" />{counts.action} to do</Link>}<Link href="/buyer/listings" aria-label="Marketplace" className="tbtn !h-9 md:hidden"><Search size={15} /></Link><ThemeToggle /></div></header>
      <main className="min-w-0 flex-1 px-4 pb-20 pt-6 md:px-6 lg:px-8"><div className="mx-auto max-w-[1240px]">{children}</div></main>
    </SidebarInset>
  </SidebarProvider>;
}

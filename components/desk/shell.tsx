"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Activity, BarChart3, Building2, CheckSquare, ChevronDown, ChevronsUpDown, ExternalLink, FileSignature, Handshake, Inbox, Landmark, LayoutDashboard, ListChecks, LogOut, Plug, Users, Workflow, type LucideIcon } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarRail, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Notifications, type Note } from "./notifications";
import { Search } from "./search";
import { ThemeToggle } from "./theme";

const groups = [
  ["Desk", [["/admin", "Overview", LayoutDashboard], ["/admin/tasks", "Tasks", CheckSquare], ["/admin/inbox", "Inbox", Inbox]]],
  ["Buyers", [["/admin/pipeline", "Pipeline", Workflow], ["/admin/buyers", "All buyers", Users], ["/admin/funds", "Proof of funds", Landmark], ["/admin/ndas", "NDAs", FileSignature], ["/admin/offers", "Offers", Handshake]]],
  ["Deals", [["/admin/listings", "Listings", Building2], ["/admin/submissions", "Seller submissions", Inbox], ["/admin/accounts", "Accounts", Users], ["/admin/reports", "Reports", BarChart3], ["/admin/activity", "Activity", Activity]]],
  ["Settings", [["/admin/integrations", "Connections", Plug]]],
] as const;
const names: Record<string, string> = Object.fromEntries(groups.flatMap(([, i]) => i.map(([h, l]) => [h, l])));
const signOut = async () => { await fetch("/api/admin/logout", { method: "POST" }); window.location.assign("/admin/login"); };
function crumbs(path: string): [string, string][] {
  const parts = path.split("/").filter(Boolean); if (parts.length <= 1) return [["/admin", "Overview"]];
  const base = `/admin/${parts[1]}`; const out: [string, string][] = [[base, names[base] ?? parts[1]]];
  if (parts[1] === "buyers" && parts[2]) out.push([path, "Buyer record"]);
  if (parts[1] === "submissions" && parts[2]) out.push([path, "Review"]);
  if (parts[1] === "listings" && parts[2]) out.push([path, parts[2] === "new" ? "New listing" : parts[3] === "report" ? "Seller report" : "Edit listing"]);
  return out;
}

const tile = (bg: string) => `grid size-[22px] shrink-0 place-items-center rounded-md text-white shadow-[inset_0_1px_0_rgba(255,255,255,.25)] [&>svg]:!size-[13px] ${bg}`;
const item = "h-9 gap-2.5 rounded-lg px-2.5 text-[14px] text-sidebar-foreground/65 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-foreground data-[active=true]:shadow-[inset_0_0_0_1px_var(--line-2)] [&>svg]:size-[17px]";
function Count({ n, dot }: { n: number; dot?: boolean }) {
  if (!n) return null;
  return dot ? <span aria-label={`${n} waiting`} className="absolute right-2.5 top-1/2 size-2 -translate-y-1/2 rounded-full bg-c-orange shadow-[0_0_0_3px_color-mix(in_oklch,var(--c-orange)_22%,transparent)] group-data-[collapsible=icon]:right-1 group-data-[collapsible=icon]:top-1.5" /> : <SidebarMenuBadge className="num !top-1/2 h-5 -translate-y-1/2 rounded-md border border-sidebar-border bg-sidebar px-1.5 text-[11px] text-sidebar-foreground/70">{n}</SidebarMenuBadge>;
}
function NavLink({ h, l, I, n, dot, tileBg }: { h: string; l: string; I: LucideIcon; n?: number; dot?: boolean; tileBg?: string }) {
  const path = usePathname(); const { setOpenMobile, isMobile } = useSidebar(); const on = h === "/admin" ? path === h : path.startsWith(h);
  return <SidebarMenuItem><SidebarMenuButton asChild isActive={on} tooltip={n ? `${l} (${n})` : l} className={item}><Link href={h} aria-current={on ? "page" : undefined} onClick={() => isMobile && setOpenMobile(false)}>{tileBg ? <span className={tile(tileBg)}><I /></span> : <I />}<span>{l}</span></Link></SidebarMenuButton><Count n={n ?? 0} dot={dot} /></SidebarMenuItem>;
}
/** A folding group with a chevron label, like the reference. Always open while the bar shows icons only. */
function Group({ label, children }: { label: string; children: React.ReactNode }) {
  const { state } = useSidebar(); const [open, setOpen] = useState(true);
  return <Collapsible open={open || state === "collapsed"} onOpenChange={setOpen} className="group/coll"><SidebarGroup className="py-1">
    <SidebarGroupLabel asChild className="h-8 px-2.5 text-[13px] font-medium text-sidebar-foreground/50"><CollapsibleTrigger className="flex w-fit cursor-pointer items-center gap-1.5 hover:text-sidebar-foreground">{label}<ChevronDown size={14} className="transition-transform group-data-[state=closed]/coll:-rotate-90" /></CollapsibleTrigger></SidebarGroupLabel>
    <CollapsibleContent><SidebarMenu className="gap-0.5">{children}</SidebarMenu></CollapsibleContent>
  </SidebarGroup></Collapsible>;
}
/** Child links hang off the parent with curved connector lines. */
function Tree({ items }: { items: { h: string; l: string; I: LucideIcon; n?: number; dot?: boolean }[] }) {
  return <li className="relative ml-[19px] group-data-[collapsible=icon]:ml-0"><ul className="flex flex-col gap-0.5">{items.map((x, i) => <li key={x.h} className="relative pl-[18px] group-data-[collapsible=icon]:pl-0">
    <span aria-hidden className="absolute left-0 top-0 h-1/2 w-3 rounded-bl-[9px] border-b border-l border-sidebar-foreground/20 group-data-[collapsible=icon]:hidden" />
    {i < items.length - 1 && <span aria-hidden className="absolute bottom-0 left-0 top-1/2 border-l border-sidebar-foreground/20 group-data-[collapsible=icon]:hidden" />}
    <ul><NavLink {...x} /></ul></li>)}</ul></li>;
}
function User({ email }: { email: string }) {
  const { isMobile } = useSidebar();
  const av = <span className="relative shrink-0"><span className="grad-av grid size-9 place-items-center rounded-lg text-[12px] font-bold">WR</span><i className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-sidebar bg-c-green" /></span>;
  return <DropdownMenu><DropdownMenuTrigger asChild><button id="user-menu" type="button" className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl border border-sidebar-border bg-sidebar-accent/50 p-2 text-left outline-none transition-colors hover:bg-sidebar-accent data-[state=open]:bg-sidebar-accent group-data-[collapsible=icon]:border-0 group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-0">{av}<span className="grid min-w-0 flex-1 leading-tight group-data-[collapsible=icon]:hidden"><span className="truncate text-[14px] font-medium">Advisor desk</span><span className="truncate text-xs text-sidebar-foreground/55">{email}</span></span><ChevronsUpDown className="size-4 text-sidebar-foreground/50 group-data-[collapsible=icon]:hidden" /></button></DropdownMenuTrigger>
    <DropdownMenuContent className="min-w-60 rounded-xl" side={isMobile ? "top" : "right"} align="end" sideOffset={8}><DropdownMenuLabel className="flex items-center gap-2.5 font-normal">{av}<span className="grid min-w-0 leading-tight"><span className="truncate font-medium">Advisor desk</span><span className="truncate text-xs text-muted-foreground">{email}</span></span></DropdownMenuLabel><DropdownMenuSeparator />
      <DropdownMenuItem asChild><Link href="/" target="_blank"><ExternalLink />View public site</Link></DropdownMenuItem><DropdownMenuItem asChild><Link href="/admin/integrations"><Plug />Connections</Link></DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem id="sign-out" onSelect={signOut}><LogOut />Sign out</DropdownMenuItem></DropdownMenuContent></DropdownMenu>;
}

export function Shell({ review, inbox, funds, tasks, subs = 0, notes, email, open, ready, children }: { subs?: number; review: number; inbox: number; funds: number; tasks: number; notes: Note[]; email: string; open: boolean; ready: [number, number]; children: React.ReactNode }) {
  const path = usePathname(); const c = crumbs(path);
  return (
    <SidebarProvider defaultOpen={open}>
      <Sidebar collapsible="icon" className="print:hidden">
        <SidebarHeader className="px-3 pb-2 pt-3.5 group-data-[collapsible=icon]:px-2"><div className="flex items-center justify-between gap-2"><Link href="/admin" className="flex min-w-0 items-center gap-2.5"><span aria-hidden className="grid size-8 shrink-0 place-items-center rounded-lg border border-sidebar-border bg-sidebar-accent"><span className="flex gap-[2px]"><i className="block h-[3px] w-[7px] rounded-full bg-c-orange" /><i className="block h-[3px] w-[7px] rounded-full bg-sidebar-foreground" /></span></span><span className="truncate text-[16px] font-semibold tracking-tight group-data-[collapsible=icon]:hidden">Westbound Road</span></Link><SidebarTrigger id="sidebar-collapse" className="size-7 shrink-0 rounded-md border border-sidebar-border bg-sidebar-accent/60 text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden [&>svg]:size-3.5" /></div></SidebarHeader>
        <SidebarContent className="gap-0 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <SidebarGroup className="pb-1 pt-2"><SidebarMenu className="gap-0.5"><NavLink h="/admin" l="Overview" I={LayoutDashboard} /><NavLink h="/admin/tasks" l="Tasks" I={CheckSquare} n={tasks} /><NavLink h="/admin/inbox" l="Inbox" I={Inbox} n={inbox} /></SidebarMenu></SidebarGroup>
          <Group label="Buyers"><NavLink h="/admin/buyers" l="All buyers" I={Users} /><Tree items={[{ h: "/admin/pipeline", l: "Pipeline", I: Workflow, n: review }, { h: "/admin/funds", l: "Proof of funds", I: Landmark, n: funds }, { h: "/admin/ndas", l: "NDAs", I: FileSignature }, { h: "/admin/offers", l: "Offers", I: Handshake }]} /></Group>
          <Group label="Deals"><NavLink h="/admin/listings" l="Listings" I={Building2} tileBg="bg-[oklch(0.62_0.17_250)]"/><NavLink h="/admin/reports" l="Reports" I={BarChart3} tileBg="bg-[oklch(0.68_0.19_48)]" /><NavLink h="/admin/activity" l="Activity" I={Activity} tileBg="bg-[oklch(0.62_0.16_150)]" /><NavLink h="/admin/integrations" l="Connections" I={Plug} tileBg="bg-[oklch(0.58_0.17_295)]" dot={ready[0] < ready[1]} /></Group>
        </SidebarContent>
        <SidebarFooter className="gap-1 px-2 pb-3">
          <SidebarMenu className="gap-0.5"><SidebarMenuItem><SidebarMenuButton asChild tooltip={`Launch checklist ${ready[0]}/${ready[1]}`} className={item}><Link href="/admin/integrations"><ListChecks /><span>Launch checklist</span><span className="num ml-auto text-xs text-sidebar-foreground/55">{ready[0]}/{ready[1]}</span></Link></SidebarMenuButton></SidebarMenuItem><SidebarMenuItem><SidebarMenuButton asChild tooltip="View site" className={item}><Link href="/" target="_blank"><ExternalLink /><span>View site</span></Link></SidebarMenuButton></SidebarMenuItem></SidebarMenu>
          <div className="mt-2"><User email={email} /></div>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset className="min-w-0">
        <header className="sticky top-0 z-30 flex h-[60px] shrink-0 items-center gap-2 border-b bg-background/90 px-3 backdrop-blur transition-[width,height] ease-linear print:hidden md:px-4 group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <SidebarTrigger id="sidebar-toggle" className="-ml-1 size-9 md:hidden group-has-data-[collapsible=icon]/sidebar-wrapper:md:inline-flex" />
          <Separator orientation="vertical" className="mr-1 data-[orientation=vertical]:h-4 md:hidden group-has-data-[collapsible=icon]/sidebar-wrapper:md:block" />
          <Breadcrumb className="min-w-0 flex-1"><BreadcrumbList className="flex-nowrap">{c.map(([h, l], i) => <span key={h} className="contents">{i > 0 && <BreadcrumbSeparator className="hidden sm:block" />}<BreadcrumbItem className={i < c.length - 1 ? "hidden sm:inline-flex" : "min-w-0"}>{i < c.length - 1 ? <BreadcrumbLink asChild><Link href={h}>{l}</Link></BreadcrumbLink> : <BreadcrumbPage className="truncate font-medium">{l}</BreadcrumbPage>}</BreadcrumbItem></span>)}</BreadcrumbList></Breadcrumb>
          <div className="flex items-center gap-0.5 md:gap-1"><Search /><Link href="/admin/listings/new" className="btn btn-brand mx-1 hidden !min-h-9 !gap-1.5 !rounded-[10px] !px-3.5 !text-[13.5px] lg:inline-flex">+ New listing</Link><Notifications notes={notes} /><ThemeToggle /><Separator orientation="vertical" className="mx-1.5 hidden data-[orientation=vertical]:h-5 sm:block" /><Link href="/admin/integrations" aria-label="Account and connections" className="hidden sm:block"><span className="grad-av grid size-8 place-items-center rounded-full text-[12px] font-bold">WR</span></Link></div>
        </header>
        <main className="min-w-0 flex-1 px-4 pb-24 pt-5 md:px-6 md:pb-10 md:pt-7 lg:px-8"><div className="mx-auto max-w-[1320px]">{children}</div></main>
      </SidebarInset>
    </SidebarProvider>
  );
}
export { Card, PageTitle, Empty, StagePill } from "./panel";

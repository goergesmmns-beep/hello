"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, BarChart3, Building2, CheckSquare, ChevronsUpDown, ExternalLink, FileSignature, Handshake, Inbox, Landmark, LayoutDashboard, LogOut, Plug, Users, Workflow } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  ["Deals", [["/admin/listings", "Listings", Building2], ["/admin/reports", "Reports", BarChart3], ["/admin/activity", "Activity", Activity]]],
  ["Settings", [["/admin/integrations", "Connections", Plug]]],
] as const;
const names: Record<string, string> = Object.fromEntries(groups.flatMap(([, i]) => i.map(([h, l]) => [h, l])));
const signOut = async () => { await fetch("/api/admin/logout", { method: "POST" }); window.location.assign("/admin/login"); };
function crumbs(path: string): [string, string][] {
  const parts = path.split("/").filter(Boolean); if (parts.length <= 1) return [["/admin", "Overview"]];
  const base = `/admin/${parts[1]}`; const out: [string, string][] = [[base, names[base] ?? parts[1]]];
  if (parts[1] === "buyers" && parts[2]) out.push([path, "Buyer record"]);
  if (parts[1] === "listings" && parts[2]) out.push([path, parts[2] === "new" ? "New listing" : parts[3] === "report" ? "Seller report" : "Edit listing"]);
  return out;
}

function Nav({ counts }: { counts: Record<string, number> }) {
  const path = usePathname(); const { setOpenMobile, isMobile } = useSidebar();
  return <>{groups.map(([g, items]) => <SidebarGroup key={g}><SidebarGroupLabel>{g}</SidebarGroupLabel><SidebarMenu>{items.map(([h, l, I]) => { const on = h === "/admin" ? path === h : path.startsWith(h); const n = counts[h] ?? 0; return <SidebarMenuItem key={h}><SidebarMenuButton asChild isActive={on} tooltip={n ? `${l} (${n})` : l} className="data-[active=true]:font-semibold [&>svg]:data-[active=true]:text-brand"><Link href={h} aria-current={on ? "page" : undefined} onClick={() => isMobile && setOpenMobile(false)}><I />{<span>{l}</span>}</Link></SidebarMenuButton>{n > 0 && <SidebarMenuBadge className="num rounded bg-brand px-1.5 text-brand-foreground peer-hover/menu-button:text-brand-foreground peer-data-[active=true]/menu-button:text-brand-foreground">{n}</SidebarMenuBadge>}</SidebarMenuItem>; })}</SidebarMenu></SidebarGroup>)}</>;
}
function User({ email }: { email: string }) {
  const { isMobile } = useSidebar();
  const who = <><Avatar className="size-8 rounded-lg"><AvatarFallback className="rounded-lg bg-brand font-semibold text-brand-foreground">WR</AvatarFallback></Avatar><div className="grid flex-1 text-left text-sm leading-tight"><span className="truncate font-medium">Advisor</span><span className="truncate text-xs text-muted-foreground">{email}</span></div></>;
  return <SidebarMenu><SidebarMenuItem><DropdownMenu><DropdownMenuTrigger asChild><SidebarMenuButton id="user-menu" size="lg" className="data-[state=open]:bg-sidebar-accent">{who}<ChevronsUpDown className="ml-auto size-4" /></SidebarMenuButton></DropdownMenuTrigger>
    <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg" side={isMobile ? "bottom" : "right"} align="end" sideOffset={4}><DropdownMenuLabel className="p-0 font-normal"><div className="flex items-center gap-2 px-1 py-1.5">{who}</div></DropdownMenuLabel><DropdownMenuSeparator />
      <DropdownMenuItem asChild><Link href="/" target="_blank"><ExternalLink />View public site</Link></DropdownMenuItem><DropdownMenuItem asChild><Link href="/admin/integrations"><Plug />Connections</Link></DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem id="sign-out" onSelect={signOut}><LogOut />Sign out</DropdownMenuItem></DropdownMenuContent></DropdownMenu></SidebarMenuItem></SidebarMenu>;
}

export function Shell({ review, inbox, funds, tasks, notes, email, open, children }: { review: number; inbox: number; funds: number; tasks: number; notes: Note[]; email: string; open: boolean; children: React.ReactNode }) {
  const path = usePathname(); const c = crumbs(path);
  const counts = { "/admin/pipeline": review, "/admin/inbox": inbox, "/admin/funds": funds, "/admin/tasks": tasks };
  return (
    <SidebarProvider defaultOpen={open}>
      <Sidebar collapsible="icon" className="print:hidden">
        <SidebarHeader><SidebarMenu><SidebarMenuItem><SidebarMenuButton size="lg" asChild tooltip="Westbound Road"><Link href="/admin"><span className="grid aspect-square size-8 place-items-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"><span aria-hidden className="flex gap-[2px]"><i className="block h-[3px] w-[7px] bg-current" /><i className="block h-[3px] w-[7px] bg-current" /></span></span><span className="grid flex-1 text-left text-sm leading-tight"><span className="truncate font-semibold">Westbound Road</span><span className="truncate text-xs text-muted-foreground">Advisor desk</span></span></Link></SidebarMenuButton></SidebarMenuItem></SidebarMenu></SidebarHeader>
        <SidebarContent><Nav counts={counts} /></SidebarContent>
        <SidebarFooter><User email={email} /></SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset className="min-w-0">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-background/90 px-3 backdrop-blur transition-[width,height] ease-linear print:hidden md:px-4 group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <SidebarTrigger id="sidebar-toggle" className="-ml-1 size-9" />
          <Separator orientation="vertical" className="mr-1 data-[orientation=vertical]:h-4" />
          <Breadcrumb className="min-w-0 flex-1"><BreadcrumbList className="flex-nowrap">{c.map(([h, l], i) => <span key={h} className="contents">{i > 0 && <BreadcrumbSeparator className="hidden sm:block" />}<BreadcrumbItem className={i < c.length - 1 ? "hidden sm:inline-flex" : "min-w-0"}>{i < c.length - 1 ? <BreadcrumbLink asChild><Link href={h}>{l}</Link></BreadcrumbLink> : <BreadcrumbPage className="truncate font-medium">{l}</BreadcrumbPage>}</BreadcrumbItem></span>)}</BreadcrumbList></Breadcrumb>
          <div className="flex items-center gap-0.5 md:gap-1"><Search /><Notifications notes={notes} /><ThemeToggle /></div>
        </header>
        <main className="min-w-0 flex-1 px-4 pb-24 pt-5 md:px-6 md:pb-10 md:pt-7 lg:px-8"><div className="mx-auto max-w-[1320px]">{children}</div></main>
      </SidebarInset>
    </SidebarProvider>
  );
}
export function PageTitle({ title, sub, children }: { title: string; sub?: string; children?: React.ReactNode }) {
  return <div className="mb-5 flex flex-wrap items-end justify-between gap-3 md:mb-7"><div className="min-w-0"><h1 className="text-2xl font-semibold leading-tight md:text-[28px]">{title}</h1>{sub && <p className="mt-1 text-muted-foreground">{sub}</p>}</div>{children}</div>;
}
export function Card({ title, sub, action, children, className = "" }: { title?: string; sub?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return <section className={`min-w-0 rounded-xl border bg-card p-4 md:p-5 ${className}`}>{title && <div className="mb-4 flex items-start justify-between gap-3"><div><h2 className="text-[15px] font-semibold tracking-tight">{title}</h2>{sub && <p className="text-[13px] text-muted-foreground">{sub}</p>}</div>{action}</div>}{children}</section>;
}
export function Empty({ title, text }: { title: string; text: string }) { return <div className="rounded-lg border border-dashed p-7 text-center"><p className="font-semibold">{title}</p><p className="mt-1 text-sm text-muted-foreground">{text}</p></div>; }
export function StagePill({ stage, label }: { stage: string; label: string }) { return <span className={`inline-block rounded-md border px-2 py-0.5 text-xs font-medium ${stage === "review" ? "border-brand bg-brand text-brand-foreground" : stage === "call" || stage === "cim" ? "border-foreground/40" : "text-muted-foreground"}`}>{label}</span>; }

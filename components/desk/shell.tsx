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
  return <>{groups.map(([g, items]) => <SidebarGroup key={g}><SidebarGroupLabel>{g}</SidebarGroupLabel><SidebarMenu>{items.map(([h, l, I]) => { const on = h === "/admin" ? path === h : path.startsWith(h); const n = counts[h] ?? 0; return <SidebarMenuItem key={h}><SidebarMenuButton asChild isActive={on} tooltip={n ? `${l} (${n})` : l} className="h-9 rounded-lg data-[active=true]:bg-sidebar-accent data-[active=true]:font-semibold data-[active=true]:shadow-[inset_0_0_0_1px_var(--line-2)] [&>svg]:data-[active=true]:text-c-orange"><Link href={h} aria-current={on ? "page" : undefined} onClick={() => isMobile && setOpenMobile(false)}><I />{<span>{l}</span>}</Link></SidebarMenuButton>{n > 0 && <SidebarMenuBadge className="num top-2 rounded-md border border-[color-mix(in_oklch,var(--c-orange)_45%,transparent)] bg-[color-mix(in_oklch,var(--c-orange)_18%,transparent)] px-1.5 text-c-orange peer-hover/menu-button:text-c-orange peer-data-[active=true]/menu-button:text-c-orange">{n}</SidebarMenuBadge>}</SidebarMenuItem>; })}</SidebarMenu></SidebarGroup>)}</>;
}
function User({ email }: { email: string }) {
  const { isMobile } = useSidebar();
  const who = <><span className="relative"><Avatar className="size-8 rounded-full"><AvatarFallback className="grad-av rounded-full text-[12px] font-bold">WR</AvatarFallback></Avatar><i className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-sidebar bg-c-green" /></span><div className="grid flex-1 text-left text-sm leading-tight"><span className="truncate font-medium">Advisor</span><span className="truncate text-xs text-muted-foreground">{email}</span></div></>;
  return <SidebarMenu><SidebarMenuItem><DropdownMenu><DropdownMenuTrigger asChild><SidebarMenuButton id="user-menu" size="lg" className="data-[state=open]:bg-sidebar-accent">{who}<ChevronsUpDown className="ml-auto size-4" /></SidebarMenuButton></DropdownMenuTrigger>
    <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg" side={isMobile ? "bottom" : "right"} align="end" sideOffset={4}><DropdownMenuLabel className="p-0 font-normal"><div className="flex items-center gap-2 px-1 py-1.5">{who}</div></DropdownMenuLabel><DropdownMenuSeparator />
      <DropdownMenuItem asChild><Link href="/" target="_blank"><ExternalLink />View public site</Link></DropdownMenuItem><DropdownMenuItem asChild><Link href="/admin/integrations"><Plug />Connections</Link></DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem id="sign-out" onSelect={signOut}><LogOut />Sign out</DropdownMenuItem></DropdownMenuContent></DropdownMenu></SidebarMenuItem></SidebarMenu>;
}

export function Shell({ review, inbox, funds, tasks, notes, email, open, ready, children }: { review: number; inbox: number; funds: number; tasks: number; notes: Note[]; email: string; open: boolean; ready: [number, number]; children: React.ReactNode }) {
  const path = usePathname(); const c = crumbs(path);
  const counts = { "/admin/pipeline": review, "/admin/inbox": inbox, "/admin/funds": funds, "/admin/tasks": tasks };
  return (
    <SidebarProvider defaultOpen={open}>
      <Sidebar collapsible="icon" className="print:hidden">
        <SidebarHeader><SidebarMenu><SidebarMenuItem><SidebarMenuButton size="lg" asChild tooltip="Westbound Road"><Link href="/admin"><span className="grid aspect-square size-8 place-items-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"><span aria-hidden className="flex gap-[2px]"><i className="block h-[3px] w-[7px] bg-current" /><i className="block h-[3px] w-[7px] bg-current" /></span></span><span className="grid flex-1 text-left text-sm leading-tight"><span className="truncate font-semibold">Westbound Road</span><span className="truncate text-xs text-muted-foreground">Advisor desk</span></span></Link></SidebarMenuButton></SidebarMenuItem></SidebarMenu></SidebarHeader>
        <SidebarContent><Nav counts={counts} /></SidebarContent>
        <SidebarFooter><Link href="/admin/integrations" className="mb-1 block rounded-xl border bg-sidebar-accent/40 p-3 transition-colors hover:border-foreground/25 group-data-[collapsible=icon]:hidden"><span className="flex items-center justify-between text-[13px]"><span className="text-muted-foreground">Launch readiness</span><span className="num font-medium">{ready[0]} <span className="text-muted-foreground">/ {ready[1]}</span></span></span><span className="mt-2.5 block h-1.5 overflow-hidden rounded-full bg-muted"><i className="grad-bar block h-full rounded-full" style={{ width: `${(ready[0] / ready[1]) * 100}%` }} /></span><span className="mt-2.5 flex justify-between text-xs text-muted-foreground"><span>{ready[1] - ready[0]} steps left</span><span className="text-foreground">Finish setup ↗</span></span></Link><User email={email} /></SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset className="min-w-0">
        <header className="sticky top-0 z-30 flex h-[60px] shrink-0 items-center gap-2 border-b bg-background/90 px-3 backdrop-blur transition-[width,height] ease-linear print:hidden md:px-4 group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <SidebarTrigger id="sidebar-toggle" className="-ml-1 size-9" />
          <Separator orientation="vertical" className="mr-1 data-[orientation=vertical]:h-4" />
          <Breadcrumb className="min-w-0 flex-1"><BreadcrumbList className="flex-nowrap">{c.map(([h, l], i) => <span key={h} className="contents">{i > 0 && <BreadcrumbSeparator className="hidden sm:block" />}<BreadcrumbItem className={i < c.length - 1 ? "hidden sm:inline-flex" : "min-w-0"}>{i < c.length - 1 ? <BreadcrumbLink asChild><Link href={h}>{l}</Link></BreadcrumbLink> : <BreadcrumbPage className="truncate font-medium">{l}</BreadcrumbPage>}</BreadcrumbItem></span>)}</BreadcrumbList></Breadcrumb>
          <div className="flex items-center gap-0.5 md:gap-1"><Search /><Notifications notes={notes} /><ThemeToggle /><Separator orientation="vertical" className="mx-1.5 hidden data-[orientation=vertical]:h-5 sm:block" /><Link href="/admin/integrations" aria-label="Account and connections" className="hidden sm:block"><span className="grad-av grid size-8 place-items-center rounded-full text-[12px] font-bold">WR</span></Link></div>
        </header>
        <main className="min-w-0 flex-1 px-4 pb-24 pt-5 md:px-6 md:pb-10 md:pt-7 lg:px-8"><div className="mx-auto max-w-[1320px]">{children}</div></main>
      </SidebarInset>
    </SidebarProvider>
  );
}
export { Card, PageTitle, Empty, StagePill } from "./panel";

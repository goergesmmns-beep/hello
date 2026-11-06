"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Bookmark, BriefcaseBusiness, ChevronDown, ChevronsUpDown, ExternalLink, FilePlus2, FileSignature, LayoutDashboard, LogOut, Search, Store, UserRound, type LucideIcon } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarRail, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/desk/theme";

const item = "h-9 gap-2.5 rounded-lg px-2.5 text-[14px] text-sidebar-foreground/65 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-foreground data-[active=true]:shadow-[inset_0_0_0_1px_var(--line-2)] [&>svg]:size-[17px]";
const tile = (bg: string) => `grid size-[22px] shrink-0 place-items-center rounded-md text-white shadow-[inset_0_1px_0_rgba(255,255,255,.25)] [&>svg]:!size-[13px] ${bg}`;
function L({ h, l, I, n, tileBg, exact }: { h: string; l: string; I: LucideIcon; n?: number; tileBg?: string; exact?: boolean }) {
  const p = usePathname(); const { isMobile, setOpenMobile } = useSidebar(); const on = exact ? p === h : p === h || p.startsWith(h + "/");
  return <SidebarMenuItem><SidebarMenuButton asChild isActive={on} tooltip={l} className={item}><Link href={h} onClick={() => isMobile && setOpenMobile(false)}>{tileBg ? <span className={tile(tileBg)}><I /></span> : <I />}<span>{l}</span></Link></SidebarMenuButton>{!!n && <SidebarMenuBadge className="num !top-1/2 h-5 -translate-y-1/2 rounded-md border border-sidebar-border bg-sidebar px-1.5 text-[11px] text-sidebar-foreground/70">{n}</SidebarMenuBadge>}</SidebarMenuItem>;
}
function G({ label, children }: { label: string; children: React.ReactNode }) {
  const { state } = useSidebar(); const [open, setOpen] = useState(true);
  return <Collapsible open={open || state === "collapsed"} onOpenChange={setOpen} className="group/coll"><SidebarGroup className="py-1"><SidebarGroupLabel asChild className="h-8 px-2.5 text-[13px] font-medium text-sidebar-foreground/50"><CollapsibleTrigger className="flex w-fit cursor-pointer items-center gap-1.5 hover:text-sidebar-foreground">{label}<ChevronDown size={14} className="transition-transform group-data-[state=closed]/coll:-rotate-90" /></CollapsibleTrigger></SidebarGroupLabel><CollapsibleContent><SidebarMenu className="gap-0.5">{children}</SidebarMenu></CollapsibleContent></SidebarGroup></Collapsible>;
}
const titles: [RegExp, string][] = [[/^\/account$/, "Overview"], [/deals/, "My deals"], [/saved/, "Saved"], [/profile/, "Profile"], [/ndas/, "Signed NDAs"], [/sell\/new/, "List a business"], [/sell\/./, "Listing"], [/sell/, "My listings"], [/welcome/, "Welcome"]];
export function AccountShell({ user, counts, children }: { user: { name: string; email: string; photo?: string; seller: boolean }; counts: { deals: number; saved: number; listings: number }; children: React.ReactNode }) {
  const p = usePathname(); const title = titles.find(([r]) => r.test(p))?.[1] ?? "Account";
  const initials = user.name.split(" ").map((x) => x[0]).slice(0, 2).join("").toUpperCase();
  const av = user.photo ? <img src={user.photo} alt="" className="size-9 shrink-0 rounded-lg object-cover" referrerPolicy="no-referrer" /> : <span className="grad-av grid size-9 shrink-0 place-items-center rounded-lg text-[12px] font-bold">{initials}</span>;
  return <SidebarProvider>
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-3 pb-2 pt-3.5 group-data-[collapsible=icon]:px-2"><div className="flex items-center justify-between gap-2"><Link href="/" className="flex min-w-0 items-center gap-2.5"><span aria-hidden className="grid size-8 shrink-0 place-items-center rounded-lg border border-sidebar-border bg-sidebar-accent"><span className="flex gap-[2px]"><i className="block h-[3px] w-[7px] rounded-full bg-c-orange" /><i className="block h-[3px] w-[7px] rounded-full bg-sidebar-foreground" /></span></span><span className="truncate text-[16px] font-semibold tracking-tight group-data-[collapsible=icon]:hidden">Westbound Road</span></Link><SidebarTrigger className="size-7 shrink-0 rounded-md border border-sidebar-border bg-sidebar-accent/60 group-data-[collapsible=icon]:hidden [&>svg]:size-3.5" /></div></SidebarHeader>
      <SidebarContent className="gap-0 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <SidebarGroup className="pb-1 pt-2"><SidebarMenu className="gap-0.5"><L h="/account" l="Overview" I={LayoutDashboard} exact /><L h="/buy" l="Browse listings" I={Search} /></SidebarMenu></SidebarGroup>
        <G label="Buying"><L h="/account/deals" l="My deals" I={BriefcaseBusiness} n={counts.deals} tileBg="bg-[oklch(0.62_0.17_250)]" /><L h="/account/saved" l="Saved" I={Bookmark} n={counts.saved} tileBg="bg-[oklch(0.68_0.19_48)]" /><L h="/account/ndas" l="Signed NDAs" I={FileSignature} tileBg="bg-[oklch(0.62_0.16_150)]" /></G>
        <G label="Selling"><L h="/account/sell" l="My listings" I={Store} n={counts.listings} tileBg="bg-[oklch(0.58_0.17_295)]" exact /><L h="/account/sell/new" l="List a business" I={FilePlus2} /></G>
        <G label="Account"><L h="/account/profile" l="Profile" I={UserRound} /></G>
      </SidebarContent>
      <SidebarFooter className="px-2 pb-3"><DropdownMenu><DropdownMenuTrigger asChild><button id="account-menu" type="button" className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl border border-sidebar-border bg-sidebar-accent/50 p-2 text-left outline-none hover:bg-sidebar-accent group-data-[collapsible=icon]:border-0 group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-0">{av}<span className="grid min-w-0 flex-1 leading-tight group-data-[collapsible=icon]:hidden"><span className="truncate text-[14px] font-medium">{user.name}</span><span className="truncate text-xs text-sidebar-foreground/55">{user.email}</span></span><ChevronsUpDown className="size-4 text-sidebar-foreground/50 group-data-[collapsible=icon]:hidden" /></button></DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-60 rounded-xl" side="top" align="end" sideOffset={8}><DropdownMenuLabel className="font-normal"><b className="block">{user.name}</b><span className="text-xs text-muted-foreground">{user.email}</span></DropdownMenuLabel><DropdownMenuSeparator /><DropdownMenuItem asChild><Link href="/account/profile"><UserRound />Profile</Link></DropdownMenuItem><DropdownMenuItem asChild><Link href="/"><ExternalLink />Westbound Road site</Link></DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem id="account-signout" onSelect={async () => { await fetch("/api/auth/logout", { method: "POST" }); window.location.assign("/"); }}><LogOut />Sign out</DropdownMenuItem></DropdownMenuContent></DropdownMenu></SidebarFooter>
      <SidebarRail />
    </Sidebar>
    <SidebarInset className="min-w-0">
      <header className="sticky top-0 z-30 flex h-[60px] items-center gap-2 border-b bg-background/90 px-3 backdrop-blur md:px-5"><SidebarTrigger className="-ml-1 size-9 md:hidden group-has-data-[collapsible=icon]/sidebar-wrapper:md:inline-flex" /><Separator orientation="vertical" className="mr-1 data-[orientation=vertical]:h-4 md:hidden" /><span className="text-sm text-muted-foreground">Account</span><span className="text-sm text-muted-foreground">/</span><span className="truncate text-sm font-medium">{title}</span><div className="ml-auto flex items-center gap-1"><Link href="/buy" className="tbtn hidden sm:inline-flex"><Search size={15} />Browse</Link><Link href="/account/sell/new" className="btn btn-brand mx-1 hidden !min-h-9 !rounded-[10px] !px-3.5 !text-[13.5px] md:inline-flex">+ List a business</Link><ThemeToggle /></div></header>
      <main className="min-w-0 flex-1 px-4 pb-20 pt-6 md:px-6 lg:px-8"><div className="mx-auto max-w-[1180px]">{children}</div></main>
    </SidebarInset>
  </SidebarProvider>;
}

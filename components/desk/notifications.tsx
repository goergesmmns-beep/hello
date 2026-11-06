"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell, CheckSquare, HelpCircle, Inbox, Landmark, Handshake, UserCheck } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export type Note = { id: string; kind: "review" | "funds" | "question" | "task" | "inbox" | "offer"; title: string; sub: string; at: string; href: string };
const icons = { review: UserCheck, funds: Landmark, question: HelpCircle, task: CheckSquare, inbox: Inbox, offer: Handshake };
const KEY = "desk_seen";
const ago = (iso: string) => { const m = Math.max(0, (Date.now() - new Date(iso).getTime()) / 6e4); return m < 60 ? `${Math.round(m)}m` : m < 1440 ? `${Math.round(m / 60)}h` : `${Math.round(m / 1440)}d`; };
export function Notifications({ notes }: { notes: Note[] }) {
  const [seen, setSeen] = useState<string>("");
  useEffect(() => { try { setSeen(localStorage.getItem(KEY) ?? ""); } catch {} }, []);
  const fresh = notes.filter((n) => n.at > seen).length;
  const mark = () => { const now = new Date().toISOString(); setSeen(now); try { localStorage.setItem(KEY, now); } catch {} };
  return <DropdownMenu onOpenChange={(o) => { if (!o) mark(); }}>
    <DropdownMenuTrigger asChild><button id="notifications" type="button" aria-label={`Notifications${fresh ? `, ${fresh} new` : ""}`} className="relative grid size-9 cursor-pointer place-items-center rounded-md text-muted-foreground outline-none hover:bg-accent hover:text-foreground data-[state=open]:bg-accent"><Bell size={18} />{fresh > 0 && <span className="num absolute right-0.5 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-brand px-1 text-[10px] font-semibold text-brand-foreground">{fresh > 9 ? "9+" : fresh}</span>}</button></DropdownMenuTrigger>
    <DropdownMenuContent align="end" sideOffset={8} className="w-[min(380px,calc(100vw-24px))] p-0">
      <DropdownMenuLabel className="flex items-center justify-between px-4 py-3"><span className="text-sm font-semibold">Needs attention</span>{notes.length > 0 && <span className="num text-xs font-normal text-muted-foreground">{notes.length}</span>}</DropdownMenuLabel>
      <DropdownMenuSeparator className="m-0" />
      <div className="max-h-[min(70vh,440px)] overflow-y-auto p-1">{notes.length ? notes.map((n) => { const I = icons[n.kind]; return <DropdownMenuItem key={n.id} asChild className="cursor-pointer items-start gap-3 rounded-md px-3 py-2.5"><Link href={n.href}><span className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-full ${n.at > seen ? "bg-brand text-brand-foreground" : "bg-muted text-muted-foreground"}`}><I size={14} /></span><span className="min-w-0 flex-1"><span className="block text-sm font-medium leading-snug">{n.title}</span><span className="block truncate text-xs text-muted-foreground">{n.sub}</span></span><span className="num shrink-0 text-[11px] text-muted-foreground">{ago(n.at)}</span></Link></DropdownMenuItem>; }) : <p className="px-4 py-8 text-center text-sm text-muted-foreground">You are all caught up.</p>}</div>
    </DropdownMenuContent>
  </DropdownMenu>;
}

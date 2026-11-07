"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { DragDropContext, Draggable, Droppable, type DropResult } from "@hello-pangea/dnd";
import { ArrowDown, ArrowUp, ArrowUpRight, BadgeCheck, CircleHelp, Clock, Eye, EyeOff, FileSignature, GripVertical, Handshake, Landmark, ListChecks, Lock, MoreHorizontal, Plus, RotateCcw, Search, SlidersHorizontal, Trash2, Workflow, X } from "lucide-react";
import { categoryIcon } from "@/components/listing-card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { PipeStage } from "@/lib/pipeline";

export type PCard = {
  id: string; name: string; company?: string; col: string; rank: number; updatedAt: string;
  listing: string; slug: string; category: string; ask: number | null; route?: string; routeKey?: string; source: string;
  nda: boolean; funds?: { s: "ok" | "wait" | "more"; usd?: number }; offer?: { usd: number; status: string };
  since: string; tasks: number; overdue: boolean; questions: number; views: number;
};
const COLORS = ["#8b8b94", "#3b82f6", "#6366f1", "#a855f7", "#ec4899", "#ef4444", "#f97316", "#eab308", "#22c55e", "#14b8a6"];
const short = (n: number) => n >= 1e6 ? `$${(n / 1e6).toFixed(n >= 1e7 ? 0 : 1).replace(/\.0$/, "")}M` : n >= 1e3 ? `$${Math.round(n / 1e3)}K` : `$${n}`;
const days = (iso: string) => { const d = Math.floor((Date.now() - new Date(iso).getTime()) / 864e5); return d < 1 ? "Today" : `${d}d`; };
const initials = (n: string) => n.split(" ").map((x) => x[0]).slice(0, 2).join("").toUpperCase();
const routes = [["all", "All"], ["own", "Own capital"], ["financing", "Financing"], ["company", "Strategic"], ["letter", "Lender letter"]] as const;

/** Drag-and-drop pipeline. Cards make room as you drag, columns are the advisor's to rename and reorder. */
export function PipelineBoard({ stages: initialStages, cards: initialCards, listings }: { stages: PipeStage[]; cards: PCard[]; listings: { slug: string; title: string }[] }) {
  const router = useRouter();
  const [stages, setStages] = useState(initialStages); const [cards, setCards] = useState(initialCards);
  useEffect(() => setCards(initialCards), [initialCards]); useEffect(() => setStages(initialStages), [initialStages]);
  const [mounted, setMounted] = useState(false); useEffect(() => setMounted(true), []);
  const [q, setQ] = useState(""); const [listing, setListing] = useState("all"); const [route, setRoute] = useState("all");
  const [mobile, setMobile] = useState(initialStages[0]?.id ?? "inquiry"); const [editing, setEditing] = useState(false);
  const [toast, setToast] = useState<{ text: string; bad?: boolean } | null>(null); const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const say = (text: string, bad = false) => { setToast({ text, bad }); clearTimeout(timer.current); timer.current = setTimeout(() => setToast(null), bad ? 6000 : 2600); };

  const visible = stages.filter((s) => !s.hidden); const hidden = stages.filter((s) => s.hidden);
  const match = (c: PCard) => (listing === "all" || c.slug === listing) && (route === "all" || c.routeKey === route) && (!q.trim() || `${c.name} ${c.company ?? ""} ${c.listing}`.toLowerCase().includes(q.trim().toLowerCase()));
  const byCol = useMemo(() => { const m: Record<string, PCard[]> = {}; for (const s of stages) m[s.id] = []; for (const c of cards) (m[c.col] ??= []).push(c); return m; }, [cards, stages]);
  const shown = cards.filter(match);
  const metrics = [
    ["Active buyers", String(shown.length)],
    ["Waiting on you", String(shown.filter((c) => c.col === "review").length)],
    ["Offers on the table", short(shown.reduce((s, c) => s + (c.offer && c.offer.status !== "Declined" ? c.offer.usd : 0), 0))],
    ["Verified buying power", short(shown.reduce((s, c) => s + (c.funds?.s === "ok" ? c.funds.usd ?? 0 : 0), 0))],
  ];

  const onDragEnd = async (r: DropResult) => {
    const { source, destination, draggableId } = r; if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;
    const prev = cards; const from = source.droppableId, to = destination.droppableId;
    const fromList = byCol[from].filter(match); const toList = from === to ? fromList : byCol[to].filter(match);
    const moved = fromList[source.index]; if (!moved) return;
    const nextTo = toList.filter((c) => c.id !== moved.id); nextTo.splice(destination.index, 0, { ...moved, col: to });
    const order = nextTo.map((c) => c.id);
    // Rebuild the card list: the target column in its new order, everything else as it was.
    setCards((all) => { const rest = all.filter((c) => c.col !== to && c.id !== moved.id); const others = all.filter((c) => c.col === to && !order.includes(c.id)); return [...rest, ...nextTo.map((c, i) => ({ ...c, col: to, rank: i, since: c.id === moved.id && from !== to ? new Date().toISOString() : c.since })), ...others]; });
    const res = await fetch("/api/admin/pipeline", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(from === to ? { action: "order", ids: order } : { action: "move", id: moved.id, to, order }) });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) { setCards(prev); say(d.error ?? "That move did not save.", true); return; }
    if (from !== to) { const label = stages.find((s) => s.id === to)?.label; say(`${moved.name} moved to ${label}${to === "cim" ? ". Deal room opened and emailed." : to === "warm" ? ". Buyer emailed." : "."}`); router.refresh(); }
  };
  const hide = async (id: string, on: boolean) => { const next = stages.map((s) => (s.id === id ? { ...s, hidden: on } : s)); setStages(next); await saveStages(next); };
  const saveStages = async (list: PipeStage[] | null) => { const r = await fetch("/api/admin/pipeline", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "stages", stages: list, reset: !list }) }); const d = await r.json().catch(() => ({})); if (r.ok) { setStages(d.stages); router.refresh(); return true; } say(d.error ?? "Stages did not save.", true); return false; };

  const column = (s: PipeStage) => {
    const list = (byCol[s.id] ?? []).filter(match); const value = list.reduce((t, c) => t + (c.offer?.usd ?? 0), 0); const hot = s.id === "review" && list.length > 0;
    return <section key={s.id} aria-label={s.label} className={`panel w-full shrink-0 sm:w-[316px] ${mobile === s.id ? "flex" : "hidden lg:flex"} ${hot ? "!border-c-orange/50" : ""}`}>
      <div className="panel-head !min-h-[52px] !pr-2">
        <i className="size-2.5 shrink-0 rounded-full shadow-[0_0_0_3px_color-mix(in_oklch,var(--c)_22%,transparent)]" style={{ background: s.color, ["--c" as string]: s.color }} />
        <h2 className="min-w-0 truncate !text-[14.5px]" title={s.description}>{s.label}</h2>
        <span className="num rounded-md border bg-surface-2 px-1.5 text-[11.5px] leading-5 text-muted-foreground">{list.length}</span>
        {s.system ? <Lock size={12} className="text-muted-foreground/60" aria-label="Follows the buyer's steps" /> : null}
        <span className="ml-auto" />{value > 0 && <span className="num text-[12.5px] font-medium text-muted-foreground">{short(value)}</span>}
        <DropdownMenu><DropdownMenuTrigger asChild><button type="button" aria-label={`${s.label} options`} className="grid size-7 cursor-pointer place-items-center rounded-lg text-muted-foreground hover:bg-surface-2 hover:text-foreground"><MoreHorizontal size={16} /></button></DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl"><DropdownMenuLabel className="text-xs font-normal text-muted-foreground">{s.description || (s.system ? "Follows the buyer's own steps." : "Your own stage.")}</DropdownMenuLabel><DropdownMenuSeparator /><DropdownMenuItem onSelect={() => setEditing(true)}><SlidersHorizontal />Rename or recolour</DropdownMenuItem><DropdownMenuItem onSelect={() => hide(s.id, true)}><EyeOff />Hide column</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
      </div>
      <Droppable droppableId={s.id}>{(drop, snap) =>
        <div ref={drop.innerRef} {...drop.droppableProps} className="well !p-2 flex min-h-[180px] flex-col gap-2 overflow-y-auto transition-[background,box-shadow] duration-200 [scrollbar-width:thin] lg:max-h-[calc(100dvh-330px)]" style={snap.isDraggingOver ? { boxShadow: `inset 0 0 0 1.5px ${s.color}`, background: `color-mix(in oklch, ${s.color} 7%, var(--surface-2))` } : undefined}>
          {list.map((c, i) => <Draggable key={c.id} draggableId={c.id} index={i}>{(p, ds) =>
            <div ref={p.innerRef} {...p.draggableProps} {...p.dragHandleProps} style={p.draggableProps.style} data-card={c.id} className="outline-none">
              <Card c={c} color={s.color} dragging={ds.isDragging} />
            </div>}</Draggable>)}
          {drop.placeholder}
          {list.length === 0 && !snap.isDraggingOver && <div className="grid flex-1 place-items-center rounded-xl border border-dashed p-6 text-center text-[13px] text-muted-foreground">{s.system ? "Buyers land here on their own" : "Drag a buyer here"}</div>}
        </div>}
      </Droppable>
    </section>;
  };

  return <div className="space-y-5">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-[26px] font-semibold tracking-tight md:text-[30px]">Pipeline</h1><p className="mt-1 text-muted-foreground">Drag buyers between stages. Moving into a locked stage runs the real step for that buyer.</p></div>
      <button id="edit-stages" type="button" onClick={() => setEditing(true)} className="tbtn !h-10"><Workflow size={16} />Customize stages</button></div>

    <section className="panel"><div className="well !p-3 flex flex-col gap-3 xl:flex-row xl:items-center">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4 xl:flex xl:shrink-0 xl:gap-0 xl:divide-x">{metrics.map(([k, v]) => <div key={k} className="xl:px-5 xl:first:pl-2"><dt className="text-xs text-muted-foreground">{k}</dt><dd className="num mt-0.5 text-[22px] font-semibold leading-none">{v}</dd></div>)}</dl>
      <div className="flex flex-1 flex-wrap items-center gap-2 xl:justify-end">
        <label className="relative min-w-[180px] flex-1 xl:max-w-[240px]"><span className="sr-only">Search buyers</span><Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><input id="pipe-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search buyers" className="input !min-h-9 !rounded-[10px] !py-1 !pl-9 !text-[13.5px]" /></label>
        <label className="sr-only" htmlFor="pipe-listing">Listing</label><select id="pipe-listing" value={listing} onChange={(e) => setListing(e.target.value)} className="input !min-h-9 !w-auto !max-w-[220px] !rounded-[10px] !py-1 !pr-8 !text-[13.5px]"><option value="all">All listings</option>{listings.map((l) => <option key={l.slug} value={l.slug}>{l.title}</option>)}</select>
        <div className="seg hidden !h-9 md:flex" role="group" aria-label="Funding route">{routes.map(([k, l]) => <button key={k} type="button" aria-pressed={route === k} onClick={() => setRoute(k)} className="tbtn !h-7 !border-0 !px-2.5 !text-[12.5px] aria-pressed:!bg-surface-1 aria-pressed:!text-foreground aria-pressed:shadow-[inset_0_0_0_1px_var(--line-2)]">{l}</button>)}</div>
      </div>
    </div></section>

    <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] lg:hidden" role="tablist">{visible.map((s) => <button key={s.id} type="button" role="tab" aria-selected={mobile === s.id} onClick={() => setMobile(s.id)} className={`flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-medium ${mobile === s.id ? "border-transparent bg-foreground text-background" : "bg-surface-1 text-muted-foreground"}`}><i className="size-1.5 rounded-full" style={{ background: s.color }} />{s.label}<span className="num opacity-70">{(byCol[s.id] ?? []).filter(match).length}</span></button>)}</div>

    {mounted ? <DragDropContext onDragEnd={onDragEnd}>
      <div className="-mx-4 flex items-start gap-4 overflow-x-auto px-4 pb-4 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8 [scrollbar-width:thin]">
        {visible.map(column)}
        {hidden.length > 0 && <aside className="panel hidden w-52 shrink-0 lg:flex"><div className="panel-head"><EyeOff size={15} className="text-muted-foreground" /><h2 className="!text-[14px]">Hidden</h2></div><div className="well !p-2 space-y-1">{hidden.map((s) => <button key={s.id} type="button" onClick={() => hide(s.id, false)} className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[13.5px] hover:bg-surface-1"><i className="size-2 rounded-full" style={{ background: s.color }} /><span className="flex-1 truncate">{s.label}</span><span className="num text-xs text-muted-foreground">{(byCol[s.id] ?? []).length}</span><Eye size={14} className="text-muted-foreground" /></button>)}</div></aside>}
      </div>
    </DragDropContext> : <div className="h-[60vh]" />}

    <StageEditor open={editing} onOpenChange={setEditing} stages={stages} counts={Object.fromEntries(stages.map((s) => [s.id, (byCol[s.id] ?? []).length]))} onSave={saveStages} />
    {toast && <div role="status" className={`fixed bottom-5 left-1/2 z-50 flex max-w-[92vw] -translate-x-1/2 items-center gap-3 rounded-xl border px-4 py-3 text-sm shadow-2xl backdrop-blur ${toast.bad ? "border-destructive/50 bg-background/95" : "bg-background/95"}`}>{toast.bad ? <CircleHelp size={16} className="shrink-0 text-destructive" /> : <BadgeCheck size={16} className="shrink-0 text-c-green" />}<span>{toast.text}</span><button type="button" aria-label="Dismiss" onClick={() => setToast(null)} className="cursor-pointer text-muted-foreground hover:text-foreground"><X size={15} /></button></div>}
  </div>;
}

/** One buyer. Everything stays visible while it is being dragged. */
function Card({ c, color, dragging }: { c: PCard; color: string; dragging: boolean }) {
  const I = categoryIcon(c.category);
  const pill = "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11.5px] font-medium leading-4";
  return <article className={`group relative cursor-grab overflow-hidden rounded-[14px] border bg-surface-1 p-1 transition-[transform,box-shadow,border-color] duration-150 active:cursor-grabbing ${dragging ? "rotate-[1.6deg] scale-[1.03] shadow-[0_24px_48px_-12px_rgba(0,0,0,.55)]" : "shadow-[0_1px_2px_rgba(0,0,0,.08)] hover:border-foreground/25"}`} style={dragging ? { borderColor: color, boxShadow: `0 0 0 1px ${color}, 0 24px 48px -12px rgba(0,0,0,.55)` } : undefined}>
    <div className="rounded-[10px] border border-[var(--line-2)] bg-surface-2 p-3 shadow-[inset_0_1px_0_var(--hi)]">
      <div className="flex items-start gap-2.5">
        <span className="grad-av grid size-8 shrink-0 place-items-center rounded-lg text-[11px] font-bold">{initials(c.name)}</span>
        <div className="min-w-0 flex-1"><p className="truncate text-[14px] font-semibold leading-tight">{c.name}</p><p className="truncate text-[12px] text-muted-foreground">{c.company ?? c.source}</p></div>
        <GripVertical size={15} className="mt-0.5 shrink-0 text-muted-foreground/40 transition-colors group-hover:text-muted-foreground" aria-hidden />
      </div>
      <p className="mt-2.5 flex items-center gap-1.5 text-[12.5px]"><I size={13} className="shrink-0 text-muted-foreground" /><span className="truncate">{c.listing}</span></p>
      <div className="mt-2.5 flex flex-wrap gap-1">
        {c.route && <span className={`${pill} bg-surface-1 text-muted-foreground`}><Landmark size={11} />{c.route}</span>}
        {c.nda && <span className={`${pill} border-c-blue/40 bg-c-blue/10 text-c-blue`}><FileSignature size={11} />NDA</span>}
        {c.funds?.s === "ok" && <span className={`${pill} border-c-green/40 bg-c-green/10 text-c-green`}><BadgeCheck size={11} />{c.funds.usd ? short(c.funds.usd) : "Verified"}</span>}
        {c.funds?.s === "wait" && <span className={`${pill} border-c-orange/40 bg-c-orange/10 text-c-orange`}><Landmark size={11} />Funds to check</span>}
        {c.funds?.s === "more" && <span className={`${pill} border-c-orange/40 bg-c-orange/10 text-c-orange`}>More proof asked</span>}
        {c.offer && <span className={`${pill} border-c-purple/40 bg-c-purple/10 text-c-purple`}><Handshake size={11} />{short(c.offer.usd)} · {c.offer.status}</span>}
      </div>
    </div>
    <div className="flex items-center gap-3 px-2.5 pb-1 pt-2 text-[12px] text-muted-foreground">
      <span className="flex items-center gap-1" title="Time in this stage"><Clock size={12} />{days(c.since)}</span>
      {c.tasks > 0 && <span className={`flex items-center gap-1 ${c.overdue ? "text-destructive" : ""}`} title={c.overdue ? "A task is overdue" : "Open tasks"}><ListChecks size={12} />{c.tasks}</span>}
      {c.questions > 0 && <span className="flex items-center gap-1 text-c-orange" title="Unanswered questions"><CircleHelp size={12} />{c.questions}</span>}
      {c.views > 0 && <span className="flex items-center gap-1" title="Deal room visits"><Eye size={12} />{c.views}</span>}
      <Link href={`/admin/buyers/${c.id}`} onClick={(e) => e.stopPropagation()} aria-label={`Open ${c.name}`} className="ml-auto grid size-6 place-items-center rounded-md border bg-surface-2 text-muted-foreground transition-colors hover:border-c-orange hover:bg-c-orange hover:text-black"><ArrowUpRight size={13} /></Link>
    </div>
  </article>;
}

/** Rename, recolour, reorder, hide, add and remove stages. Locked stages can be renamed but not removed. */
function StageEditor({ open, onOpenChange, stages, counts, onSave }: { open: boolean; onOpenChange: (v: boolean) => void; stages: PipeStage[]; counts: Record<string, number>; onSave: (s: PipeStage[] | null) => Promise<boolean> }) {
  const [draft, setDraft] = useState(stages); const [busy, setBusy] = useState(false); const [pick, setPick] = useState("");
  useEffect(() => { if (open) setDraft(stages); }, [open, stages]);
  const set = (id: string, p: Partial<PipeStage>) => setDraft((d) => d.map((s) => (s.id === id ? { ...s, ...p } : s)));
  const move = (i: number, by: -1 | 1) => setDraft((d) => { const n = [...d]; const j = i + by; if (j < 0 || j >= n.length) return d; [n[i], n[j]] = [n[j], n[i]]; return n; });
  const removed = stages.filter((s) => !s.system && !draft.some((d) => d.id === s.id) && counts[s.id]);
  const save = async (reset = false) => { if (!reset && draft.some((s) => !s.label.trim())) return; setBusy(true); const ok = await onSave(reset ? null : draft); setBusy(false); if (ok) onOpenChange(false); };
  return <Sheet open={open} onOpenChange={onOpenChange}>
    <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-[480px]">
      <SheetHeader className="border-b p-5"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-c-orange/15 text-c-orange"><Workflow size={19} /></span><div><SheetTitle>Pipeline stages</SheetTitle><SheetDescription>Rename, recolour, reorder and hide stages, or add your own.</SheetDescription></div></div></SheetHeader>
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-4">
        {draft.map((s, i) => <div key={s.id} data-stage={s.id} className={`rounded-[14px] border bg-surface-1 p-1 ${s.hidden ? "opacity-60" : ""}`}><div className="rounded-[10px] border border-[var(--line-2)] bg-surface-2 p-2.5">
          <div className="flex items-center gap-2">
            <button type="button" aria-label="Stage colour" onClick={() => setPick(pick === s.id ? "" : s.id)} className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-lg border bg-surface-1"><i className="size-3.5 rounded-full" style={{ background: s.color }} /></button>
            <input aria-label="Stage name" value={s.label} maxLength={40} onChange={(e) => set(s.id, { label: e.target.value })} className="input !min-h-9 !rounded-lg !py-1 !text-[14px] font-medium" />
            <button type="button" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)} className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-lg text-muted-foreground hover:bg-surface-1 hover:text-foreground disabled:opacity-30"><ArrowUp size={15} /></button>
            <button type="button" aria-label="Move down" disabled={i === draft.length - 1} onClick={() => move(i, 1)} className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-lg text-muted-foreground hover:bg-surface-1 hover:text-foreground disabled:opacity-30"><ArrowDown size={15} /></button>
            <button type="button" aria-label={s.hidden ? "Show stage" : "Hide stage"} onClick={() => set(s.id, { hidden: !s.hidden })} className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-lg text-muted-foreground hover:bg-surface-1 hover:text-foreground">{s.hidden ? <EyeOff size={15} /> : <Eye size={15} />}</button>
            {s.system ? <span title="This stage follows the buyer's own steps. Rename it freely." className="grid size-8 shrink-0 place-items-center text-muted-foreground/60"><Lock size={14} /></span> : <button type="button" aria-label="Delete stage" onClick={() => setDraft((d) => d.filter((x) => x.id !== s.id))} className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 size={15} /></button>}
          </div>
          <input aria-label="Stage description" value={s.description ?? ""} maxLength={160} onChange={(e) => set(s.id, { description: e.target.value })} placeholder="What this stage means (shown on hover)" className="mt-2 w-full rounded-md bg-transparent px-1 text-[12.5px] text-muted-foreground outline-none placeholder:text-muted-foreground/50 focus:text-foreground" />
          {pick === s.id && <div className="mt-2 flex flex-wrap gap-1.5 px-1">{COLORS.map((c) => <button key={c} type="button" aria-label={`Colour ${c}`} onClick={() => { set(s.id, { color: c }); setPick(""); }} className={`size-6 cursor-pointer rounded-full border-2 transition-transform hover:scale-110 ${c === s.color ? "border-foreground" : "border-transparent"}`} style={{ background: c }} />)}</div>}
        </div></div>)}
        {draft.length < 16 && <button id="add-stage" type="button" onClick={() => setDraft((d) => { const at = Math.max(0, d.findIndex((x) => x.id === "warm")); const n = [...d]; n.splice(at === 0 ? d.length : at, 0, { id: `s${Date.now().toString(36)}`, label: "New stage", color: COLORS[d.length % COLORS.length] }); return n; })} className="flex h-11 w-full cursor-pointer items-center justify-center gap-1.5 rounded-[14px] border border-dashed text-[13.5px] font-medium text-muted-foreground hover:border-foreground/30 hover:text-foreground"><Plus size={15} />Add stage</button>}
        <p className="flex gap-2 rounded-xl border bg-surface-1 p-3 text-[12.5px] text-muted-foreground"><Lock size={13} className="mt-0.5 shrink-0" />Locked stages follow the buyer&apos;s own steps (NDA, funding, deal room), so they can be renamed and hidden but not deleted.</p>
        {removed.length > 0 && <p className="rounded-xl border border-c-orange/40 bg-c-orange/10 p-3 text-[12.5px]">Buyers in {removed.map((s) => `"${s.label}"`).join(", ")} go back to the stage their own steps put them in.</p>}
      </div>
      <div className="flex items-center gap-2 border-t p-4"><button type="button" disabled={busy} onClick={() => save(true)} className="mr-auto flex cursor-pointer items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground"><RotateCcw size={14} />Reset to default</button><button type="button" onClick={() => onOpenChange(false)} className="btn btn-ghost !min-h-9 !text-[13.5px]">Cancel</button><button id="save-stages" type="button" disabled={busy} onClick={() => save(false)} className="btn btn-brand !min-h-9 !text-[13.5px]">{busy ? "Saving…" : "Save stages"}</button></div>
    </SheetContent>
  </Sheet>;
}

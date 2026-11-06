import { Activity, BarChart3, Building2, CheckSquare, CircleDollarSign, FileSignature, FileText, Gauge, Handshake, HelpCircle, Inbox, Landmark, Layers, ListChecks, MessagesSquare, PieChart, Plug, Rocket, ScrollText, Sparkles, StickyNote, TrendingUp, UserRound, Users, Workflow, type LucideIcon } from "lucide-react";

/** Picks a fitting icon from the card title, so every card gets one without extra props. */
const auto: [RegExp, LucideIcon][] = [[/funnel|speed/i, Gauge], [/inquir|trend/i, TrendingUp], [/source|route|breakdown/i, PieChart], [/listing|deal room/i, Building2], [/task/i, CheckSquare], [/question|q&a/i, HelpCircle], [/offer/i, Handshake], [/activity|timeline/i, Activity], [/decision|review|pipeline/i, Workflow], [/fund|capital/i, Landmark], [/nda|signature/i, FileSignature], [/document|cim/i, FileText], [/note/i, StickyNote], [/profile|buyer/i, UserRound], [/readiness|launch|checklist/i, ListChecks], [/pipedrive|connection|integration/i, Plug], [/report|quality/i, BarChart3], [/inbox|message/i, Inbox], [/booking|follow/i, MessagesSquare], [/basic|publish|rule/i, Layers], [/fact|figure|financ|multiple/i, CircleDollarSign], [/description|highlight/i, ScrollText], [/team|people|member/i, Users], [/growth|grow/i, Rocket]];
export function Card({ title, sub, action, children, className = "", flush, icon }: { title?: string; sub?: string; action?: React.ReactNode; children: React.ReactNode; className?: string; flush?: boolean; icon?: LucideIcon }) {
  const I = icon ?? (title ? auto.find(([r]) => r.test(title))?.[1] ?? Sparkles : null);
  return <section className={`panel ${className}`}>
    {title && <div className="panel-head">{I && <I size={17} className="text-muted-foreground" />}<div className="min-w-0 flex-1"><h2 className="truncate">{title}{sub && <span className="ml-2 text-[13px] font-normal text-muted-foreground">· {sub}</span>}</h2></div>{action}</div>}
    <div className={`well ${flush ? "well-flush" : ""}`}>{children}</div>
  </section>;
}
export function PageTitle({ title, sub, children }: { title: string; sub?: string; children?: React.ReactNode }) {
  return <div className="mb-5 flex flex-wrap items-end justify-between gap-3 md:mb-6"><div className="min-w-0"><h1 className="text-2xl font-semibold leading-tight tracking-tight md:text-[28px]">{title}</h1>{sub && <p className="mt-1 text-muted-foreground">{sub}</p>}</div>{children && <div className="flex flex-wrap items-center gap-2">{children}</div>}</div>;
}
export function Empty({ title, text }: { title: string; text: string }) { return <div className="grid place-items-center rounded-xl border border-dashed p-8 text-center"><span className="mb-3 grid size-10 place-items-center rounded-xl border bg-surface-1"><Sparkles size={17} className="text-muted-foreground" /></span><p className="font-semibold">{title}</p><p className="mt-1 max-w-sm text-sm text-muted-foreground">{text}</p></div>; }
const stageColor: Record<string, string> = { inquiry: "var(--c-gray)", nda: "var(--c-blue)", capacity: "var(--c-purple)", review: "var(--c-orange)", cim: "var(--c-green)", call: "var(--c-green)", warm: "var(--c-gray)" };
export function StagePill({ stage, label }: { stage: string; label: string }) { return <span className="inline-flex items-center gap-1.5 rounded-full border bg-surface-1 px-2.5 py-0.5 text-xs font-medium" style={{ ["--c" as string]: stageColor[stage] }}><i className="block size-1.5 rounded-full" style={{ background: "var(--c)" }} />{label}</span>; }
export const stageColors = stageColor;

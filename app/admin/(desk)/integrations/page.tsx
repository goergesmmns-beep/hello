import { promises as fs } from "fs";
import path from "path";
import { Check, Minus } from "lucide-react";
import { Card, PageTitle } from "@/components/desk/shell";
import { PipedriveSetup } from "@/components/pipedrive-setup";
import { catalog, isOpen } from "@/lib/catalog";
import { fileIds } from "@/lib/store";
import { FollowupSettings } from "@/components/desk/followups";
import { config, pipelines, stageNames } from "@/lib/pipedrive";
import { canEmail, getFollowups } from "@/lib/reminders";

export const dynamic = "force-dynamic";
export default async function Integrations() {
  const c = await config().catch(() => null);
  const list = c ? await pipelines(c).catch(() => []) : [];
  const cims = await fs.readdir(path.join(process.cwd(), "private", "cims")).catch(() => [] as string[]);
  const open = (await catalog()).filter(isOpen); const stored = await fileIds("cim:").catch(() => [] as string[]);
  const have = open.filter((l) => cims.includes(`${l.slug}.pdf`) || stored.includes(`cim:${l.slug}`)).length;
  const checks: [string, boolean, string][] = [
    ["Database", !!process.env.DATABASE_URL, "Stores buyers, documents and settings"],
    ["Pipedrive", !!c?.pipelineId, c ? "Connected. Choose a pipeline if this is not ticked." : "Connect below"],
    ["Live email", !!process.env.RESEND_API_KEY, "Add RESEND_API_KEY, MAIL_FROM and ADVISOR_EMAIL"],
    ["Approved NDA", process.env.NDA_APPROVED === "true", "Add the approved NDA, then set NDA_APPROVED=true"],
    ["CIM files", have === open.length, `${have} of ${open.length} open listings have a real CIM`],
    ["Booking link", !!(await getFollowups()).bookingUrl, "Add your calendar link below"],
    ["Test mode off", process.env.TEST_MODE !== "true", "Remove TEST_MODE before launch"],
  ];
  return (<><PageTitle title="Connections" sub="Your launch checklist and connected accounts." />
    <Card title="Launch readiness" sub={`${checks.filter((x) => x[1]).length} of ${checks.length} complete`} className="mb-3"><ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{checks.map(([t, ok, d]) => <li key={t} className="flex gap-2.5"><span className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full ${ok ? "bg-brand text-brand-foreground" : "border text-muted-foreground"}`}>{ok ? <Check size={13} strokeWidth={3} /> : <Minus size={12} />}</span><span><b className="block text-sm font-semibold">{t}</b><span className="text-[13px] text-muted-foreground">{ok ? "Ready" : d}</span></span></li>)}</ul></Card>
    <Card title="Booking and follow-ups" className="mb-3"><FollowupSettings value={await getFollowups()} emailReady={!!process.env.RESEND_API_KEY || canEmail()} /></Card>
    <Card title="Pipedrive" sub="Every buyer becomes a person and a deal, and the deal moves as they progress. Financial documents stay here."><PipedriveSetup connected={!!c} account={c?.account} pipelineId={c?.pipelineId} stages={(c?.stages ?? {}) as Record<string, number>} pipelines={list} labels={stageNames} /></Card></>);
}

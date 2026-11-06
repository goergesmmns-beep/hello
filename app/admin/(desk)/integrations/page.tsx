import { Check, Minus } from "lucide-react";
import { Card, PageTitle } from "@/components/desk/panel";
import { PipedriveSetup } from "@/components/pipedrive-setup";
import { FollowupSettings } from "@/components/desk/followups";
import { config, pipelines, stageNames } from "@/lib/pipedrive";
import { canEmail, getFollowups } from "@/lib/reminders";
import { launchChecks } from "@/lib/launch";
import { DemoData } from "@/components/desk/demo-data";
import { allBuyers } from "@/lib/store";

export const dynamic = "force-dynamic";
export default async function Integrations() {
  const c = await config().catch(() => null);
  const list = c ? await pipelines(c).catch(() => []) : [];
  const checks = await launchChecks();
  return (<><PageTitle title="Connections" sub="Your launch checklist and connected accounts." />
    <Card title="Launch readiness" sub={`${checks.filter((x) => x[1]).length} of ${checks.length} complete`} className="mb-3"><ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{checks.map(([t, ok, d]) => <li key={t} className="flex gap-2.5"><span className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full ${ok ? "bg-brand text-brand-foreground" : "border text-muted-foreground"}`}>{ok ? <Check size={13} strokeWidth={3} /> : <Minus size={12} />}</span><span><b className="block text-sm font-semibold">{t}</b><span className="text-[13px] text-muted-foreground">{ok ? "Ready" : d}</span></span></li>)}</ul></Card>
    <Card title="Booking and follow-ups" className="mb-3"><FollowupSettings value={await getFollowups()} emailReady={!!process.env.RESEND_API_KEY || canEmail()} /></Card>
    <Card title="Pipedrive" sub="Every buyer becomes a person and a deal that moves as they progress. The signed NDA and proof of funds files are attached to the deal, and vetting results fill custom fields."><PipedriveSetup connected={!!c} account={c?.account} pipelineId={c?.pipelineId} stages={(c?.stages ?? {}) as Record<string, number>} pipelines={list} labels={stageNames} /></Card>
    <Card title="Demo data" className="mt-3"><DemoData count={(await allBuyers()).filter((b) => b.demo).length} /></Card></>);
}

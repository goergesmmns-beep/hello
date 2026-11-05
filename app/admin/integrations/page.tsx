import Link from "next/link";
import { redirect } from "next/navigation";
import { PipedriveSetup } from "@/components/pipedrive-setup";
import { isAdmin } from "@/lib/admin";
import { config, pipelines, stageNames } from "@/lib/pipedrive";

export const dynamic = "force-dynamic";
export default async function Integrations() {
  if (!(await isAdmin())) redirect("/admin/login");
  const c = await config();
  const list = c ? await pipelines(c).catch(() => []) : [];
  return (<>
    <Link href="/admin" className="text-sm underline">All buyers</Link>
    <h1 className="mb-1 mt-3 text-4xl font-semibold">Pipedrive</h1>
    <p className="mb-8 max-w-2xl text-muted-foreground">Every buyer becomes a person and a deal in your account, and the deal moves as they progress. Bank letters and financial documents stay on this site.</p>
    <PipedriveSetup connected={!!c} account={c?.account} pipelineId={c?.pipelineId} stages={(c?.stages ?? {}) as Record<string, number>} pipelines={list} labels={stageNames} />
  </>);
}

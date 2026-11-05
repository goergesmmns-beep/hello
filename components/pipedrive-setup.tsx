"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

type P = { id: number; name: string; stages: { id: number; name: string }[] };
export function PipedriveSetup({ connected, account, pipelineId, stages, pipelines, labels }: { connected: boolean; account?: string; pipelineId?: number; stages: Record<string, number>; pipelines: P[]; labels: [string, string][] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false); const [msg, setMsg] = useState(""); const [err, setErr] = useState("");
  const [chosen, setPid] = useState(0);
  const pid = chosen || pipelineId || pipelines[0]?.id || 0;
  const [map, setMap] = useState<Record<string, number>>(stages);
  const go = async (body: object, done: string) => { setBusy(true); setErr(""); setMsg(""); const r = await fetch("/api/admin/pipedrive", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); const d = await r.json().catch(() => ({})); setBusy(false); if (r.ok) { setMsg(done); router.refresh(); } else setErr(d.error ?? "That did not work."); };
  const current = pipelines.find((p) => p.id === pid);
  const note = <>{msg && <p role="status" className="text-sm font-medium">{msg}</p>}{err && <p role="alert" className="text-sm text-destructive">{err}</p>}</>;
  if (!connected) return (
    <form className="max-w-xl space-y-4" onSubmit={(e) => { e.preventDefault(); go({ action: "connect", token: new FormData(e.currentTarget).get("token") }, "Pipedrive connected."); }}>
      <ol className="list-decimal space-y-1 pl-5 text-muted-foreground"><li>In Pipedrive, open your profile menu, then Personal preferences.</li><li>Open the API tab and copy your personal API token.</li><li>Paste it here.</li></ol>
      <label className="field" htmlFor="token">Pipedrive API token<input id="token" name="token" type="password" autoComplete="off" className="input" required /></label>{note}
      <button className="btn btn-primary" disabled={busy}>Connect Pipedrive</button>
    </form>);
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-4"><p>Connected to <b>{account}</b>{pipelineId ? "" : ". Choose a pipeline below."}</p><div className="flex gap-2"><button id="pd-test" className="btn btn-ghost" disabled={busy} onClick={() => go({ action: "test" }, "Connection works.")}>Test connection</button><button id="pd-off" className="btn btn-ghost" disabled={busy} onClick={() => go({ action: "disconnect" }, "Disconnected.")}>Disconnect</button></div></div>
      {note}
      <section className="rounded-md border p-5"><h2 className="text-lg font-semibold">Recommended: use a new pipeline</h2><p className="mb-4 mt-1 text-muted-foreground">Creates a "Buyer Access" pipeline with all seven stages and maps them for you.</p><button id="pd-create" className="btn btn-primary" disabled={busy} onClick={() => go({ action: "create" }, "Buyer Access pipeline created.")}>Create Buyer Access pipeline</button></section>
      <section className="rounded-md border p-5"><h2 className="text-lg font-semibold">Or use an existing pipeline</h2>
        <label className="field mt-4 max-w-md" htmlFor="pd-pipe">Pipeline<select id="pd-pipe" className="input" value={pid} onChange={(e) => { setPid(Number(e.target.value)); setMap({}); }}>{pipelines.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">{labels.map(([k, l]) => <label key={k} className="field" htmlFor={`map-${k}`}>{l}<select id={`map-${k}`} className="input" value={map[k] ?? ""} onChange={(e) => setMap({ ...map, [k]: Number(e.target.value) })}><option value="">Do not move the deal</option>{current?.stages.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>)}</div>
        <button id="pd-save" className="btn btn-ghost mt-4" disabled={busy || !pid} onClick={() => go({ action: "map", pipelineId: pid, stages: map }, "Stage mapping saved.")}>Save mapping</button></section>
    </div>);
}

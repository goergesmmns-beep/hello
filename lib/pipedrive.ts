import type { Buyer, Stage } from "./types";
import { getListing } from "@/content/listings";
import { decrypt, encrypt } from "./secret";
import { getSetting, setSetting } from "./store";

/** Marty connects his own account at /admin/integrations. Without a connection the site still works. */
export type PdConfig = { token: string; domain: string; account: string; pipelineId?: number; stages: Partial<Record<Stage, number>> };
type Stored = Omit<PdConfig, "token"> & { tokenEnc: string };
const KEY = "pipedrive";
const root = () => process.env.PIPEDRIVE_BASE_URL?.replace(/\/$/, "");

export const stageNames: [Stage, string][] = [["inquiry", "New inquiry"], ["nda", "NDA signed"], ["capacity", "Funding check"], ["review", "Advisor review"], ["cim", "CIM open"], ["call", "Call requested"], ["warm", "Keep warm"]];

export async function config(): Promise<PdConfig | null> {
  const s = await getSetting<Stored>(KEY);
  if (!s) return null;
  const { tokenEnc, ...rest } = s;
  return { ...rest, token: decrypt(tokenEnc) };
}
async function save(c: PdConfig) {
  const { token, ...rest } = c;
  await setSetting(KEY, { ...rest, tokenEnc: encrypt(token) });
}
async function raw<T>(token: string, base: string, method: string, url: string, body?: unknown): Promise<T> {
  const res = await fetch(base + url, { method, headers: { "x-api-token": token, "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
  if (!res.ok) throw new Error(`Pipedrive ${method} ${url}: ${res.status} ${(await res.text()).slice(0, 200)}`);
  return res.json() as Promise<T>;
}
const baseOf = (c: { domain: string }) => root() ?? `https://${c.domain}.pipedrive.com`;
const call = <T = { data: Record<string, unknown> }>(c: PdConfig, method: string, url: string, body?: unknown) => raw<T>(c.token, baseOf(c), method, url, body);

export async function connect(token: string) {
  const me = await raw<{ data: { company_domain: string; name?: string; email?: string } }>(token, root() ?? "https://api.pipedrive.com", "GET", "/v1/users/me");
  const c: PdConfig = { token, domain: me.data.company_domain, account: me.data.email ?? me.data.name ?? me.data.company_domain, stages: {} };
  await save(c);
  return c;
}
export const disconnect = () => setSetting(KEY, null);
export async function pipelines(c: PdConfig) {
  const [p, s] = await Promise.all([
    call<{ data: { id: number; name: string }[] }>(c, "GET", "/api/v2/pipelines?limit=500"),
    call<{ data: { id: number; name: string; pipeline_id: number }[] }>(c, "GET", "/api/v2/stages?limit=500"),
  ]);
  return p.data.map((x) => ({ ...x, stages: s.data.filter((t) => t.pipeline_id === x.id) }));
}
/** One click: creates a Buyer Access pipeline and maps every stage to it. */
export async function createPipeline(c: PdConfig) {
  const p = await call<{ data: { id: number } }>(c, "POST", "/api/v2/pipelines", { name: "Buyer Access" });
  const stages: PdConfig["stages"] = {};
  for (const [k, name] of stageNames) {
    const st = await call<{ data: { id: number } }>(c, "POST", "/api/v2/stages", { name, pipeline_id: p.data.id });
    stages[k] = st.data.id;
  }
  await save({ ...c, pipelineId: p.data.id, stages });
}
export const saveMapping = (c: PdConfig, pipelineId: number, stages: PdConfig["stages"]) => save({ ...c, pipelineId, stages });

export async function syncBuyer(b: Buyer) {
  const c = await config();
  if (!c) return false;
  const listing = getListing(b.listingSlug);
  b.pipedrive ??= {};
  if (!b.pipedrive.personId) {
    const found = await call<{ data: { items: { item: { id: number } }[] } }>(c, "GET", `/api/v2/persons/search?term=${encodeURIComponent(b.email)}&fields=email&exact_match=true&limit=1`);
    b.pipedrive.personId = found.data.items[0]?.item.id;
  }
  if (!b.pipedrive.personId) {
    const made = await call<{ data: { id: number } }>(c, "POST", "/api/v2/persons", { name: b.name, emails: [{ value: b.email, label: "work", primary: true }], ...(b.phone ? { phones: [{ value: b.phone, label: "work", primary: true }] } : {}) });
    b.pipedrive.personId = made.data.id;
  }
  const stage_id = c.stages[b.stage];
  if (!b.pipedrive.dealId) {
    const made = await call<{ data: { id: number } }>(c, "POST", "/api/v2/deals", { title: `${b.name} · ${listing?.title ?? b.listingSlug}`, person_id: b.pipedrive.personId, ...(c.pipelineId ? { pipeline_id: c.pipelineId } : {}), ...(stage_id ? { stage_id } : {}) });
    b.pipedrive.dealId = made.data.id;
  } else if (stage_id) {
    await call(c, "PATCH", `/api/v2/deals/${b.pipedrive.dealId}`, { stage_id });
  }
  return true;
}
export async function addNote(b: Buyer, content: string) {
  const c = await config();
  if (!c || !b.pipedrive?.dealId) return;
  await call(c, "POST", "/api/v1/notes", { content, deal_id: b.pipedrive.dealId });
}
export async function syncSubmission(kind: string, f: Record<string, string>) {
  const c = await config();
  if (!c || !f.email || kind === "Newsletter") return;
  const made = await call<{ data: { id: number } }>(c, "POST", "/api/v2/persons", { name: f.name || f.email, emails: [{ value: f.email, label: "work", primary: true }] });
  const deal = await call<{ data: { id: number } }>(c, "POST", "/api/v2/deals", { title: `${kind}: ${f.company || f.name || f.email}`, person_id: made.data.id });
  await call(c, "POST", "/api/v1/notes", { content: Object.entries(f).map(([k, v]) => `${k}: ${v}`).join("<br>"), deal_id: deal.data.id });
}

import type { Buyer, Stage } from "./types";
import { readiness } from "./analytics";
import { getFile } from "./store";
import { siteUrl } from "./mail";
import { findListing } from "./catalog";
import { decrypt, encrypt } from "./secret";
import { getSetting, setSetting } from "./store";

/** Marty connects his own account at /admin/integrations. Without a connection the site still works. */
export type PdConfig = { token: string; domain: string; account: string; pipelineId?: number; stages: Partial<Record<Stage, number>>; fields?: Partial<Record<FieldKey, string>> };
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

/** Custom deal fields that carry the vetting result into Pipedrive. Created once, found by name after that. */
export const fieldDefs = [["route", "Buyer route", "varchar"], ["funds", "Proof of funds status", "varchar"], ["verified", "Verified funds (USD)", "double"], ["readiness", "Buyer readiness score", "double"], ["nda", "NDA signed on", "date"], ["offer", "Highest offer (USD)", "double"], ["profile", "Buyer LinkedIn or website", "varchar"], ["record", "Westbound buyer record", "varchar"]] as const;
type FieldKey = (typeof fieldDefs)[number][0];
async function ensureFields(c: PdConfig) {
  if (c.fields && fieldDefs.every(([k]) => c.fields![k])) return c.fields;
  const have = await call<{ data: { key: string; name: string }[] | null }>(c, "GET", "/v1/dealFields?limit=500");
  const fields: Partial<Record<FieldKey, string>> = {};
  for (const [k, name, field_type] of fieldDefs) {
    const found = (have.data ?? []).find((f) => f.name === name);
    fields[k] = found ? found.key : (await call<{ data: { key: string } }>(c, "POST", "/v1/dealFields", { name, field_type })).data.key;
  }
  await save({ ...c, fields });
  return fields;
}
const routeNames: Record<string, string> = { own: "Own capital", company: "Strategic acquirer", letter: "Lender letter", financing: "Acquisition financing" };
const fundsNames: Record<string, string> = { submitted: "Waiting for review", verified: "Verified", more: "More requested", declined: "Not sufficient" };
function vetted(b: Buyer, f: Partial<Record<FieldKey, string>>) {
  const top = Math.max(0, ...(b.offers ?? []).map((o) => o.amountUsd));
  const v: Record<FieldKey, string | number | undefined> = { route: b.route && routeNames[b.route], funds: b.funds?.status && fundsNames[b.funds.status], verified: b.funds?.verifiedUsd, readiness: readiness(b).score, nda: b.nda?.signedAt.slice(0, 10), offer: top || undefined, profile: b.linkedin || b.website, record: `${siteUrl()}/admin/buyers/${b.id}` };
  return Object.fromEntries(Object.entries(v).filter(([k, x]) => x !== undefined && x !== "" && f[k as FieldKey]).map(([k, x]) => [f[k as FieldKey]!, x]));
}
/** Attaches the signed NDA and every proof of funds document to the deal, once each. */
async function syncFiles(c: PdConfig, b: Buyer) {
  const want = [...(b.nda ? [{ id: b.nda.fileId, name: `Signed NDA - ${b.name}.pdf` }] : []), ...(b.funds?.docs ?? []).map((d) => ({ id: d.fileId, name: `Proof of funds - ${d.name}` }))];
  const done = new Set(b.pipedrive!.files ?? []);
  for (const w of want) {
    if (done.has(w.id)) continue;
    const f = await getFile(w.id);
    if (!f) continue;
    const fd = new FormData();
    fd.append("deal_id", String(b.pipedrive!.dealId));
    fd.append("file", new Blob([Buffer.from(f.bytes)], { type: f.mime }), w.name);
    const res = await fetch(`${baseOf(c)}/v1/files`, { method: "POST", headers: { "x-api-token": c.token }, body: fd });
    if (!res.ok) throw new Error(`Pipedrive file upload: ${res.status} ${(await res.text()).slice(0, 160)}`);
    done.add(w.id);
    b.pipedrive!.files = [...done];
  }
}
export async function syncBuyer(b: Buyer) {
  const c = await config();
  if (!c) return false;
  const listing = await findListing(b.listingSlug);
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
  const custom_fields = vetted(b, await ensureFields(c));
  if (!b.pipedrive.dealId) {
    const made = await call<{ data: { id: number } }>(c, "POST", "/api/v2/deals", { title: `${b.name} · ${listing?.title ?? b.listingSlug}`, person_id: b.pipedrive.personId, ...(c.pipelineId ? { pipeline_id: c.pipelineId } : {}), ...(stage_id ? { stage_id } : {}), custom_fields });
    b.pipedrive.dealId = made.data.id;
  } else {
    await call(c, "PATCH", `/api/v2/deals/${b.pipedrive.dealId}`, { ...(stage_id ? { stage_id } : {}), custom_fields });
  }
  await syncFiles(c, b);
  b.pipedrive.syncedAt = new Date().toISOString(); b.pipedrive.error = undefined;
  return true;
}
export async function addNote(b: Buyer, content: string) {
  const c = await config();
  if (!c || !b.pipedrive?.dealId) return;
  await call(c, "POST", "/api/v1/notes", { content, deal_id: b.pipedrive.dealId });
}
export async function syncSubmission(kind: string, f: Record<string, string>) {
  const c = await config();
  if (!c || !f.email || kind === "Newsletter" || kind === "Deal alert") return;
  const made = await call<{ data: { id: number } }>(c, "POST", "/api/v2/persons", { name: f.name || f.email, emails: [{ value: f.email, label: "work", primary: true }] });
  const deal = await call<{ data: { id: number } }>(c, "POST", "/api/v2/deals", { title: `${kind}: ${f.company || f.name || f.email}`, person_id: made.data.id });
  await call(c, "POST", "/api/v1/notes", { content: Object.entries(f).map(([k, v]) => `${k}: ${v}`).join("<br>"), deal_id: deal.data.id });
}

import type { Buyer, Stage } from "./types";
import { getListing } from "@/content/listings";

/**
 * Pipedrive sync. Without PIPEDRIVE_API_TOKEN every call is skipped, so the site still works.
 * Only status goes to the CRM. Bank letters and financial documents stay out of it.
 */
const token = () => process.env.PIPEDRIVE_API_TOKEN;
const base = () => (process.env.PIPEDRIVE_BASE_URL ?? `https://${process.env.PIPEDRIVE_COMPANY_DOMAIN}.pipedrive.com`).replace(/\/$/, "");

async function call<T = { data: Record<string, unknown> }>(method: string, url: string, body?: unknown): Promise<T> {
  const res = await fetch(base() + url, {
    method,
    headers: { "x-api-token": token()!, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`Pipedrive ${method} ${url}: ${res.status} ${await res.text()}`);
  return res.json() as Promise<T>;
}
function stageId(stage: Stage) {
  const map = JSON.parse(process.env.PIPEDRIVE_STAGE_IDS ?? "{}") as Partial<Record<Stage, number>>;
  return map[stage];
}
function fields(b: Buyer) {
  const key = JSON.parse(process.env.PIPEDRIVE_FIELD_KEYS ?? "{}") as Record<string, string>;
  const out: Record<string, string> = {};
  if (key.route && b.route) out[key.route] = b.route;
  if (key.ndaSignedAt && b.nda) out[key.ndaSignedAt] = b.nda.signedAt;
  if (key.source) out[key.source] = b.source;
  return out;
}
export async function syncBuyer(b: Buyer) {
  if (!token()) return false;
  const listing = getListing(b.listingSlug);
  b.pipedrive ??= {};
  if (!b.pipedrive.personId) {
    const found = await call<{ data: { items: { item: { id: number } }[] } }>("GET", `/api/v2/persons/search?term=${encodeURIComponent(b.email)}&fields=email&exact_match=true&limit=1`);
    b.pipedrive.personId = found.data.items[0]?.item.id;
  }
  if (!b.pipedrive.personId) {
    const made = await call<{ data: { id: number } }>("POST", "/api/v2/persons", {
      name: b.name, emails: [{ value: b.email, label: "work", primary: true }],
      ...(b.phone ? { phones: [{ value: b.phone, label: "work", primary: true }] } : {}),
    });
    b.pipedrive.personId = made.data.id;
  }
  const stage_id = stageId(b.stage);
  if (!b.pipedrive.dealId) {
    const made = await call<{ data: { id: number } }>("POST", "/api/v2/deals", {
      title: `${b.name} · ${listing?.title ?? b.listingSlug}`, person_id: b.pipedrive.personId,
      ...(process.env.PIPEDRIVE_PIPELINE_ID ? { pipeline_id: Number(process.env.PIPEDRIVE_PIPELINE_ID) } : {}),
      ...(stage_id ? { stage_id } : {}), custom_fields: fields(b),
    });
    b.pipedrive.dealId = made.data.id;
  } else {
    await call("PATCH", `/api/v2/deals/${b.pipedrive.dealId}`, { ...(stage_id ? { stage_id } : {}), custom_fields: fields(b) });
  }
  return true;
}
export async function addNote(b: Buyer, content: string) {
  if (!token() || !b.pipedrive?.dealId) return;
  await call("POST", "/api/v1/notes", { content, deal_id: b.pipedrive.dealId });
}
export async function syncSubmission(kind: string, f: Record<string, string>) {
  if (!token() || !f.email) return;
  const made = await call<{ data: { id: number } }>("POST", "/api/v2/persons", { name: f.name || f.email, emails: [{ value: f.email, label: "work", primary: true }] });
  const deal = await call<{ data: { id: number } }>("POST", "/api/v2/deals", {
    title: `${kind}: ${f.company || f.name || f.email}`, person_id: made.data.id,
    ...(process.env.PIPEDRIVE_SELLER_PIPELINE_ID ? { pipeline_id: Number(process.env.PIPEDRIVE_SELLER_PIPELINE_ID) } : {}),
  });
  await call("POST", "/api/v1/notes", { content: Object.entries(f).map(([k, v]) => `${k}: ${v}`).join("<br>"), deal_id: deal.data.id });
}

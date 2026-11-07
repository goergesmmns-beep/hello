import { keepWarm, releaseCim } from "./flow";
import { buyerById, getSetting, saveBuyer, saveBuyerRaw, setSetting } from "./store";
import { stageLabels, type Buyer, type Stage } from "./types";

/** A pipeline column. System columns follow the buyer's own steps; custom ones are the advisor's. */
export type PipeStage = { id: string; label: string; color: string; description?: string; system?: Stage; hidden?: boolean };
export const STAGE_COLORS = ["#8b8b94", "#3b82f6", "#a855f7", "#f97316", "#22c55e", "#14b8a6", "#eab308", "#ec4899", "#6366f1", "#ef4444"];
export const DEFAULT_STAGES: PipeStage[] = [
  { id: "inquiry", system: "inquiry", label: stageLabels.inquiry, color: "#8b8b94", description: "Asked for access. NDA not signed yet." },
  { id: "nda", system: "nda", label: stageLabels.nda, color: "#3b82f6", description: "NDA signed. Funding not shown yet." },
  { id: "capacity", system: "capacity", label: stageLabels.capacity, color: "#6366f1", description: "Showing proof of funds or a plan." },
  { id: "review", system: "review", label: stageLabels.review, color: "#f97316", description: "Waiting on your decision." },
  { id: "cim", system: "cim", label: "Deal room open", color: "#22c55e", description: "Reading the CIM and the deal room." },
  { id: "call", system: "call", label: stageLabels.call, color: "#14b8a6", description: "Asked to speak with an advisor." },
  { id: "loi", label: "LOI received", color: "#eab308", description: "A letter of intent is on the table." },
  { id: "diligence", label: "Due diligence", color: "#a855f7", description: "Under LOI and checking the business." },
  { id: "closed", label: "Closed", color: "#ec4899", description: "Deal signed and funded." },
  { id: "warm", system: "warm", label: stageLabels.warm, color: "#8b8b94", description: "Not ready yet. Follow up later." },
];
const KEY = "pipeline:stages";
/** Saved columns, with any missing system column put back so no buyer is ever lost. */
export async function getStages(): Promise<PipeStage[]> {
  const saved = (await getSetting<PipeStage[]>(KEY)) ?? DEFAULT_STAGES;
  const out = saved.filter((s) => !s.system || DEFAULT_STAGES.some((d) => d.system === s.system));
  for (const d of DEFAULT_STAGES) if (d.system && !out.some((s) => s.system === d.system)) out.push(d);
  return out;
}
export async function saveStages(list: PipeStage[] | null) {
  if (!list) { await setSetting(KEY, null); return getStages(); }
  const clean = list.slice(0, 16).map((s) => ({ id: String(s.id).slice(0, 40), label: String(s.label).trim().slice(0, 40) || "Untitled", color: /^#[0-9a-f]{6}$/i.test(s.color) ? s.color : "#8b8b94", description: s.description ? String(s.description).slice(0, 160) : undefined, ...(s.system && s.system in stageLabels ? { system: s.system } : {}), ...(s.hidden ? { hidden: true } : {}) }));
  await setSetting(KEY, clean); return getStages();
}
/** The column a buyer sits in. */
export const columnOf = (b: Buyer, stages: PipeStage[]) => (b.board && stages.some((s) => s.id === b.board && !s.system) ? b.board : b.stage);

/** Moves a buyer to a column. System columns run the real step, so the buyer gets the right email and access. */
export async function moveBuyer(id: string, to: string, stages: PipeStage[]) {
  const b = await buyerById(id); if (!b) throw new Error("Buyer not found.");
  const col = stages.find((s) => s.id === to); if (!col) throw new Error("That stage no longer exists.");
  if (!col.system) { b.board = col.id; b.events.unshift({ at: new Date().toISOString(), type: "board", detail: `Moved to ${col.label} by advisor` }); await saveBuyer(b); return b; }
  const target = col.system;
  if (target === b.stage) { if (b.board) { delete b.board; b.events.unshift({ at: new Date().toISOString(), type: "board", detail: `Moved back to ${col.label} by advisor` }); await saveBuyer(b); } return b; }
  if (target === "cim") { if (!b.nda) throw new Error(`${b.name} has not signed the NDA yet, so the deal room cannot open.`); delete b.board; await saveBuyer(b); return releaseCim(id, "advisor"); }
  if (target === "warm") { delete b.board; await saveBuyer(b); return keepWarm(id, "advisor"); }
  if (target === "review" || target === "call") { if (!b.nda) throw new Error(`${b.name} has not signed the NDA yet.`); delete b.board; b.stage = target; b.events.unshift({ at: new Date().toISOString(), type: target, detail: `Moved to ${col.label} by advisor` }); await saveBuyer(b); return b; }
  throw new Error(`"${col.label}" is set by the buyer's own steps, so buyers cannot be moved into it by hand.`);
}
/** Saves the order of cards in a column. */
export async function rankColumn(ids: string[]) {
  for (const [i, id] of ids.slice(0, 300).entries()) { const b = await buyerById(id); if (b && b.rank !== i) { b.rank = i; await saveBuyerRaw(b); } }
}

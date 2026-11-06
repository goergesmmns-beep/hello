import { randomBytes, randomUUID } from "crypto";
import { findListing, isOpen } from "./catalog";
import { nda } from "@/content/nda";
import { signedNdaPdf } from "./pdf";
import { addNote, syncBuyer } from "./pipedrive";
import { notifyAdvisors, sendMail, siteUrl } from "./mail";
import { ruleFor } from "./rules";
import { buyerByEmail, buyerById, buyerByToken, saveBuyer, saveFile } from "./store";
import type { Buyer, Route, Stage } from "./types";

const log = (b: Buyer, type: string, detail: string) => b.events.unshift({ at: new Date().toISOString(), type, detail });

async function commit(b: Buyer, note?: string) {
  try { await syncBuyer(b); if (note) await addNote(b, note); }
  catch (e) { log(b, "crm_error", (e as Error).message.slice(0, 200)); console.error(e); }
  await saveBuyer(b);
}
export const buyerLink = (b: Buyer) => `${siteUrl()}/access/${b.token}?v=${b.verifyCode}`;
async function safely(fn: () => Promise<unknown>, b: Buyer) {
  try { await fn(); } catch (e) { log(b, "mail_error", (e as Error).message.slice(0, 200)); console.error(e); }
}

export async function createInquiry(i: { listingSlug: string; name: string; email: string; phone?: string; company?: string; message?: string; source: string }) {
  const listing = await findListing(i.listingSlug);
  if (!listing || !isOpen(listing)) throw new Error("This listing is not open for inquiries.");
  const email = i.email.trim().toLowerCase();
  const existing = await buyerByEmail(email, listing.slug);
  if (existing) {
    await safely(() => sendMail(email, `Your link for ${listing.title}`, `Here is your private link:\n\n${buyerLink(existing)}`), existing);
    return { buyer: existing, isNew: false };
  }
  const now = new Date().toISOString();
  const b: Buyer = {
    id: randomUUID(), token: randomBytes(24).toString("base64url"), verifyCode: randomBytes(16).toString("base64url"),
    listingSlug: listing.slug, source: i.source, name: i.name.trim(), email, phone: i.phone, company: i.company, message: i.message,
    stage: "inquiry", cimViews: 0, createdAt: now, updatedAt: now, events: [],
  };
  log(b, "inquiry", `Inquiry from ${i.source}`);
  await safely(() => sendMail(email, `Your next step on ${listing.title}`,
    `Hi ${b.name.split(" ")[0]},\n\nThanks for your inquiry. Sign the NDA and tell us how you plan to buy, and we will open the next step. It works on your phone.\n\n${buyerLink(b)}\n\nWestbound Road`), b);
  await commit(b);
  return { buyer: b, isNew: true };
}

export async function saveProfile(token: string, p: { name: string; linkedin?: string; website?: string; why: string; route: Route }) {
  const b = await need(token);
  Object.assign(b, p);
  log(b, "profile", `Profile saved. Route: ${p.route}`);
  await commit(b, `Buyer route: ${p.route}. LinkedIn: ${p.linkedin || "not given"}. Website: ${p.website || "not given"}. Why: ${p.why}`);
  return b;
}
export async function signNda(token: string, s: { signedName: string; ip: string; userAgent: string }) {
  const b = await need(token);
  if (b.nda) return b;
  if (!b.why || !b.route) throw new Error("Complete your profile first.");
  const at = new Date().toISOString();
  const listing = (await findListing(b.listingSlug))!;
  const bytes = await signedNdaPdf({ name: s.signedName, email: b.email, listing: listing.title, at, ip: s.ip, userAgent: s.userAgent });
  const fileId = randomUUID();
  await saveFile({ id: fileId, kind: "nda", buyerId: b.id, name: `NDA-${b.name}.pdf`, mime: "application/pdf", bytes, createdAt: at });
  b.nda = { signedName: s.signedName, signedAt: at, ip: s.ip, userAgent: s.userAgent, version: nda.version, fileId };
  b.stage = "capacity";
  log(b, "nda", `NDA signed by ${s.signedName}`);
  if ((await ruleFor(listing)).gate === "after_nda") { await openCim(b, "Listing rule: CIM opens after NDA"); return b; }
  await commit(b, `NDA signed by ${s.signedName} on ${at}`);
  return b;
}
export async function submitCapacity(token: string, c: { plan?: string; role?: string; acquisitions?: string; competitor?: string; notes?: string; file?: { name: string; mime: string; bytes: Uint8Array } }) {
  const b = await need(token);
  if (!b.nda) throw new Error("Sign the NDA first.");
  const at = new Date().toISOString();
  let fileId: string | undefined;
  if (c.file) {
    fileId = randomUUID();
    await saveFile({ id: fileId, kind: "capacity", buyerId: b.id, name: c.file.name, mime: c.file.mime, bytes: c.file.bytes, createdAt: at });
  }
  b.capacity = { plan: c.plan, role: c.role, acquisitions: c.acquisitions, competitor: c.competitor, notes: c.notes, fileId, fileName: c.file?.name, submittedAt: at };
  const listing = (await findListing(b.listingSlug))!;
  if (b.route === "financing" && c.plan === "Not sure yet") {
    b.stage = "warm"; log(b, "warm", "No funding plan yet. Moved to keep warm");
  } else {
    b.stage = "review"; log(b, "review", "Sent to advisor review");
    await safely(() => notifyAdvisors(`Review needed: ${b.name}, ${listing.title}`, `${b.name} is ready for review.\n\n${siteUrl()}/admin/buyers/${b.id}`), b);
  }
  await commit(b, `Capacity submitted. Route: ${b.route}${c.plan ? `. Plan: ${c.plan}` : ""}${c.file ? ". Document on the secure site." : ""}`);
  return b;
}
async function openCim(b: Buyer, why: string) {
  const listing = (await findListing(b.listingSlug))!;
  b.stage = "cim"; log(b, "cim", why);
  await safely(() => sendMail(b.email, `Your CIM for ${listing.title}`, `Your CIM is ready. This private link is for you only, and your email appears on every page.\n\n${buyerLink(b)}\n\nWestbound Road`), b);
  await commit(b, why);
}
export async function releaseCim(id: string, by: string) {
  const b = await buyerById(id);
  if (!b) throw new Error("Buyer not found");
  await openCim(b, `CIM released by ${by}`);
  return b;
}
export async function keepWarm(id: string, by: string) {
  const b = await buyerById(id);
  if (!b) throw new Error("Buyer not found");
  b.stage = "warm"; log(b, "warm", `Moved to keep warm by ${by}`);
  const listing = (await findListing(b.listingSlug))!;
  await safely(() => sendMail(b.email, `Next steps on ${listing.title}`, `Thanks for your interest. An advisor would like to help with your plan before the next step. See your options here:\n\n${buyerLink(b)}\n\nWestbound Road`), b);
  await commit(b, `Moved to keep warm by ${by}`);
  return b;
}
export async function requestCall(token: string, note?: string) {
  const b = await need(token);
  if (b.stage !== "cim" && b.stage !== "warm") throw new Error("This step is not open yet.");
  if (b.stage === "cim") b.stage = "call";
  log(b, "call", "Buyer asked for a call");
  const listing = (await findListing(b.listingSlug))!;
  await safely(() => notifyAdvisors(`Call requested: ${b.name}, ${listing.title}`, `${note ?? ""}\n\n${siteUrl()}/admin/buyers/${b.id}`), b);
  await commit(b, "Buyer asked for a call");
  return b;
}
export async function resendLink(id: string) {
  const b = await buyerById(id);
  if (!b) throw new Error("Buyer not found");
  const listing = (await findListing(b.listingSlug))!;
  await sendMail(b.email, `Your link for ${listing.title}`, `Here is your private link:\n\n${buyerLink(b)}\n\nWestbound Road`);
  log(b, "link", "Advisor resent the private link"); await saveBuyer(b);
  return b;
}
export async function addAdvisorNote(id: string, text: string) {
  const b = await buyerById(id);
  if (!b) throw new Error("Buyer not found");
  const at = new Date().toISOString();
  b.notes = [{ at, text }, ...(b.notes ?? [])];
  log(b, "note", "Advisor added a note");
  await commit(b, `Advisor note: ${text}`);
  return b;
}
export async function setArchived(id: string, archived: boolean) {
  const b = await buyerById(id);
  if (!b) throw new Error("Buyer not found");
  b.archived = archived; log(b, "archive", archived ? "Buyer archived" : "Buyer restored"); await saveBuyer(b);
  return b;
}
export async function setReminders(id: string, on: boolean) {
  const b = await buyerById(id);
  if (!b) throw new Error("Buyer not found");
  b.remindersOff = !on; log(b, "reminders", on ? "Advisor turned reminders on" : "Advisor paused reminders"); await saveBuyer(b);
  return b;
}
export async function stopReminders(token: string) {
  const b = await need(token);
  b.remindersOff = true; log(b, "reminders", "Buyer stopped reminders"); await saveBuyer(b);
  return b;
}
export async function recordCimView(b: Buyer) {
  b.cimViews += 1; log(b, "cim_view", "CIM opened"); await commit(b);
}
async function need(token: string) {
  const b = await buyerByToken(token);
  if (!b) throw new Error("This link is not valid.");
  return b;
}
/** What the buyer's browser may see. Never includes verifyCode or CRM data. */
export function publicBuyer(b: Buyer) {
  return { name: b.name, email: b.email, linkedin: b.linkedin, website: b.website, why: b.why, route: b.route, stage: b.stage as Stage, ndaSigned: !!b.nda, ndaSignedAt: b.nda?.signedAt };
}

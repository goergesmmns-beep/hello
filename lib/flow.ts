import { createHash, randomBytes, randomUUID } from "crypto";
import { findListing, isOpen } from "./catalog";
import { nda } from "@/content/nda";
import { ndaText, signedNdaPdf } from "./pdf";
import { addNote, syncBuyer } from "./pipedrive";
import { notifyAdvisors, sendMail, siteUrl } from "./mail";
import { ruleFor } from "./rules";
import { allBuyers, buyerByEmail, buyerById, buyerByToken, saveBuyer, saveFile } from "./store";
import { userByEmail } from "./accounts";
import type { Buyer, Offer, OfferStatus, Route, Stage } from "./types";
import { fileIds, getFile } from "./store";

const log = (b: Buyer, type: string, detail: string) => b.events.unshift({ at: new Date().toISOString(), type, detail });

async function commit(b: Buyer, note?: string) {
  try { if (!b.demo) { await syncBuyer(b); if (note) await addNote(b, note); } }
  catch (e) { b.pipedrive = { ...b.pipedrive, error: (e as Error).message.slice(0, 200) }; log(b, "crm_error", (e as Error).message.slice(0, 200)); console.error(e); }
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
  // Account holders skip the profile step: their saved buyer profile carries over.
  const u = await userByEmail(email).catch(() => null);
  if (u) {
    b.phone ??= u.phone; b.company ??= u.company;
    const f = u.buyer?.funding ?? ""; const route: Route | undefined = u.buyer?.type === "strategic" ? "company" : /own|investor/i.test(f) ? "own" : /sba|bank|seller/i.test(f) ? "financing" : undefined;
    if (route && (u.buyer?.about ?? "").trim().length >= 10) { Object.assign(b, { route, why: u.buyer!.about!.trim(), linkedin: u.linkedin, website: u.website }); log(b, "profile", `Profile reused from account. Route: ${route}`); }
  }
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
export async function signNda(token: string, s: { signedName: string; ip: string; userAgent: string; signature?: Uint8Array }) {
  const b = await need(token);
  if (b.nda) return b;
  if (!b.why || !b.route) throw new Error("Complete your profile first.");
  const at = new Date().toISOString();
  const listing = (await findListing(b.listingSlug))!;
  const hash = createHash("sha256").update(`${nda.version}\n${listing.title}\n${ndaText()}\n${s.signedName}\n${b.email}\n${at}`).digest("hex");
  const fileId = randomUUID(); const viewedAt = [...b.events].reverse().find((e) => e.type === "nda_view")?.at;
  const bytes = await signedNdaPdf({ name: s.signedName, email: b.email, listing: listing.title, at, ip: s.ip, userAgent: s.userAgent, hash, signature: s.signature, docId: fileId, verifyUrl: `${siteUrl()}/verify/${fileId}`, viewedAt });
  const pdfHash = createHash("sha256").update(bytes).digest("hex");
  await saveFile({ id: fileId, kind: "nda", buyerId: b.id, name: `NDA-${b.name}.pdf`, mime: "application/pdf", bytes, createdAt: at });
  b.nda = { signedName: s.signedName, signedAt: at, ip: s.ip, userAgent: s.userAgent, version: nda.version, fileId, method: s.signature ? "drawn" : "typed", hash, pdfHash };
  b.stage = "capacity";
  log(b, "nda", `NDA signed by ${s.signedName}`);
  await safely(() => sendMail(b.email, `Your signed NDA for ${listing.title}`, `Hi ${b.name.split(" ")[0]},\n\nYour signed NDA is attached for your records. It includes a signing certificate.\n\nCheck it any time: ${siteUrl()}/verify/${fileId}\nContinue here: ${buyerLink(b)}\n\nWestbound Road`, [{ filename: `Signed NDA - ${listing.title}.pdf`, content: bytes }]), b);
  const rule = await ruleFor(listing);
  if ((b.route === "own" || b.route === "letter") && rule.gate !== "after_nda") {
    const now = new Date().toISOString();
    const prior = (await allBuyers()).filter((x) => x.id !== b.id && x.email === b.email && x.funds?.status === "verified" && (x.funds.expiresAt ?? "") > now && (x.funds.verifiedUsd ?? 0) >= (rule.floorUsd ?? 0)).sort((x, y) => (y.funds!.verifiedUsd ?? 0) - (x.funds!.verifiedUsd ?? 0))[0];
    if (prior?.funds) {
      b.funds = { ...prior.funds, carriedFrom: prior.listingSlug, note: undefined }; b.stage = "review";
      log(b, "funds_ok", "Proof of funds carried over from an earlier verification"); log(b, "review", "Sent to advisor review");
      await safely(() => notifyAdvisors(`Review needed: ${b.name}, ${listing.title}`, `${b.name} signed the NDA. Their proof of funds is already verified ($${(prior.funds!.verifiedUsd ?? 0).toLocaleString("en-US")}, valid until ${prior.funds!.expiresAt?.slice(0, 10)}).\n\n${siteUrl()}/admin/buyers/${b.id}`), b);
      await commit(b, `NDA signed by ${s.signedName}. Verified funds carried over.`); return b;
    }
  }
  if ((await ruleFor(listing)).gate === "after_nda") { await openCim(b, "Listing rule: CIM opens after NDA"); return b; }
  await commit(b, `NDA signed by ${s.signedName} on ${at}`);
  return b;
}
const MAX_DOCS = 5;
export async function addFundsDoc(token: string, file: { name: string; mime: string; bytes: Uint8Array }) {
  const b = await need(token);
  if (!b.nda) throw new Error("Sign the NDA first.");
  const f = b.funds ?? { docs: [] };
  if (f.docs.length >= MAX_DOCS) throw new Error(`You can add up to ${MAX_DOCS} documents.`);
  const at = new Date().toISOString(), fileId = randomUUID();
  await saveFile({ id: fileId, kind: "capacity", buyerId: b.id, name: file.name, mime: file.mime, bytes: file.bytes, createdAt: at });
  b.funds = { ...f, docs: [...f.docs, { fileId, name: file.name, at }] };
  await saveBuyer(b);
  return b;
}
export async function submitFunds(token: string, i: { docType: string; statedUsd?: number; docDate?: string }) {
  const b = await need(token);
  if (!b.funds?.docs.length) throw new Error("Add at least one document.");
  const listing = (await findListing(b.listingSlug))!;
  b.funds = { ...b.funds, ...i, status: "submitted", note: undefined, submittedAt: new Date().toISOString() };
  b.stage = "review"; log(b, "funds", `Proof of funds submitted: ${i.docType}`);
  await safely(() => notifyAdvisors(`Proof of funds to review: ${b.name}, ${listing.title}`, `${siteUrl()}/admin/buyers/${b.id}`), b);
  await commit(b, "Proof of funds submitted. Documents are on the secure site.");
  return b;
}
export async function verifyFunds(id: string, amount: number, release: boolean) {
  const b = await buyerById(id);
  if (!b?.funds) throw new Error("No proof of funds on this buyer.");
  const at = new Date();
  b.funds = { ...b.funds, status: "verified", verifiedUsd: amount, verifiedAt: at.toISOString(), expiresAt: new Date(at.getTime() + 90 * 864e5).toISOString(), note: undefined };
  log(b, "funds_ok", "Advisor verified proof of funds");
  if (release) { await openCim(b, "CIM released after funds were verified"); return b; }
  await commit(b, "Proof of funds verified");
  return b;
}
export async function requestMoreFunds(id: string, note: string) {
  const b = await buyerById(id);
  if (!b?.funds) throw new Error("No proof of funds on this buyer.");
  const listing = (await findListing(b.listingSlug))!;
  b.funds = { ...b.funds, status: "more", note }; b.stage = "capacity";
  log(b, "funds_more", "Advisor asked for more proof of funds");
  await safely(() => sendMail(b.email, `More information needed for ${listing.title}`, `Hi ${b.name.split(" ")[0]},\n\nAn advisor reviewed your proof of funds and needs the following:\n\n${note}\n\nAdd it here:\n${buyerLink(b)}\n\nWestbound Road`), b);
  await commit(b, "Advisor asked for more proof of funds");
  return b;
}
export async function declineFunds(id: string) {
  const b = await buyerById(id);
  if (!b?.funds) throw new Error("No proof of funds on this buyer.");
  b.funds = { ...b.funds, status: "declined" };
  await saveBuyer(b);
  return keepWarm(id, "advisor");
}
export async function addOffer(id: string, o: Omit<Offer, "id" | "at">) {
  const b = await buyerById(id); if (!b) throw new Error("Buyer not found");
  b.offers = [{ ...o, id: randomUUID(), at: new Date().toISOString() }, ...(b.offers ?? [])];
  log(b, "offer", `Offer logged: $${o.amountUsd.toLocaleString("en-US")}, ${o.status}`);
  await commit(b, `Offer logged: $${o.amountUsd.toLocaleString("en-US")}, ${o.status}`);
  return b;
}
export async function setOfferStatus(id: string, offerId: string, status: OfferStatus) {
  const b = await buyerById(id); if (!b) throw new Error("Buyer not found");
  b.offers = (b.offers ?? []).map((o) => (o.id === offerId ? { ...o, status } : o));
  log(b, "offer", `Offer marked ${status}`); await commit(b, `Offer marked ${status}`);
  return b;
}
export async function addTask(id: string, text: string, due?: string) {
  const b = await buyerById(id); if (!b) throw new Error("Buyer not found");
  b.tasks = [{ id: randomUUID(), text, due, at: new Date().toISOString() }, ...(b.tasks ?? [])];
  await saveBuyer(b); return b;
}
export async function toggleTask(id: string, taskId: string) {
  const b = await buyerById(id); if (!b) throw new Error("Buyer not found");
  b.tasks = (b.tasks ?? []).map((t) => (t.id === taskId ? { ...t, done: !t.done } : t));
  await saveBuyer(b); return b;
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
export async function recordCimView(b: Buyer, what = "CIM opened") {
  b.cimViews += 1; log(b, "cim_view", what); await commit(b);
}
/** The deal room is open to buyers whose CIM is released and who opened the emailed link. */
export async function roomBuyer(token: string, v?: string | null) {
  const b = await buyerByToken(token);
  return b && v && v === b.verifyCode && ["cim", "call"].includes(b.stage) ? b : null;
}
export async function trackRoom(b: Buyer, sections: Record<string, number>) {
  const r = b.room ?? { sections: {}, docs: {} };
  for (const [k, sec] of Object.entries(sections)) if (/^[a-z]{2,20}$/.test(k) && sec > 0) r.sections[k] = Math.min((r.sections[k] ?? 0) + Math.min(sec, 120), 36000);
  b.room = { ...r, lastAt: new Date().toISOString() }; await saveBuyer(b);
}
export async function trackDoc(b: Buyer, name: string, label?: string) {
  const r = b.room ?? { sections: {}, docs: {} };
  r.docs[name] = (r.docs[name] ?? 0) + 1; b.room = { ...r, lastAt: new Date().toISOString() };
  log(b, "cim_view", label ?? `Opened ${name}`); b.cimViews += 1; await commit(b);
}
export async function roomDocs(slug: string) {
  const ids = await fileIds(`room:${slug}:`);
  return (await Promise.all(ids.map(async (id) => { const f = await getFile(id); const [folder, name] = f ? (f.name.includes("::") ? f.name.split("::") : ["Other", f.name]) : []; return f && { id: id.split(":")[2], name: name!, folder: folder!, at: f.createdAt }; }))).filter((x): x is { id: string; name: string; folder: string; at: string } => !!x).sort((a, b) => a.at.localeCompare(b.at));
}
export async function askQuestion(b: Buyer, q: string) {
  const listing = (await findListing(b.listingSlug))!;
  b.questions = [...(b.questions ?? []), { id: randomUUID(), at: new Date().toISOString(), q }];
  log(b, "question", "Asked a question in the deal room");
  await safely(() => notifyAdvisors(`Buyer question: ${b.name}, ${listing.title}`, `${q}\n\nAnswer it here:\n${siteUrl()}/admin/buyers/${b.id}`), b);
  await commit(b, `Buyer question: ${q}`);
  return b;
}
export async function answerQuestion(id: string, qid: string, a: string) {
  const b = await buyerById(id); if (!b) throw new Error("Buyer not found");
  const listing = (await findListing(b.listingSlug))!;
  b.questions = (b.questions ?? []).map((x) => (x.id === qid ? { ...x, a, answeredAt: new Date().toISOString() } : x));
  log(b, "answer", "Advisor answered a question");
  await safely(() => sendMail(b.email, `Your question about ${listing.title} has an answer`, `An advisor answered your question in the deal room.\n\n${buyerLink(b).replace("/access/", "/room/")}\n\nWestbound Road`), b);
  await commit(b, `Advisor answer: ${a}`);
  return b;
}
export async function submitInterest(b: Buyer, o: { amountUsd: number; cashUsd?: number; sellerNoteUsd?: number; earnoutUsd?: number; notes?: string }) {
  const listing = (await findListing(b.listingSlug))!;
  b.offers = [{ ...o, id: randomUUID(), at: new Date().toISOString(), status: "Submitted" }, ...(b.offers ?? [])];
  log(b, "offer", `Indication of interest: $${o.amountUsd.toLocaleString("en-US")}`);
  await safely(() => notifyAdvisors(`Indication of interest: ${b.name}, ${listing.title}`, `$${o.amountUsd.toLocaleString("en-US")}\n\n${siteUrl()}/admin/buyers/${b.id}`), b);
  await commit(b, `Indication of interest from the deal room: $${o.amountUsd.toLocaleString("en-US")}. ${o.notes ?? ""}`);
  return b;
}
export async function resync(id: string) {
  const b = await buyerById(id); if (!b) throw new Error("Buyer not found");
  await commit(b); return b;
}
async function need(token: string) {
  const b = await buyerByToken(token);
  if (!b) throw new Error("This link is not valid.");
  return b;
}
/** What the buyer's browser may see. Never includes verifyCode or CRM data. */
export function publicBuyer(b: Buyer) {
  return { name: b.name, email: b.email, linkedin: b.linkedin, website: b.website, why: b.why, route: b.route, stage: b.stage as Stage, ndaSigned: !!b.nda, ndaSignedAt: b.nda?.signedAt, funds: b.funds ? { status: b.funds.status, note: b.funds.note, docs: b.funds.docs.map((d) => d.name) } : undefined };
}

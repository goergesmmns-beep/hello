import { company } from "@/content/site";
import { findListing, isOpen } from "./catalog";
import { notifyAdvisors, sendMail, siteUrl } from "./mail";
import { allBuyers, getSetting, saveBuyer, setSetting } from "./store";
import type { Buyer } from "./types";

export type Followups = { enabled: boolean; bookingUrl?: string; lastRun?: { at: string; sent: number; skipped: string | null } };
export const getFollowups = async () => (await getSetting<Followups>("followups")) ?? { enabled: true };
export const saveFollowups = (f: Followups) => setSetting("followups", f);
export const canEmail = () => !!process.env.RESEND_API_KEY || !process.env.VERCEL;

const quiet = new Set(["offer", "reminder", "note", "link", "cim_view", "crm_error", "mail_error", "archive", "reminders"]);
const lastStep = (b: Buyer) => b.events.find((e) => !quiet.has(e.type))?.at ?? b.createdAt;
const link = (b: Buyer) => `${siteUrl()}/access/${b.token}?v=${b.verifyCode}`;
type Step = { key: string; afterHours: number; subject: (t: string) => string; body: (b: Buyer, t: string, book?: string) => string };

const plan: Partial<Record<Buyer["stage"], Step[]>> = {
  inquiry: [
    { key: "inquiry-1", afterHours: 24, subject: (t) => `Finish your NDA for ${t}`, body: (b, t) => `You started your request for ${t}, and it only takes a few minutes to finish on your phone.\n\n${link(b)}` },
    { key: "inquiry-2", afterHours: 96, subject: (t) => `Still interested in ${t}?`, body: (b) => `The best businesses tend to attract several buyers, so we wanted to check in. Pick up where you left off here:\n\n${link(b)}\n\nIf you have questions first, just reply to this email.` },
  ],
  capacity: [
    { key: "capacity-1", afterHours: 24, subject: (t) => `One step left for ${t}`, body: (b) => `Your NDA is signed. Confirm your funding approach and an advisor will take the next step.\n\n${link(b)}` },
    { key: "capacity-2", afterHours: 96, subject: (t) => `Need help with funding for ${t}?`, body: (b) => `If funding is what's holding you up, tell us. We work with buyers on over 230 acquisition funding strategies.\n\n${link(b)}` },
  ],
  cim: [
    { key: "cim-1", afterHours: 72, subject: (t) => `Questions on ${t}?`, body: (b, t, book) => `You have had the CIM for ${t} for a few days. If it looks like a fit, the next step is a conversation with an advisor.\n\n${book ?? link(b)}` },
    { key: "cim-2", afterHours: 192, subject: (t) => `Next steps on ${t}`, body: (b, t, book) => `Checking in on ${t}. If it isn't the right fit, tell us what you're looking for and we'll keep you in mind for future listings.\n\n${book ?? link(b)}` },
  ],
  warm: [
    { key: "warm-1", afterHours: 168, subject: () => "Your acquisition funding plan", body: (b, _t, book) => `Most first-time buyers start with the funding plan. An advisor can walk you through your options.\n\n${book ?? link(b)}` },
    { key: "warm-2", afterHours: 504, subject: () => "New acquisition opportunities", body: () => `We have new businesses available. See what's on the market:\n\n${siteUrl()}/buy` },
  ],
};
const footer = (b: Buyer) => `\n\nWestbound Road\n\n--\n${company.legal}, ${company.address.join(", ")}\nStop these reminders: ${siteUrl()}/unsubscribe/${b.token}`;

export async function runReminders() {
  const f = await getFollowups();
  const finish = async (sent: number, skipped: string | null) => { await saveFollowups({ ...f, lastRun: { at: new Date().toISOString(), sent, skipped } }); return { sent, skipped }; };
  if (!f.enabled) return finish(0, "Follow-ups are turned off");
  if (!canEmail()) return finish(0, "Live email is not connected");
  const now = Date.now(); let sent = 0;
  const buyers = await allBuyers();
  for (const b of buyers) {
    if (sent >= 60) break; // The rest go out on the next run.
    if (b.archived || b.remindersOff) continue;
    const listing = await findListing(b.listingSlug);
    const open = !!listing && isOpen(listing);
    if (!open && b.stage !== "warm") continue;
    const done = b.reminders ?? {};
    const age = (now - new Date(lastStep(b)).getTime()) / 36e5;
    // Only the next unsent reminder that is due, so a buyer never gets two at once.
    const step = (plan[b.stage] ?? []).find((s) => !done[s.key]);
    if (!step || age < step.afterHours) continue;
    try {
      await sendMail(b.email, step.subject(listing?.title ?? "your listing"), `Hi ${b.name.split(" ")[0]},\n\n${step.body(b, listing?.title ?? "your listing", f.bookingUrl)}${footer(b)}`);
      b.reminders = { ...done, [step.key]: new Date().toISOString() };
      b.events.unshift({ at: new Date().toISOString(), type: "reminder", detail: `Reminder sent: ${step.subject(listing?.title ?? "your listing")}` });
      await saveBuyer(b); sent++;
    } catch (e) { console.error("Reminder failed", b.id, e); }
  }
  const waiting = buyers.filter((b) => !b.archived && b.stage === "review" && (now - new Date(lastStep(b)).getTime()) / 36e5 >= 24);
  if (waiting.length) await notifyAdvisors(`${waiting.length} ${waiting.length === 1 ? "buyer is" : "buyers are"} waiting for review`, `${waiting.map((b) => `${b.name}: ${siteUrl()}/admin/buyers/${b.id}`).join("\n")}`).catch(console.error);
  return finish(sent, null);
}

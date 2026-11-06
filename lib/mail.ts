import { promises as fs } from "fs";
import path from "path";

export const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export async function sendMail(to: string, subject: string, text: string) {
  const key = process.env.RESEND_API_KEY;
  // Demo records use the reserved .example domain, so live email never goes to them.
  if (key && /\.example$/i.test(to.trim())) return;
  if (!key) {
    if (process.env.VERCEL && process.env.TEST_MODE !== "true") throw new Error("RESEND_API_KEY is required on Vercel.");
    if (process.env.VERCEL) { console.log("TEST MODE mail", to, subject); return; }
    const p = path.join(process.cwd(), ".data", "outbox.log");
    await fs.mkdir(path.dirname(p), { recursive: true });
    await fs.appendFile(p, JSON.stringify({ to, subject, text }) + "\n");
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.MAIL_FROM ?? "Westbound Road <access@westboundroad.com>", to: [to], subject, text }),
  });
  if (!res.ok) throw new Error(`Email failed: ${res.status} ${await res.text()}`);
}
export const notifyAdvisors = (subject: string, text: string) => sendMail(process.env.ADVISOR_EMAIL ?? "advisors@example.com", subject, text);

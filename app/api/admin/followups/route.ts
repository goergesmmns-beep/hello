import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { getFollowups, runReminders, saveFollowups } from "@/lib/reminders";
export const maxDuration = 60;
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Sign in again." }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  if (b.action === "run") return NextResponse.json(await runReminders());
  const url = String(b.bookingUrl ?? "").trim();
  if (url) { try { if (new URL(url).protocol !== "https:") throw 0; } catch { return NextResponse.json({ error: "Use a full link that starts with https://" }, { status: 400 }); } }
  await saveFollowups({ ...(await getFollowups()), enabled: !!b.enabled, bookingUrl: url || undefined });
  return NextResponse.json({ ok: true });
}

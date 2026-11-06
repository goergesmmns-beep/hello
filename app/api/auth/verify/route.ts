import { NextResponse } from "next/server";
import { checkCode, findOrCreate, safeNext, startSession } from "@/lib/accounts";
import { clientIp, limited } from "@/lib/limit";
export async function POST(req: Request) {
  const stop = await limited(`verify:${clientIp(req)}`, 30, 3600); if (stop) return stop;
  const b = await req.json().catch(() => ({})) as { email?: string; code?: string; next?: string };
  if (!b.email || !b.code) return NextResponse.json({ error: "Enter the code from your email." }, { status: 400 });
  const r = await checkCode(b.email, b.code);
  if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 });
  const u = await findOrCreate(b.email, { name: r.name, via: "code" });
  await startSession(u, new URL(req.url).protocol === "https:");
  return NextResponse.json({ ok: true, next: u.onboarded ? safeNext(b.next) : `/account/welcome?next=${encodeURIComponent(safeNext(b.next))}` });
}

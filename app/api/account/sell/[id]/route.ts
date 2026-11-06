import { NextResponse } from "next/server";
import { z } from "zod";
import { currentUser } from "@/lib/accounts";
import { getSub, missing, postMessage, saveSub, setStatus } from "@/lib/seller";

const t = (n: number) => z.string().trim().max(n).optional();
const draft = z.object({
  business: z.object({ name: t(140), url: t(300), publicTitle: t(140), category: t(60), model: t(200), founded: t(10), location: t(120), team: t(120), ownerHours: t(60), description: t(5000), customers: t(1000) }),
  financials: z.array(z.object({ period: z.string().trim().max(20), revenue: z.number().nonnegative().max(1e10), sde: z.number().min(-1e9).max(1e10) })).max(6),
  highlights: z.array(z.string().trim().max(200)).max(10), growth: z.array(z.string().trim().max(200)).max(10),
  sale: z.object({ reason: t(1500), transition: t(1500), asking: z.number().nonnegative().max(1e10).optional(), structure: z.array(z.string().max(40)).max(8).optional(), timeline: t(60), notes: t(2000) }),
});
async function mine(id: string) { const u = await currentUser(); const s = u ? await getSub(id) : null; return u && s && s.ownerId === u.id ? { u, s } : null; }
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const m = await mine((await params).id); if (!m) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (!["draft", "changes"].includes(m.s.status)) return NextResponse.json({ error: "This listing is with an advisor. Send a message to change it." }, { status: 409 });
  const p = draft.safeParse(await req.json().catch(() => null)); if (!p.success) return NextResponse.json({ error: `Check ${p.error.issues[0]?.path.join(" ")}.` }, { status: 400 });
  Object.assign(m.s, p.data); await saveSub(m.s); return NextResponse.json({ ok: true, missing: missing(m.s) });
}
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const m = await mine((await params).id); if (!m) return NextResponse.json({ error: "Not found." }, { status: 404 });
  const b = await req.json().catch(() => ({})) as { action?: string; text?: string; owner?: boolean; accurate?: boolean; signature?: string };
  if (b.action === "submit") {
    if (!["draft", "changes"].includes(m.s.status)) return NextResponse.json({ error: "Already submitted." }, { status: 409 });
    const gaps = missing(m.s); if (gaps.length) return NextResponse.json({ error: `Still needed: ${gaps.join(", ")}.` }, { status: 400 });
    if (!b.owner || !b.accurate || !b.signature || b.signature.trim().length < 2) return NextResponse.json({ error: "Confirm both statements and type your name." }, { status: 400 });
    m.s.confirm = { owner: true, accurate: true, at: new Date().toISOString(), name: b.signature.trim().slice(0, 120) };
    await setStatus(m.s, "submitted", m.s.status === "changes" ? "Resubmitted with changes" : undefined, "seller"); return NextResponse.json({ ok: true });
  }
  if (b.action === "message" && b.text?.trim()) { await postMessage(m.s, "seller", m.u.name, b.text.trim().slice(0, 3000)); return NextResponse.json({ ok: true }); }
  if (b.action === "withdraw" && ["submitted", "review"].includes(m.s.status)) { await setStatus(m.s, "draft", "Withdrawn by the owner to edit", "seller"); return NextResponse.json({ ok: true }); }
  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}

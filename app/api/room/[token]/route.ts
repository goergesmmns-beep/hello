import { NextResponse } from "next/server";
import { z } from "zod";
import { askQuestion, roomBuyer, submitInterest } from "@/lib/flow";
import { limited } from "@/lib/limit";

const n = z.number().int().nonnegative().optional();
const ask = z.object({ action: z.literal("ask"), q: z.string().trim().min(5).max(1500) });
const ioi = z.object({ action: z.literal("interest"), amountUsd: z.number().int().positive().max(1e10), cashUsd: n, sellerNoteUsd: n, earnoutUsd: n, notes: z.string().trim().max(2000).optional() });
export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const b = await roomBuyer(token, new URL(req.url).searchParams.get("v"));
  if (!b) return NextResponse.json({ error: "Open the deal room from your emailed link." }, { status: 403 });
  const stop = await limited(`room:${token}`, 20, 3600);
  if (stop) return stop;
  const body = await req.json().catch(() => null);
  const a = ask.safeParse(body);
  if (a.success) { const x = await askQuestion(b, a.data.q); return NextResponse.json({ questions: x.questions }); }
  const i = ioi.safeParse(body);
  if (i.success) { const { action, ...o } = i.data; void action; await submitInterest(b, o); return NextResponse.json({ ok: true }); }
  return NextResponse.json({ error: "Check the form and try again." }, { status: 400 });
}

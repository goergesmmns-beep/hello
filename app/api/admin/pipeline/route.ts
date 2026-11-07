import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { getStages, moveBuyer, rankColumn, saveStages, type PipeStage } from "@/lib/pipeline";

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Sign in again." }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  try {
    if (b.action === "move") { const stages = await getStages(); const r = await moveBuyer(String(b.id), String(b.to), stages); if (Array.isArray(b.order)) await rankColumn(b.order.map(String)); return NextResponse.json({ ok: true, stage: r.stage, board: r.board ?? null }); }
    if (b.action === "order" && Array.isArray(b.ids)) { await rankColumn(b.ids.map(String)); return NextResponse.json({ ok: true }); }
    if (b.action === "stages") return NextResponse.json({ stages: await saveStages(b.reset ? null : (b.stages as PipeStage[])) });
  } catch (e) { return NextResponse.json({ error: (e as Error).message }, { status: 409 }); }
  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}

import { NextResponse } from "next/server";
import { roomBuyer, trackRoom } from "@/lib/flow";
import { limited } from "@/lib/limit";

export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const b = await roomBuyer(token, new URL(req.url).searchParams.get("v"));
  if (!b) return new Response(null, { status: 403 });
  if (await limited(`track:${token}`, 240, 3600)) return new Response(null, { status: 429 });
  const body = await req.json().catch(() => null) as { sections?: Record<string, number> } | null;
  if (body?.sections && typeof body.sections === "object") await trackRoom(b, Object.fromEntries(Object.entries(body.sections).slice(0, 12).map(([k, v]) => [k, Number(v) || 0])));
  return NextResponse.json({ ok: true });
}

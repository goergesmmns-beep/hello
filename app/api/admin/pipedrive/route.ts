import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { config, connect, createPipeline, disconnect, pipelines, saveMapping } from "@/lib/pipedrive";

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Sign in again." }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  try {
    if (body.action === "connect") {
      if (typeof body.token !== "string" || body.token.length < 10) return NextResponse.json({ error: "Paste your Pipedrive API token." }, { status: 400 });
      await connect(body.token.trim());
      return NextResponse.json({ ok: true });
    }
    if (body.action === "disconnect") { await disconnect(); return NextResponse.json({ ok: true }); }
    const c = await config();
    if (!c) return NextResponse.json({ error: "Connect Pipedrive first." }, { status: 400 });
    if (body.action === "create") await createPipeline(c);
    else if (body.action === "map") await saveMapping(c, Number(body.pipelineId), body.stages);
    else if (body.action === "test") await pipelines(c);
    else return NextResponse.json({ error: "Unknown action." }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const m = (e as Error).message;
    return NextResponse.json({ error: m.includes(": 401") ? "Pipedrive did not accept that token. Copy it again from Personal preferences > API." : "Pipedrive could not complete that. Try again." }, { status: 400 });
  }
}

import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { keepWarm, releaseCim } from "@/lib/flow";
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Sign in again." }, { status: 401 });
  const { id } = await params;
  const { action } = await req.json().catch(() => ({}));
  if (action === "release") await releaseCim(id, "advisor");
  else if (action === "warm") await keepWarm(id, "advisor");
  else return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  return NextResponse.json({ ok: true });
}

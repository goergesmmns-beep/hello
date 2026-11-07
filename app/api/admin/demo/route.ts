import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { seedDemo } from "@/lib/demo";
import { clearWorld } from "@/lib/demo-world";
import { portalOf, startSession, userById } from "@/lib/accounts";
import { clearDemo } from "@/lib/store";

export const maxDuration = 60;
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Sign in again." }, { status: 401 });
  const { action, id } = await req.json().catch(() => ({}));
  // Opens a sample account's dashboard, so the advisor can record both sides. Real accounts can never be opened this way.
  if (action === "open") { const u = await userById(String(id)); if (!u?.demo) return NextResponse.json({ error: "Only sample accounts can be opened." }, { status: 403 }); await startSession(u, new URL(req.url).protocol === "https:"); return NextResponse.json({ next: portalOf(u) }); }
  try {
    if (action === "load") { const r = await seedDemo(); revalidatePath("/", "layout"); return NextResponse.json({ ok: true, ...r }); }
    if (action === "clear") { const n = await clearDemo(); await clearWorld(); revalidatePath("/", "layout"); return NextResponse.json({ ok: true, removed: n }); }
  } catch (e) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }); }
  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}

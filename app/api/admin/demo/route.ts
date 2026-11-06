import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { seedDemo } from "@/lib/demo";
import { clearDemo } from "@/lib/store";

export const maxDuration = 60;
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Sign in again." }, { status: 401 });
  const { action } = await req.json().catch(() => ({}));
  try {
    if (action === "load") { const r = await seedDemo(); revalidatePath("/", "layout"); return NextResponse.json({ ok: true, ...r }); }
    if (action === "clear") { const n = await clearDemo(); revalidatePath("/", "layout"); return NextResponse.json({ ok: true, removed: n }); }
  } catch (e) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }); }
  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}

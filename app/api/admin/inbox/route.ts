import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { allSubmissions, saveSubmission } from "@/lib/store";
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Sign in again." }, { status: 401 });
  const { id, handled } = await req.json().catch(() => ({}));
  const s = (await allSubmissions()).find((x) => x.id === id);
  if (!s) return NextResponse.json({ error: "Not found." }, { status: 404 });
  await saveSubmission({ ...s, handled: !!handled });
  return NextResponse.json({ ok: true });
}

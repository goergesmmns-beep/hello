import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { checks, createListingFrom, getSub, postMessage, saveSub, setStatus } from "@/lib/seller";
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Sign in again." }, { status: 401 });
  const s = await getSub((await params).id); if (!s) return NextResponse.json({ error: "Not found." }, { status: 404 });
  const b = await req.json().catch(() => ({})) as { action?: string; note?: string; key?: string; value?: boolean; text?: string };
  const note = b.note?.trim().slice(0, 2000);
  if (b.action === "review") await setStatus(s, "review", "An advisor started reviewing your submission");
  else if (b.action === "changes" && note) await setStatus(s, "changes", note);
  else if (b.action === "reject" && note) await setStatus(s, "rejected", note);
  else if (b.action === "check" && checks.some(([k]) => k === b.key)) { s.checklist = { ...s.checklist, [b.key!]: !!b.value }; await saveSub(s); }
  else if (b.action === "message" && b.text?.trim()) await postMessage(s, "advisor", "Westbound Road advisor", b.text.trim().slice(0, 3000));
  else if (b.action === "approve") { if (!s.listingSlug) await createListingFrom(s); await setStatus(s, "approved", "Approved. Your advisor is preparing the listing for your sign-off."); revalidatePath("/", "layout"); return NextResponse.json({ ok: true, slug: s.listingSlug }); }
  else return NextResponse.json({ error: "Check the request." }, { status: 400 });
  return NextResponse.json({ ok: true });
}

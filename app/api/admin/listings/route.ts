import { NextResponse } from "next/server";
import { getListing } from "@/content/listings";
import { isAdmin } from "@/lib/admin";
import { saveRule } from "@/lib/rules";
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Sign in again." }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const floor = b.floorUsd === null ? null : Number(b.floorUsd);
  if (!getListing(b.slug) || !["after_nda", "after_review"].includes(b.gate) || (floor !== null && !Number.isFinite(floor))) return NextResponse.json({ error: "Check the rule." }, { status: 400 });
  await saveRule(b.slug, { gate: b.gate, floorUsd: floor });
  return NextResponse.json({ ok: true });
}

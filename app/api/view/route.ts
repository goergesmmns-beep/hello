import { NextResponse } from "next/server";
import { findListing } from "@/lib/catalog";
import { clientIp, limited } from "@/lib/limit";
import { recordView } from "@/lib/views";
/** One view per visitor per listing every 30 minutes. */
export async function POST(req: Request) {
  const { slug } = await req.json().catch(() => ({}));
  if (typeof slug !== "string" || !(await findListing(slug))) return NextResponse.json({ ok: false }, { status: 404 });
  if (await limited(`view:${clientIp(req)}:${slug}`, 1, 1800)) return NextResponse.json({ ok: true });
  await recordView(slug); return NextResponse.json({ ok: true });
}

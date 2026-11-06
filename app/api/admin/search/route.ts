import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { catalog } from "@/lib/catalog";
import { allBuyers } from "@/lib/store";
export async function GET(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Sign in again." }, { status: 401 });
  const q = (new URL(req.url).searchParams.get("q") ?? "").toLowerCase().trim();
  if (q.length < 2) return NextResponse.json({ results: [] });
  const buyers = (await allBuyers()).filter((b) => `${b.name} ${b.email} ${b.company ?? ""}`.toLowerCase().includes(q)).slice(0, 6).map((b) => ({ href: `/admin/buyers/${b.id}`, title: b.name, sub: b.email }));
  const list = (await catalog()).filter((l) => l.title.toLowerCase().includes(q)).slice(0, 4).map((l) => ({ href: `/admin/listings/${l.slug}/edit`, title: l.title, sub: "Listing" }));
  return NextResponse.json({ results: [...buyers, ...list] });
}

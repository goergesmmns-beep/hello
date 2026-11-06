import { NextResponse } from "next/server";
import { currentUser } from "@/lib/accounts";
import { getSub } from "@/lib/seller";
/** Picks which business the seller dashboard shows, then goes back to the same tab. */
export async function GET(req: Request) {
  const u = await currentUser(); const url = new URL(req.url); if (!u) return NextResponse.redirect(new URL("/login?next=/seller", url));
  const id = url.searchParams.get("id") ?? ""; const to = url.searchParams.get("to") ?? "/seller"; const s = await getSub(id);
  const res = NextResponse.redirect(new URL(/^\/seller(\/[\w-]*)*$/.test(to) ? to : "/seller", url));
  if (s && s.ownerId === u.id) res.cookies.set("wb_listing", s.id, { path: "/", sameSite: "lax", maxAge: 31536000, httpOnly: true, secure: url.protocol === "https:" });
  return res;
}

import { NextResponse } from "next/server";
import { currentUser, saveUser } from "@/lib/accounts";
import { blankSub, saveSub, subsFor } from "@/lib/seller";
/** Opens the empty draft already started, or starts one, and shows it. */
export async function GET(req: Request) {
  const u = await currentUser(); const url = new URL(req.url); if (!u) return NextResponse.redirect(new URL("/login?next=/seller/new", url));
  if (!u.roles.includes("seller")) { u.roles = [...u.roles, "seller"]; u.primary ??= "seller"; await saveUser(u); }
  const s = (await subsFor(u.id)).find((x) => x.status === "draft" && !x.business.name) ?? (await saveSub(blankSub(u)));
  const res = NextResponse.redirect(new URL("/seller/listing", url));
  res.cookies.set("wb_listing", s.id, { path: "/", sameSite: "lax", maxAge: 31536000, httpOnly: true, secure: url.protocol === "https:" });
  return res;
}

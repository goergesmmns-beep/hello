import { NextResponse } from "next/server";
import { currentUser, saveUser } from "@/lib/accounts";
import { blankSub, saveSub, subsFor } from "@/lib/seller";
/** Starts a listing draft, or returns the empty one already started. */
export async function POST() {
  const u = await currentUser(); if (!u) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const open = (await subsFor(u.id)).find((s) => s.status === "draft" && !s.business.name);
  if (open) return NextResponse.json({ id: open.id });
  if (!u.roles.includes("seller")) { u.roles = [...u.roles, "seller"]; await saveUser(u); }
  const s = await saveSub(blankSub(u)); return NextResponse.json({ id: s.id });
}

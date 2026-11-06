import { NextResponse } from "next/server";
import { z } from "zod";
import { currentUser, saveUser } from "@/lib/accounts";
import { findListing } from "@/lib/catalog";

const t = (n: number) => z.string().trim().max(n).optional();
const profile = z.object({ name: z.string().trim().min(2).max(120), phone: t(40), company: t(120), title: t(120), location: t(120), linkedin: t(300), website: t(300),
  buyer: z.object({ type: z.enum(["individual", "searcher", "strategic", "investor"]).optional(), budget: t(40), sectors: z.array(z.string().max(40)).max(12).optional(), funding: t(60), experience: t(60), timeline: t(60), about: t(1500) }).optional(),
  roles: z.array(z.enum(["buyer", "seller"])).max(2).optional(), onboarded: z.boolean().optional() });
export async function GET() {
  const u = await currentUser(); if (!u) return NextResponse.json({ user: null });
  return NextResponse.json({ user: { name: u.name, email: u.email, saved: u.saved, phone: u.phone, company: u.company } });
}
export async function POST(req: Request) {
  const u = await currentUser(); if (!u) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  if (b.action === "save" || b.action === "unsave") {
    if (!(await findListing(String(b.slug)))) return NextResponse.json({ error: "Listing not found." }, { status: 404 });
    u.saved = b.action === "save" ? [...new Set([String(b.slug), ...u.saved])].slice(0, 100) : u.saved.filter((s) => s !== b.slug);
    await saveUser(u); return NextResponse.json({ saved: u.saved });
  }
  if (b.action === "profile") {
    const p = profile.safeParse(b.data); if (!p.success) return NextResponse.json({ error: `Check ${String(p.error.issues[0]?.path.join(" ") || "the form")}.` }, { status: 400 });
    Object.assign(u, p.data, { buyer: { ...u.buyer, ...p.data.buyer } }); await saveUser(u); return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}

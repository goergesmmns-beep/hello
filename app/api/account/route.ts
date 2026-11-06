import { NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "crypto";
import { currentUser, saveUser } from "@/lib/accounts";
import { findListing, isOpen } from "@/lib/catalog";
import { createInquiry } from "@/lib/flow";

const t = (n: number) => z.string().trim().max(n).optional();
const profile = z.object({ name: z.string().trim().min(2).max(120), phone: t(40), company: t(120), title: t(120), location: t(120), linkedin: t(300), website: t(300),
  buyer: z.object({ type: z.enum(["individual", "searcher", "strategic", "investor"]).optional(), budget: t(40), sectors: z.array(z.string().max(40)).max(12).optional(), funding: t(60), experience: t(60), timeline: t(60), about: t(1500) }).optional(),
  roles: z.array(z.enum(["buyer", "seller"])).max(2).optional(), primary: z.enum(["buyer", "seller"]).optional(), onboarded: z.boolean().optional() });
const search = z.object({ name: z.string().trim().min(1).max(100), q: t(120), cat: t(60), price: t(40), sort: t(30), alerts: z.boolean().default(true) });
export async function GET() {
  const u = await currentUser(); if (!u) return NextResponse.json({ user: null });
  return NextResponse.json({ user: { name: u.name, email: u.email, saved: u.saved, phone: u.phone, company: u.company, portal: u.primary ?? (u.roles.includes("seller") && !u.roles.includes("buyer") ? "seller" : "buyer") } });
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
  if (b.action === "hide" || b.action === "unhide") {
    const slug = String(b.slug); u.hidden = b.action === "hide" ? [...new Set([slug, ...(u.hidden ?? [])])].slice(0, 200) : (u.hidden ?? []).filter((x) => x !== slug);
    await saveUser(u); return NextResponse.json({ hidden: u.hidden });
  }
  if (b.action === "search-save") {
    const p = search.safeParse(b.data); if (!p.success) return NextResponse.json({ error: "Give the search a name." }, { status: 400 });
    if ((u.searches ?? []).length >= 20) return NextResponse.json({ error: "You can keep up to 20 saved searches." }, { status: 400 });
    const s = { id: randomUUID(), at: new Date().toISOString(), ...p.data }; u.searches = [s, ...(u.searches ?? [])]; await saveUser(u); return NextResponse.json({ search: s });
  }
  if (b.action === "search-alerts" || b.action === "search-delete") {
    const s = (u.searches ?? []).find((x) => x.id === b.id); if (!s) return NextResponse.json({ error: "Search not found." }, { status: 404 });
    if (b.action === "search-delete") u.searches = u.searches!.filter((x) => x.id !== b.id); else s.alerts = !!b.on;
    await saveUser(u); return NextResponse.json({ ok: true });
  }
  // Adds the buyer or seller side to an account and opens that portal.
  if (b.action === "portal") {
    const r = b.role === "seller" ? "seller" : "buyer"; if (!u.roles.includes(r)) u.roles = [...u.roles, r]; u.primary = r;
    await saveUser(u); return NextResponse.json({ next: r === "seller" ? "/seller" : "/buyer" });
  }
  // One-click request from the buyer portal. The saved buyer profile fills the inquiry.
  if (b.action === "request") {
    const l = await findListing(String(b.slug)); if (!l || !isOpen(l)) return NextResponse.json({ error: "This listing is not open for requests." }, { status: 400 });
    try { const { buyer } = await createInquiry({ listingSlug: l.slug, name: u.name, email: u.email, phone: u.phone, company: u.company, source: "Buyer portal" }); return NextResponse.json({ next: `/buyer/deals/${buyer.id}` }); }
    catch (e) { return NextResponse.json({ error: (e as Error).message }, { status: 400 }); }
  }
  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}

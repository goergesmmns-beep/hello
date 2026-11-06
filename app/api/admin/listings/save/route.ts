import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import type { Listing } from "@/content/listings";
import { isAdmin } from "@/lib/admin";
import { findListing, saveListing, uniqueSlug } from "@/lib/catalog";
import { saveRule } from "@/lib/rules";

const t = (n: number) => z.string().trim().max(n);
const schema = z.object({
  slug: z.string().max(80), title: t(140).min(3), headline: t(240).min(3), category: t(40).min(2),
  status: z.enum(["available", "offers", "pending", "sold", "draft"]), askLabel: t(40).min(1), askUsd: z.number().int().nonnegative().nullable(),
  metrics: z.array(z.object({ label: t(60), value: t(60) })).max(8), summary: t(800).min(10), highlights: z.array(t(200)).max(12),
  body: z.array(z.object({ heading: t(100).optional(), text: t(4000) })).max(10), gate: z.enum(["after_nda", "after_review"]), floorUsd: z.number().int().nonnegative().nullable(), idealBuyer: z.enum(["any", "strategic"]),
  room: z.object({ financials: z.array(z.object({ period: t(30).min(1), revenue: z.number().nonnegative(), sde: z.number() })).max(8).optional(), reason: t(1500).optional(), transition: t(1500).optional(), structure: t(1500).optional(), team: t(1500).optional(), faq: z.array(z.object({ q: t(300).min(3), a: t(2000).min(1) })).max(20).optional() }).optional(),
});
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Sign in again." }, { status: 401 });
  const p = schema.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: `Check ${String(p.error.issues[0]?.path[0] ?? "the form")}: it is missing or too long.` }, { status: 400 });
  const d = p.data;
  const existing = d.slug ? await findListing(d.slug) : undefined;
  if (d.slug && !existing) return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  // The address stays fixed after creation, so links in buyer emails keep working.
  const slug = existing?.slug ?? (await uniqueSlug(d.title));
  const l: Listing = { ...d, slug, band: (d.askUsd ?? 1e6) >= 1e6 ? "over" : "under", metrics: d.metrics.length ? d.metrics : [{ label: "Asking", value: d.askLabel }] };
  await saveListing(l);
  await saveRule(slug, { gate: l.gate, floorUsd: l.floorUsd });
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true, slug });
}

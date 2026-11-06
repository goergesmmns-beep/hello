import { NextResponse } from "next/server";
import { z } from "zod";
import { createInquiry } from "@/lib/flow";
import { clientIp, limited } from "@/lib/limit";

const schema = z.object({ listingSlug: z.string(), name: z.string().min(2).max(120), email: z.email().max(200), phone: z.string().max(40).optional(), company: z.string().max(160).optional(), company_url: z.string().optional() });
export async function POST(req: Request) {
  const stop = await limited(`inquiry:${clientIp(req)}`, 15, 3600);
  if (stop) return stop;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Check your details." }, { status: 400 });
  const { company_url, ...d } = parsed.data;
  if (company_url) return NextResponse.json({ ok: true });
  try {
    const { buyer, isNew } = await createInquiry({ ...d, source: "Website" });
    // A returning email only gets its link by email, so nobody can open another person's record.
    return NextResponse.json(isNew ? { next: `/access/${buyer.token}` } : { ok: true });
  } catch (e) { return NextResponse.json({ error: (e as Error).message }, { status: 400 }); }
}

import { NextResponse } from "next/server";
import { createInquiry } from "@/lib/flow";
import { notifyAdvisors } from "@/lib/mail";
import { parseLead } from "@/lib/parse-lead";

/** Point Zapier, Make or an inbound-email service here with { subject, text }. */
export async function POST(req: Request) {
  const secret = process.env.INBOUND_SECRET;
  if (!secret || req.headers.get("x-inbound-secret") !== secret) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { subject = "", text = "", source = "BizBuySell" } = await req.json().catch(() => ({}));
  const lead = parseLead(subject, text);
  if (!lead.email || !lead.listingSlug) {
    await notifyAdvisors("Lead needs manual handling", `Could not read this lead.\n\n${subject}\n\n${text}`);
    return NextResponse.json({ ok: false, reason: "unparsed" }, { status: 202 });
  }
  const { buyer, isNew } = await createInquiry({ listingSlug: lead.listingSlug, name: lead.name ?? lead.email, email: lead.email, phone: lead.phone, message: lead.message, source });
  return NextResponse.json({ ok: true, id: buyer.id, isNew });
}

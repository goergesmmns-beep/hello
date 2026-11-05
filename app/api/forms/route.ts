import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { notifyAdvisors } from "@/lib/mail";
import { syncSubmission } from "@/lib/pipedrive";
import { saveSubmission } from "@/lib/store";

const schema = z.object({ kind: z.enum(["Contact", "Seller inquiry", "Valuation request", "Newsletter"]), fields: z.record(z.string(), z.string().max(5000)) });
export async function POST(req: Request) {
  const p = schema.safeParse(await req.json().catch(() => null));
  if (!p.success || !z.email().safeParse(p.data.fields.email).success) return NextResponse.json({ error: "Check the form." }, { status: 400 });
  const { company_url, ...fields } = p.data.fields;
  if (company_url) return NextResponse.json({ ok: true });
  await saveSubmission({ id: randomUUID(), kind: p.data.kind, fields, createdAt: new Date().toISOString() });
  await Promise.allSettled([
    notifyAdvisors(`${p.data.kind}: ${fields.name}`, Object.entries(fields).map(([k, v]) => `${k}: ${v}`).join("\n")),
    syncSubmission(p.data.kind, fields),
  ]).then((r) => r.forEach((x) => x.status === "rejected" && console.error(x.reason)));
  return NextResponse.json({ ok: true });
}

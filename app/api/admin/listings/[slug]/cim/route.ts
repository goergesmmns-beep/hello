import { NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import { isAdmin } from "@/lib/admin";
import { findListing } from "@/lib/catalog";
import { cimBytes, cimVersions, saveCim } from "@/lib/cim";
import { buyerLink } from "@/lib/flow";
import { sendMail } from "@/lib/mail";
import { watermarkBytes } from "@/lib/pdf";
import { allBuyers } from "@/lib/store";

const MAX = 4 * 1024 * 1024;
export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Sign in again." }, { status: 401 });
  const { slug } = await params; const l = await findListing(slug);
  if (!l) return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  const form = await req.formData(); const f = form.get("file");
  if (!(f instanceof File) || f.type !== "application/pdf") return NextResponse.json({ error: "Upload a PDF." }, { status: 400 });
  if (f.size > MAX) return NextResponse.json({ error: "This PDF is over 4 MB. Compress it, or add it to the project's private folder." }, { status: 400 });
  const bytes = new Uint8Array(await f.arrayBuffer());
  try { await PDFDocument.load(bytes); } catch { return NextResponse.json({ error: "That PDF could not be read. It may be damaged or password protected." }, { status: 400 }); }
  const v = await saveCim(slug, f.name.slice(0, 120), bytes); let told = 0;
  if (form.get("notify") === "true" && v > 1) {
    for (const b of (await allBuyers()).filter((x) => x.listingSlug === slug && ["cim", "call"].includes(x.stage) && !x.archived && !x.demo)) {
      await sendMail(b.email, `Updated CIM for ${l.title}`, `Hi ${b.name.split(" ")[0]},\n\nThe Confidential Information Memorandum for ${l.title} has been updated. The new version is in your deal room:\n\n${buyerLink(b).replace("/access/", "/room/")}\n\nWestbound Road`).catch(() => {}); told++;
    }
  }
  return NextResponse.json({ ok: true, version: v, told, versions: await cimVersions(slug) });
}
/** Advisor preview of any version, stamped so it cannot be mistaken for a buyer copy. */
export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  if (!(await isAdmin())) return new Response("Sign in again.", { status: 401 });
  const { slug } = await params; const v = Number(new URL(req.url).searchParams.get("v")) || undefined;
  const bytes = await cimBytes(slug, v); if (!bytes) return new Response("No CIM uploaded yet.", { status: 404 });
  return new Response(Buffer.from(await watermarkBytes(bytes, "ADVISOR PREVIEW")), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `inline; filename="cim-preview.pdf"`, "Cache-Control": "no-store" } });
}

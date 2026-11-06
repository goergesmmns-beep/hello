import { NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import { isAdmin } from "@/lib/admin";
import { findListing } from "@/lib/catalog";
import { saveFile } from "@/lib/store";

const MAX = 4 * 1024 * 1024;
export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Sign in again." }, { status: 401 });
  const { slug } = await params;
  if (!(await findListing(slug))) return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  const f = (await req.formData()).get("file");
  if (!(f instanceof File) || f.type !== "application/pdf") return NextResponse.json({ error: "Upload a PDF." }, { status: 400 });
  if (f.size > MAX) return NextResponse.json({ error: "This PDF is over 4 MB. Compress it, or add it to the project's private folder." }, { status: 400 });
  const bytes = new Uint8Array(await f.arrayBuffer());
  try { await PDFDocument.load(bytes); } catch { return NextResponse.json({ error: "That PDF could not be read. It may be damaged or password protected." }, { status: 400 }); }
  await saveFile({ id: `cim:${slug}`, kind: "cim", buyerId: slug, name: f.name.slice(0, 120), mime: "application/pdf", bytes, createdAt: new Date().toISOString() });
  return NextResponse.json({ ok: true });
}

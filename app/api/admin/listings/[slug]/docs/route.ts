import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import { isAdmin } from "@/lib/admin";
import { findListing } from "@/lib/catalog";
import { roomDocs } from "@/lib/flow";
import { deleteFile, saveFile } from "@/lib/store";

const MAX = 4 * 1024 * 1024;
const folders = ["Financials", "Operations", "Legal", "Customers", "Other"];
export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Sign in again." }, { status: 401 });
  const { slug } = await params;
  if (!(await findListing(slug))) return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  if ((await roomDocs(slug)).length >= 20) return NextResponse.json({ error: "A deal room holds up to 20 documents." }, { status: 400 });
  const form = await req.formData(); const f = form.get("file"); const folder = folders.includes(String(form.get("folder"))) ? String(form.get("folder")) : "Other";
  if (!(f instanceof File) || f.type !== "application/pdf") return NextResponse.json({ error: "Upload a PDF." }, { status: 400 });
  if (f.size > MAX) return NextResponse.json({ error: "This PDF is over 4 MB. Compress it and try again." }, { status: 400 });
  const bytes = new Uint8Array(await f.arrayBuffer());
  try { await PDFDocument.load(bytes); } catch { return NextResponse.json({ error: "That PDF could not be read. It may be damaged or password protected." }, { status: 400 }); }
  await saveFile({ id: `room:${slug}:${randomUUID()}`, kind: "room", buyerId: slug, name: `${folder}::${f.name.replace(/::/g, "-").slice(0, 120)}`, mime: "application/pdf", bytes, createdAt: new Date().toISOString() });
  return NextResponse.json({ docs: await roomDocs(slug) });
}
export async function DELETE(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Sign in again." }, { status: 401 });
  const { slug } = await params; const id = new URL(req.url).searchParams.get("id") ?? "";
  if (!/^[0-9a-f-]{36}$/.test(id)) return NextResponse.json({ error: "Not found." }, { status: 404 });
  await deleteFile(`room:${slug}:${id}`);
  return NextResponse.json({ docs: await roomDocs(slug) });
}

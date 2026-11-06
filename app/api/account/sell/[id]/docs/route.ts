import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { currentUser } from "@/lib/accounts";
import { limited } from "@/lib/limit";
import { getSub, saveSub } from "@/lib/seller";
import { deleteFile, getFile, saveFile } from "@/lib/store";

const MAX = 4 * 1024 * 1024, types = ["application/pdf", "image/png", "image/jpeg", "text/csv", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.ms-excel"], folders = ["Financials", "Tax returns", "Operations", "Legal", "Customers", "Other"];
async function mine(id: string) { const u = await currentUser(); const s = u ? await getSub(id) : null; return u && s && s.ownerId === u.id ? s : null; }
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const s = await mine((await params).id); if (!s) return NextResponse.json({ error: "Not found." }, { status: 404 });
  const stop = await limited(`sdocs:${s.id}`, 60, 3600); if (stop) return stop;
  if (s.docs.length >= 25) return NextResponse.json({ error: "Up to 25 documents. Remove one first." }, { status: 400 });
  const form = await req.formData(); const f = form.get("file"); const folder = folders.includes(String(form.get("folder"))) ? String(form.get("folder")) : "Other";
  if (!(f instanceof File) || !f.size) return NextResponse.json({ error: "Choose a file." }, { status: 400 });
  if (f.size > MAX) return NextResponse.json({ error: `${f.name} is over 4 MB.` }, { status: 400 });
  if (!types.includes(f.type)) return NextResponse.json({ error: "Use PDF, Excel, CSV, PNG or JPG." }, { status: 400 });
  const fileId = `sl:${s.id}:${randomUUID()}`; const at = new Date().toISOString();
  await saveFile({ id: fileId, kind: "room", buyerId: `seller:${s.id}`, name: f.name.slice(0, 120), mime: f.type, bytes: new Uint8Array(await f.arrayBuffer()), createdAt: at });
  s.docs = [...s.docs, { fileId, name: f.name.slice(0, 120), folder, at }]; await saveSub(s); return NextResponse.json({ docs: s.docs });
}
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const s = await mine((await params).id); if (!s) return NextResponse.json({ error: "Not found." }, { status: 404 });
  const fid = new URL(req.url).searchParams.get("file") ?? ""; if (!s.docs.some((d) => d.fileId === fid)) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (!["draft", "changes"].includes(s.status)) return NextResponse.json({ error: "Ask your advisor to remove documents now." }, { status: 409 });
  await deleteFile(fid); s.docs = s.docs.filter((d) => d.fileId !== fid); await saveSub(s); return NextResponse.json({ docs: s.docs });
}
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const s = await mine((await params).id); const fid = new URL(req.url).searchParams.get("file") ?? "";
  if (!s || !s.docs.some((d) => d.fileId === fid)) return new Response("Not found", { status: 404 });
  const f = await getFile(fid); if (!f) return new Response("Not found", { status: 404 });
  return new Response(Buffer.from(f.bytes), { headers: { "Content-Type": f.mime, "Content-Disposition": `inline; filename="${f.name.replace(/[^\w .-]/g, "")}"`, "Cache-Control": "no-store" } });
}

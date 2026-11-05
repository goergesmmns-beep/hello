import { buyerByToken, getFile } from "@/lib/store";
export async function GET(_: Request, { params }: { params: Promise<{ token: string }> }) {
  const b = await buyerByToken((await params).token);
  const f = b?.nda ? await getFile(b.nda.fileId) : null;
  if (!f) return new Response("Not found", { status: 404 });
  return new Response(Buffer.from(f.bytes), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `inline; filename="signed-nda.pdf"`, "Cache-Control": "no-store" } });
}

import { findListing } from "@/lib/catalog";
import { roomBuyer, trackDoc } from "@/lib/flow";
import { watermarkBytes, watermarkedCim } from "@/lib/pdf";
import { getFile } from "@/lib/store";

export async function GET(req: Request, { params }: { params: Promise<{ token: string; id: string }> }) {
  const { token, id } = await params;
  const b = await roomBuyer(token, new URL(req.url).searchParams.get("v"));
  if (!b) return new Response("Not available", { status: 403 });
  const l = (await findListing(b.listingSlug))!;
  let bytes: Uint8Array, name: string;
  if (id === "cim") { bytes = await watermarkedCim(l, b.email); name = "CIM"; }
  else {
    const f = /^[0-9a-f-]{36}$/.test(id) ? await getFile(`room:${l.slug}:${id}`) : null;
    if (!f) return new Response("Not found", { status: 404 });
    bytes = await watermarkBytes(f.bytes, b.email); name = f.name;
  }
  await trackDoc(b, name);
  return new Response(Buffer.from(bytes), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `inline; filename="${name.replace(/[^\w .-]/g, "")}${name.endsWith(".pdf") ? "" : ".pdf"}"`, "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } });
}

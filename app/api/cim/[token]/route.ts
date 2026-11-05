import { getListing } from "@/content/listings";
import { recordCimView } from "@/lib/flow";
import { watermarkedCim } from "@/lib/pdf";
import { buyerByToken } from "@/lib/store";

export async function GET(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const b = await buyerByToken((await params).token);
  const v = new URL(req.url).searchParams.get("v");
  // The verify code only arrives by email, so this proves the buyer owns the address.
  if (!b || v !== b.verifyCode || !["cim", "call"].includes(b.stage)) return new Response("Not available", { status: 403 });
  const bytes = await watermarkedCim(getListing(b.listingSlug)!, b.email);
  await recordCimView(b);
  return new Response(Buffer.from(bytes), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `inline; filename="CIM.pdf"`, "Cache-Control": "no-store" } });
}

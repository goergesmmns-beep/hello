import { NextResponse } from "next/server";
import { addFundsDoc, publicBuyer } from "@/lib/flow";
import { limited } from "@/lib/limit";

const MAX = 4 * 1024 * 1024, types = ["application/pdf", "image/png", "image/jpeg"];
export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const stop = await limited(`funds:${token}`, 30, 3600);
  if (stop) return stop;
  try {
    const f = (await req.formData()).get("file");
    if (!(f instanceof File) || !f.size) return NextResponse.json({ error: "Choose a file." }, { status: 400 });
    if (f.size > MAX) return NextResponse.json({ error: `${f.name} is over 4 MB. Compress it and try again.` }, { status: 400 });
    if (!types.includes(f.type)) return NextResponse.json({ error: "Use a PDF, PNG or JPG." }, { status: 400 });
    return NextResponse.json(publicBuyer(await addFundsDoc(token, { name: f.name.slice(0, 120), mime: f.type, bytes: new Uint8Array(await f.arrayBuffer()) })));
  } catch (e) { return NextResponse.json({ error: (e as Error).message }, { status: 400 }); }
}

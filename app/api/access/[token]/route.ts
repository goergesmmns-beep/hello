import { NextResponse } from "next/server";
import { z } from "zod";
import { publicBuyer, requestCall, saveProfile, signNda, submitCapacity } from "@/lib/flow";

type C = { params: Promise<{ token: string }> };
const MAX = 4 * 1024 * 1024;
const types = ["application/pdf", "image/png", "image/jpeg"];
const profile = z.object({ action: z.literal("profile"), name: z.string().min(2).max(120), linkedin: z.string().max(200).optional(), website: z.string().max(200).optional(), why: z.string().min(10).max(1500), route: z.enum(["own", "company", "letter", "financing"]) });
const sign = z.object({ action: z.literal("sign"), signedName: z.string().min(2).max(120), agree: z.literal(true) });

export async function POST(req: Request, { params }: C) {
  const { token } = await params;
  try {
    if (req.headers.get("content-type")?.includes("multipart/form-data")) {
      const f = await req.formData();
      const text = (k: string) => (f.get(k) as string) || undefined;
      const up = f.get("file");
      let file;
      if (up instanceof File && up.size) {
        if (up.size > MAX) return NextResponse.json({ error: "Use a file under 4 MB." }, { status: 400 });
        if (!types.includes(up.type)) return NextResponse.json({ error: "Use a PDF, PNG or JPG." }, { status: 400 });
        file = { name: up.name.slice(0, 120), mime: up.type, bytes: new Uint8Array(await up.arrayBuffer()) };
      }
      const b = await submitCapacity(token, { plan: text("plan"), role: text("role"), acquisitions: text("acquisitions"), competitor: text("competitor"), notes: text("notes"), file });
      return NextResponse.json(publicBuyer(b));
    }
    const body = await req.json();
    if (body.action === "profile") { const { action, ...p } = profile.parse(body); void action; return NextResponse.json(publicBuyer(await saveProfile(token, p))); }
    if (body.action === "sign") {
      const s = sign.parse(body);
      const ip = (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
      return NextResponse.json(publicBuyer(await signNda(token, { signedName: s.signedName, ip, userAgent: req.headers.get("user-agent") ?? "unknown" })));
    }
    if (body.action === "call") return NextResponse.json(publicBuyer(await requestCall(token, body.note)));
    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch (e) {
    const msg = e instanceof z.ZodError ? "Check your answers and try again." : (e as Error).message;
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

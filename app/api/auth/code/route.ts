import { NextResponse } from "next/server";
import { z } from "zod";
import { sendCode } from "@/lib/accounts";
import { clientIp, limited } from "@/lib/limit";
const schema = z.object({ email: z.email().max(200), name: z.string().trim().max(120).optional() });
export async function POST(req: Request) {
  const stop = await limited(`code:${clientIp(req)}`, 12, 3600); if (stop) return stop;
  const p = schema.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  const again = await limited(`code-mail:${p.data.email.toLowerCase()}`, 5, 900); if (again) return again;
  const code = await sendCode(p.data.email, p.data.name);
  return NextResponse.json({ ok: true, ...(!process.env.VERCEL && process.env.NODE_ENV !== "production" ? { testCode: code } : {}) });
}

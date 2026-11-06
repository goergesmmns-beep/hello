import { NextResponse } from "next/server";
import { adminCookie, checkPassword, sessionValue } from "@/lib/admin";
import { clientIp, limited, resetLimit } from "@/lib/limit";
export async function POST(req: Request) {
  const key = `login:${clientIp(req)}`;
  const stop = await limited(key, 8, 900, "Too many sign-in attempts. Wait 15 minutes and try again.");
  if (stop) return stop;
  const { password } = await req.json().catch(() => ({}));
  if (!process.env.ADMIN_PASSWORD || typeof password !== "string" || !checkPassword(password)) return NextResponse.json({ error: "That password is not right." }, { status: 401 });
  await resetLimit(key);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(adminCookie, sessionValue(), { httpOnly: true, secure: new URL(req.url).protocol === "https:" || req.headers.get("x-forwarded-proto") === "https", sameSite: "strict", path: "/", maxAge: 60 * 60 * 12 });
  return res;
}

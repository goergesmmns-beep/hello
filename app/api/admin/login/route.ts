import { NextResponse } from "next/server";
import { adminCookie, checkPassword, sessionValue } from "@/lib/admin";
export async function POST(req: Request) {
  const { password } = await req.json().catch(() => ({}));
  if (!process.env.ADMIN_PASSWORD || typeof password !== "string" || !checkPassword(password)) return NextResponse.json({ error: "That password is not right." }, { status: 401 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(adminCookie, sessionValue(), { httpOnly: true, secure: new URL(req.url).protocol === "https:" || req.headers.get("x-forwarded-proto") === "https", sameSite: "strict", path: "/", maxAge: 60 * 60 * 12 });
  return res;
}

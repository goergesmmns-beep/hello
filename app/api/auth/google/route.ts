import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { googleReady, safeNext } from "@/lib/accounts";
import { siteUrl } from "@/lib/mail";
export async function GET(req: Request) {
  if (!googleReady()) return NextResponse.redirect(new URL("/login?error=google", req.url));
  const state = randomBytes(16).toString("hex"); const next = safeNext(new URL(req.url).searchParams.get("next"));
  (await cookies()).set("wb_oauth", `${state}|${next}`, { httpOnly: true, secure: new URL(req.url).protocol === "https:", sameSite: "lax", path: "/", maxAge: 600 });
  const u = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  u.search = new URLSearchParams({ client_id: process.env.GOOGLE_CLIENT_ID!, redirect_uri: `${siteUrl()}/api/auth/google/callback`, response_type: "code", scope: "openid email profile", state, prompt: "select_account" }).toString();
  return NextResponse.redirect(u);
}

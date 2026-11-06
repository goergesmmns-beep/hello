import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { findOrCreate, safeNext, startSession } from "@/lib/accounts";
import { siteUrl } from "@/lib/mail";
/** Exchanges Google's code, checks the ID token with Google, then signs the person in. */
export async function GET(req: Request) {
  const url = new URL(req.url); const jar = await cookies(); const [state, next] = (jar.get("wb_oauth")?.value ?? "").split("|"); jar.delete("wb_oauth");
  const fail = () => NextResponse.redirect(new URL("/login?error=google", req.url));
  if (!state || url.searchParams.get("state") !== state || !url.searchParams.get("code")) return fail();
  const tok = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ code: url.searchParams.get("code")!, client_id: process.env.GOOGLE_CLIENT_ID!, client_secret: process.env.GOOGLE_CLIENT_SECRET!, redirect_uri: `${siteUrl()}/api/auth/google/callback`, grant_type: "authorization_code" }) }).then((r) => r.json()).catch(() => null);
  if (!tok?.id_token) return fail();
  const info = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(tok.id_token)}`).then((r) => r.json()).catch(() => null);
  if (!info || info.aud !== process.env.GOOGLE_CLIENT_ID || info.email_verified !== "true" || !info.email) return fail();
  const u = await findOrCreate(info.email, { name: info.name, via: "google", photo: info.picture });
  await startSession(u, url.protocol === "https:");
  return NextResponse.redirect(new URL(u.onboarded ? safeNext(next) : `/account/welcome?next=${encodeURIComponent(safeNext(next))}`, req.url));
}

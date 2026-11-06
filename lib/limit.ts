import { NextResponse } from "next/server";
import { clearHits, hit } from "./store";

export const clientIp = (req: Request) => (req.headers.get("x-vercel-forwarded-for") ?? req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
/** Returns a 429 response once the limit is passed, otherwise null. A limiter fault never blocks a real buyer. */
export async function limited(key: string, max: number, seconds: number, message = "Too many attempts. Please wait a while and try again.") {
  try {
    const n = await hit(key, seconds);
    if (n > max) return NextResponse.json({ error: message }, { status: 429, headers: { "Retry-After": String(seconds) } });
  } catch (e) { console.error("Rate limit check failed", e); }
  return null;
}
export const resetLimit = (key: string) => clearHits(key).catch(console.error);

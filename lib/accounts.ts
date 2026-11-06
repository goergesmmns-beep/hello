import { createHash, createHmac, randomInt, randomUUID, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { sendMail } from "./mail";
import { deleteRecord, getRecord, listRecords, putRecord } from "./store";

export type BuyerProfile = { type?: "individual" | "searcher" | "strategic" | "investor"; budget?: string; sectors?: string[]; funding?: string; experience?: string; timeline?: string; about?: string };
export type User = {
  id: string; email: string; name: string; roles: ("buyer" | "seller")[]; createdAt: string; lastLoginAt?: string; via?: "code" | "google"; photo?: string;
  phone?: string; company?: string; title?: string; location?: string; linkedin?: string; website?: string;
  buyer?: BuyerProfile; saved: string[]; onboarded?: boolean;
};
const key = () => process.env.SETTINGS_KEY || process.env.ADMIN_PASSWORD || "local-dev-secret";
const COOKIE = "wb_user", DAYS = 30;
const sign = (v: string) => createHmac("sha256", key()).update(`wb-user-v1:${v}`).digest("hex");
export const normEmail = (e: string) => e.trim().toLowerCase();

export async function userById(id: string) { return getRecord<User>("user", id); }
export async function userByEmail(email: string) { const id = await getRecord<string>("user-email", normEmail(email)); return id ? userById(id) : null; }
export async function saveUser(u: User) { await putRecord("user", u.id, u); await putRecord("user-email", normEmail(u.email), u.id); return u; }
export async function allUsers() { return listRecords<User>("user"); }
export async function findOrCreate(email: string, i: { name?: string; via: "code" | "google"; photo?: string }) {
  const e = normEmail(email); let u = await userByEmail(e);
  if (!u) u = { id: randomUUID(), email: e, name: i.name?.trim() || e.split("@")[0], roles: [], saved: [], createdAt: new Date().toISOString() };
  u.lastLoginAt = new Date().toISOString(); u.via = i.via; if (i.photo) u.photo = i.photo; if (i.name && (!u.name || u.name === e.split("@")[0])) u.name = i.name;
  return saveUser(u);
}

/** Session cookie: user id, expiry and a signature. HttpOnly, so scripts never see it. */
export async function startSession(u: User, secure: boolean) {
  const exp = Date.now() + DAYS * 864e5; const v = `${u.id}.${exp}`;
  const jar = await cookies();
  jar.set(COOKIE, `${v}.${sign(v)}`, { httpOnly: true, secure, sameSite: "lax", path: "/", maxAge: DAYS * 86400 });
  jar.set("wb_who", encodeURIComponent(u.name.split(" ")[0] || "Account"), { secure, sameSite: "lax", path: "/", maxAge: DAYS * 86400 });
}
export async function endSession() { const jar = await cookies(); jar.delete(COOKIE); jar.delete("wb_who"); }
export async function currentUser(): Promise<User | null> {
  const raw = (await cookies()).get(COOKIE)?.value; if (!raw) return null;
  const [id, exp, sig] = raw.split("."); if (!id || !exp || !sig) return null;
  const want = sign(`${id}.${exp}`); if (sig.length !== want.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(want)) || Number(exp) < Date.now()) return null;
  return userById(id);
}

type Code = { hash: string; exp: number; tries: number; name?: string };
const hashCode = (email: string, code: string) => createHash("sha256").update(`${key()}:${normEmail(email)}:${code}`).digest("hex");
/** Six-digit code, valid 10 minutes, five tries. */
export async function sendCode(email: string, name?: string) {
  const code = String(randomInt(0, 1e6)).padStart(6, "0");
  await putRecord<Code>("login-code", normEmail(email), { hash: hashCode(email, code), exp: Date.now() + 10 * 6e4, tries: 0, name });
  await sendMail(normEmail(email), `${code} is your Westbound Road code`, `Your sign-in code is ${code}\n\nIt expires in 10 minutes. If you did not ask for it, ignore this email.\n\nWestbound Road`);
  return code;
}
export async function checkCode(email: string, code: string) {
  const e = normEmail(email); const c = await getRecord<Code>("login-code", e);
  if (!c || c.exp < Date.now()) return { ok: false as const, error: "That code has expired. Send a new one." };
  if (c.tries >= 5) return { ok: false as const, error: "Too many tries. Send a new code." };
  const good = c.hash.length === 64 && timingSafeEqual(Buffer.from(c.hash), Buffer.from(hashCode(e, code.replace(/\D/g, ""))));
  if (!good) { await putRecord("login-code", e, { ...c, tries: c.tries + 1 }); return { ok: false as const, error: "That code is not right. Check the email and try again." }; }
  await deleteRecord("login-code", e);
  return { ok: true as const, name: c.name };
}
export const googleReady = () => !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
export const safeNext = (n?: string | null) => (n && /^\/(?!\/)[\w\-/?=&.%]*$/.test(n) ? n : "/account");

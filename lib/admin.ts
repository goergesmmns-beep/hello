import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const secret = () => {
  const s = process.env.ADMIN_PASSWORD;
  if (!s) throw new Error("ADMIN_PASSWORD is not set.");
  return s;
};
const sign = () => createHmac("sha256", secret()).update("wbr-admin-v1").digest("hex");
export const adminCookie = "wbr_admin";
export function checkPassword(p: string) {
  const a = Buffer.from(p), b = Buffer.from(secret());
  return a.length === b.length && timingSafeEqual(a, b);
}
export const sessionValue = sign;
export async function isAdmin() {
  if (!process.env.ADMIN_PASSWORD) return false;
  const v = (await cookies()).get(adminCookie)?.value;
  return !!v && v === sign();
}

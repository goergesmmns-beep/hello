import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
const key = () => createHash("sha256").update(process.env.SETTINGS_KEY ?? process.env.ADMIN_PASSWORD ?? "").digest();
export function encrypt(text: string) {
  const iv = randomBytes(12); const c = createCipheriv("aes-256-gcm", key(), iv);
  const body = Buffer.concat([c.update(text, "utf8"), c.final()]);
  return [iv, c.getAuthTag(), body].map((b) => b.toString("base64")).join(".");
}
export function decrypt(value: string) {
  const [iv, tag, body] = value.split(".").map((p) => Buffer.from(p, "base64"));
  const d = createDecipheriv("aes-256-gcm", key(), iv); d.setAuthTag(tag);
  return Buffer.concat([d.update(body), d.final()]).toString("utf8");
}

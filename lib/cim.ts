import { getFile, getSetting, saveFile, setSetting } from "./store";
export type CimVersion = { v: number; name: string; at: string; size: number };
export const cimVersions = async (slug: string) => (await getSetting<CimVersion[]>(`cimmeta:${slug}`)) ?? [];
/** Saves a new CIM. The previous one is kept as a numbered version. */
export async function saveCim(slug: string, name: string, bytes: Uint8Array) {
  const list = await cimVersions(slug); const prev = await getFile(`cim:${slug}`); const at = new Date().toISOString();
  if (prev && !list.length) list.push({ v: 1, name: prev.name, at: prev.createdAt, size: prev.bytes.length });
  if (prev) await saveFile({ ...prev, id: `cimv:${slug}:${list.at(-1)!.v}` });
  const v = (list.at(-1)?.v ?? 0) + 1; list.push({ v, name, at, size: bytes.length });
  await saveFile({ id: `cim:${slug}`, kind: "cim", buyerId: slug, name, mime: "application/pdf", bytes, createdAt: at });
  await setSetting(`cimmeta:${slug}`, list); return v;
}
export async function cimBytes(slug: string, v?: number) {
  const list = await cimVersions(slug); const cur = list.at(-1)?.v;
  return (!v || v === cur ? await getFile(`cim:${slug}`) : await getFile(`cimv:${slug}:${v}`))?.bytes ?? null;
}

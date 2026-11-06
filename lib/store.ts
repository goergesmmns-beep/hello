import { promises as fs } from "fs";
import path from "path";
import postgres from "postgres";
import type { Buyer, StoredFile, Submission } from "./types";

/** Postgres on Vercel (DATABASE_URL). A local JSON file for development only. */
type Local = { settings?: Record<string, unknown>; hits?: Record<string, { start: number; count: number }>; buyers: Buyer[]; submissions: Submission[]; files: (Omit<StoredFile, "bytes"> & { b64: string })[] };
const localPath = path.join(process.cwd(), ".data", "store.json");

async function readLocal(): Promise<Local> {
  try { return JSON.parse(await fs.readFile(localPath, "utf8")); } catch { return { buyers: [], submissions: [], files: [] }; }
}
async function writeLocal(d: Local) {
  await fs.mkdir(path.dirname(localPath), { recursive: true });
  await fs.writeFile(localPath, JSON.stringify(d));
}
function useLocal() {
  if (process.env.DATABASE_URL) return false;
  if (process.env.VERCEL) throw new Error("DATABASE_URL is required on Vercel. Add a Postgres database in the project settings.");
  return true;
}

let client: ReturnType<typeof postgres> | null = null;
let ready: Promise<unknown> | null = null;
async function db() {
  client ??= postgres(process.env.DATABASE_URL!, { max: 3, prepare: false });
  const c = client;
  ready ??= (async () => {
    // Several requests can start together on a cold deploy, so one takes a lock while the tables are made.
    await c.begin(async (tx) => {
      await tx.unsafe("select pg_advisory_xact_lock(727401)");
      await tx.unsafe(`
    create table if not exists buyers (id text primary key, token text unique not null, email text not null, listing text not null, data jsonb not null, updated_at timestamptz not null default now());
    create table if not exists submissions (id text primary key, data jsonb not null);
    create table if not exists settings (key text primary key, value jsonb not null);
    create table if not exists rate_limits (key text primary key, window_start timestamptz not null, count int not null);
    create table if not exists files (id text primary key, buyer_id text not null, kind text not null, name text not null, mime text not null, bytes bytea not null, created_at timestamptz not null default now());
  `);
    });
  })().catch((e) => { ready = null; throw e; });
  await ready;
  return client;
}

export async function saveBuyer(b: Buyer) {
  b.updatedAt = new Date().toISOString();
  if (useLocal()) {
    const d = await readLocal();
    d.buyers = [b, ...d.buyers.filter((x) => x.id !== b.id)];
    return writeLocal(d);
  }
  const sql = await db();
  await sql`insert into buyers (id, token, email, listing, data, updated_at) values (${b.id}, ${b.token}, ${b.email}, ${b.listingSlug}, ${sql.json(b as never)}, now())
    on conflict (id) do update set data = excluded.data, updated_at = now()`;
}
export async function buyerByToken(token: string) {
  if (useLocal()) return (await readLocal()).buyers.find((b) => b.token === token) ?? null;
  const sql = await db();
  const r = await sql`select data from buyers where token = ${token}`;
  return (r[0]?.data as Buyer) ?? null;
}
export async function buyerById(id: string) {
  if (useLocal()) return (await readLocal()).buyers.find((b) => b.id === id) ?? null;
  const sql = await db();
  const r = await sql`select data from buyers where id = ${id}`;
  return (r[0]?.data as Buyer) ?? null;
}
export async function buyerByEmail(email: string, listing: string) {
  if (useLocal()) return (await readLocal()).buyers.find((b) => b.email === email && b.listingSlug === listing) ?? null;
  const sql = await db();
  const r = await sql`select data from buyers where email = ${email} and listing = ${listing}`;
  return (r[0]?.data as Buyer) ?? null;
}
export async function allBuyers() {
  if (useLocal()) return (await readLocal()).buyers;
  const sql = await db();
  const r = await sql`select data from buyers order by updated_at desc limit 500`;
  return r.map((x) => x.data as Buyer);
}
export async function saveSubmission(s: Submission) {
  if (useLocal()) { const d = await readLocal(); d.submissions = [s, ...d.submissions.filter((x) => x.id !== s.id)].sort((a, b) => b.createdAt.localeCompare(a.createdAt)); return writeLocal(d); }
  const sql = await db();
  await sql`insert into submissions (id, data) values (${s.id}, ${sql.json(s as never)}) on conflict (id) do update set data = excluded.data`;
}
export async function allSubmissions() {
  if (useLocal()) return (await readLocal()).submissions;
  const sql = await db();
  const r = await sql`select data from submissions order by data->>'createdAt' desc limit 200`;
  return r.map((x) => x.data as Submission);
}
export async function saveFile(f: StoredFile) {
  if (useLocal()) { const d = await readLocal(); const { bytes, ...rest } = f; d.files = d.files.filter((x) => x.id !== f.id); d.files.push({ ...rest, b64: Buffer.from(bytes).toString("base64") }); return writeLocal(d); }
  const sql = await db();
  await sql`insert into files (id, buyer_id, kind, name, mime, bytes) values (${f.id}, ${f.buyerId}, ${f.kind}, ${f.name}, ${f.mime}, ${Buffer.from(f.bytes)})
    on conflict (id) do update set name = excluded.name, mime = excluded.mime, bytes = excluded.bytes, created_at = now()`;
}
export async function getFile(id: string): Promise<StoredFile | null> {
  if (useLocal()) {
    const f = (await readLocal()).files.find((x) => x.id === id);
    if (!f) return null;
    const { b64, ...rest } = f;
    return { ...rest, bytes: new Uint8Array(Buffer.from(b64, "base64")) };
  }
  const sql = await db();
  const r = await sql`select * from files where id = ${id}`;
  if (!r[0]) return null;
  const x = r[0];
  return { id: x.id, buyerId: x.buyer_id, kind: x.kind, name: x.name, mime: x.mime, bytes: new Uint8Array(x.bytes), createdAt: new Date(x.created_at).toISOString() };
}
/** Bank letters are deleted after the retention period. Signed NDAs are kept. */
export async function purgeCapacityFiles(days: number) {
  const cutoff = Date.now() - days * 864e5;
  if (useLocal()) {
    const d = await readLocal();
    const before = d.files.length;
    d.files = d.files.filter((f) => f.kind !== "capacity" || new Date(f.createdAt).getTime() > cutoff);
    await writeLocal(d);
    return before - d.files.length;
  }
  const sql = await db();
  const r = await sql`delete from files where kind = 'capacity' and created_at < ${new Date(cutoff)}`;
  return r.count;
}

export async function getSetting<T>(key: string): Promise<T | null> {
  if (useLocal()) return ((await readLocal()).settings?.[key] as T) ?? null;
  const sql = await db();
  const r = await sql`select value from settings where key = ${key}`;
  return (r[0]?.value as T) ?? null;
}
export async function setSetting(key: string, value: unknown | null) {
  if (useLocal()) { const d = await readLocal(); d.settings ??= {}; if (value === null) delete d.settings[key]; else d.settings[key] = value; return writeLocal(d); }
  const sql = await db();
  if (value === null) { await sql`delete from settings where key = ${key}`; return; }
  await sql`insert into settings (key, value) values (${key}, ${sql.json(value as never)}) on conflict (key) do update set value = excluded.value`;
}

export async function fileIds(prefix: string) {
  if (useLocal()) return (await readLocal()).files.filter((f) => f.id.startsWith(prefix)).map((f) => f.id);
  const sql = await db();
  const r = await sql`select id from files where id like ${prefix + "%"}`;
  return r.map((x) => x.id as string);
}
/** Counts an attempt inside a fixed time window and returns the running total. */
export async function hit(key: string, seconds: number) {
  if (useLocal()) {
    const d = await readLocal(); d.hits ??= {};
    const now = Date.now(), cur = d.hits[key];
    const next = cur && now - cur.start < seconds * 1000 ? { start: cur.start, count: cur.count + 1 } : { start: now, count: 1 };
    d.hits[key] = next; await writeLocal(d);
    return next.count;
  }
  const sql = await db();
  const cutoff = new Date(Date.now() - seconds * 1000);
  const r = await sql`insert into rate_limits (key, window_start, count) values (${key}, now(), 1)
    on conflict (key) do update set
      count = case when rate_limits.window_start < ${cutoff} then 1 else rate_limits.count + 1 end,
      window_start = case when rate_limits.window_start < ${cutoff} then now() else rate_limits.window_start end
    returning count`;
  return r[0].count as number;
}
export async function clearHits(key: string) {
  if (useLocal()) { const d = await readLocal(); if (d.hits) delete d.hits[key]; return writeLocal(d); }
  const sql = await db();
  await sql`delete from rate_limits where key = ${key}`;
}
export async function deleteFile(id: string) {
  if (useLocal()) { const d = await readLocal(); d.files = d.files.filter((f) => f.id !== id); return writeLocal(d); }
  const sql = await db();
  await sql`delete from files where id = ${id}`;
}

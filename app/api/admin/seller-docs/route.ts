import { isAdmin } from "@/lib/admin";
import { getFile } from "@/lib/store";
export async function GET(req: Request) {
  if (!(await isAdmin())) return new Response("Sign in again.", { status: 401 });
  const id = new URL(req.url).searchParams.get("file") ?? ""; if (!id.startsWith("sl:")) return new Response("Not found", { status: 404 });
  const f = await getFile(id); if (!f) return new Response("Not found", { status: 404 });
  return new Response(Buffer.from(f.bytes), { headers: { "Content-Type": f.mime, "Content-Disposition": `inline; filename="${f.name.replace(/[^\w .-]/g, "")}"`, "Cache-Control": "no-store" } });
}

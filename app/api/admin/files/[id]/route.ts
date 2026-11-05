import { isAdmin } from "@/lib/admin";
import { getFile } from "@/lib/store";
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return new Response("Sign in again.", { status: 401 });
  const f = await getFile((await params).id);
  if (!f) return new Response("This file was removed.", { status: 404 });
  return new Response(Buffer.from(f.bytes), { headers: { "Content-Type": f.mime, "Content-Disposition": "inline", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
}

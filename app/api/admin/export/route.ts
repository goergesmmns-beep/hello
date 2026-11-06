import { catalog } from "@/lib/catalog";
import { isAdmin } from "@/lib/admin";
import { csv } from "@/lib/analytics";
import { allBuyers, allSubmissions } from "@/lib/store";
export async function GET(req: Request) {
  if (!(await isAdmin())) return new Response("Sign in again.", { status: 401 });
  const type = new URL(req.url).searchParams.get("type");
  const cat = await catalog();
  if (type === "ndas") { const r = [["Signed", "Signer", "Email", "Listing", "Method", "IP", "NDA version", "Fingerprint"], ...(await allBuyers()).filter((b) => b.nda).map((b) => [b.nda!.signedAt, b.nda!.signedName, b.email, cat.find((l) => l.slug === b.listingSlug)?.title, b.nda!.method ?? "typed", b.nda!.ip, b.nda!.version, b.nda!.hash])]; return new Response(csv(r), { headers: { "Content-Type": "text/csv", "Content-Disposition": `attachment; filename="westbound-nda-register.csv"`, "Cache-Control": "no-store" } }); }
  const rows = type === "inbox"
    ? [["Date", "Type", "Name", "Email", "Company", "Handled"], ...(await allSubmissions()).map((s) => [s.createdAt, s.kind, s.fields.name, s.fields.email, s.fields.company, s.handled ? "Yes" : "No"])]
    : [["Created", "Name", "Email", "Phone", "Company", "Listing", "Stage", "Route", "Source", "NDA signed", "CIM opens"], ...(await allBuyers()).map((b) => [b.createdAt, b.name, b.email, b.phone, b.company, cat.find((l) => l.slug === b.listingSlug)?.title, b.stage, b.route, b.source, b.nda?.signedAt, b.cimViews])];
  return new Response(csv(rows), { headers: { "Content-Type": "text/csv", "Content-Disposition": `attachment; filename="westbound-${type === "inbox" ? "inbox" : "buyers"}.csv"`, "Cache-Control": "no-store" } });
}

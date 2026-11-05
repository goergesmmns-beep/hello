import { getListing } from "@/content/listings";
import { isAdmin } from "@/lib/admin";
import { csv } from "@/lib/analytics";
import { allBuyers, allSubmissions } from "@/lib/store";
export async function GET(req: Request) {
  if (!(await isAdmin())) return new Response("Sign in again.", { status: 401 });
  const type = new URL(req.url).searchParams.get("type");
  const rows = type === "inbox"
    ? [["Date", "Type", "Name", "Email", "Company", "Handled"], ...(await allSubmissions()).map((s) => [s.createdAt, s.kind, s.fields.name, s.fields.email, s.fields.company, s.handled ? "Yes" : "No"])]
    : [["Created", "Name", "Email", "Phone", "Company", "Listing", "Stage", "Route", "Source", "NDA signed", "CIM opens"], ...(await allBuyers()).map((b) => [b.createdAt, b.name, b.email, b.phone, b.company, getListing(b.listingSlug)?.title, b.stage, b.route, b.source, b.nda?.signedAt, b.cimViews])];
  return new Response(csv(rows), { headers: { "Content-Type": "text/csv", "Content-Disposition": `attachment; filename="westbound-${type === "inbox" ? "inbox" : "buyers"}.csv"`, "Cache-Control": "no-store" } });
}

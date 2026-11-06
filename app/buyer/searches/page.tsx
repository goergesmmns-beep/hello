import { PageTitle } from "@/components/desk/panel";
import { Searches } from "@/components/portal/searches";
import { matches } from "@/lib/alerts";
import { publicListings } from "@/lib/catalog";
import { me } from "@/lib/my";
export const metadata = { title: "Saved searches" };
export default async function SearchesPage() {
  const u = await me("/buyer/searches"); const open = (await publicListings()).filter((l) => l.status !== "pending"); const rows = u.searches ?? [];
  return <><PageTitle title="Saved searches" sub="We email you once for each new listing that matches a search with alerts on." /><Searches rows={rows} counts={Object.fromEntries(rows.map((s) => [s.id, open.filter((l) => matches(s, l)).length]))} /></>;
}

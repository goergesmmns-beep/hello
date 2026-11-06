import Link from "next/link";
import { notFound } from "next/navigation";
import { ListingEditor } from "@/components/desk/listing-editor";
import { PageTitle } from "@/components/desk/panel";
import { findListing } from "@/lib/catalog";
import { ruleFor } from "@/lib/rules";
import { fileIds } from "@/lib/store";
import { roomDocs } from "@/lib/flow";
export const dynamic = "force-dynamic";
export default async function Edit({ params }: { params: Promise<{ slug: string }> }) {
  const l = await findListing((await params).slug);
  if (!l) notFound();
  const rule = await ruleFor(l);
  const hasCim = (await fileIds(`cim:${l.slug}`)).length > 0;
  return <><Link href="/admin/listings" className="text-sm text-muted-foreground hover:text-foreground">Listings</Link><PageTitle title={l.title}>{l.status !== "draft" && <Link className="btn btn-ghost !min-h-10" target="_blank" href={`/buy/${l.slug}`}>View public page</Link>}</PageTitle><ListingEditor listing={{ ...l, ...rule }} hasCim={hasCim} docs={await roomDocs(l.slug)} /></>;
}

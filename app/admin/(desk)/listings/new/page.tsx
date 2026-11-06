import Link from "next/link";
import { ListingEditor } from "@/components/desk/listing-editor";
import { PageTitle } from "@/components/desk/shell";
export default function New() { return <><Link href="/admin/listings" className="text-sm text-muted-foreground hover:text-foreground">Listings</Link><PageTitle title="Add listing" sub="New listings stay hidden until you publish them." /><ListingEditor /></>; }

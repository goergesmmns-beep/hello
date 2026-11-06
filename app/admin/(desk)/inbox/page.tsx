import { InboxList } from "@/components/desk/inbox";
import { PageTitle } from "@/components/desk/panel";
import { allSubmissions } from "@/lib/store";
export const dynamic = "force-dynamic";
export default async function Inbox() { return <><PageTitle title="Inbox" sub="Seller inquiries, valuation requests, contact forms and newsletter signups." /><InboxList items={await allSubmissions()} /></>; }

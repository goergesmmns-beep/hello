import { Thread } from "@/components/account/thread";
import { Card, Empty, PageTitle } from "@/components/desk/panel";
import { me } from "@/lib/my";
import { sellerCtx, subTitle } from "@/lib/seller-portal";
export const metadata = { title: "Messages" };
export default async function Messages() {
  const u = await me("/seller/messages"); const { cur } = await sellerCtx(u);
  return <><PageTitle title="Messages" sub="Your private line to your Westbound Road advisor. Replies also arrive by email." />{cur ? <div className="max-w-3xl"><Card title={subTitle(cur)} icon={undefined}><Thread messages={cur.messages} endpoint={`/api/account/sell/${cur.id}`} me="seller" /></Card></div> : <Empty title="No conversation yet" text="Start a listing and your advisor thread opens with it." />}</>;
}

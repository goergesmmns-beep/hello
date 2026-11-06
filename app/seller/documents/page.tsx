import { Empty, PageTitle } from "@/components/desk/panel";
import { SellerDocs } from "@/components/portal/seller-docs";
import { me } from "@/lib/my";
import { sellerCtx } from "@/lib/seller-portal";
export const metadata = { title: "Documents" };
export default async function Docs() {
  const u = await me("/seller/documents"); const { cur } = await sellerCtx(u);
  return <><PageTitle title="Documents" sub="Financials, tax returns and anything else your advisor needs." />{cur ? <SellerDocs id={cur.id} docs={cur.docs} canDelete={cur.status === "draft" || cur.status === "changes"} /> : <Empty title="Start a listing first" text="Documents belong to a business. Start your listing and upload them there." />}</>;
}

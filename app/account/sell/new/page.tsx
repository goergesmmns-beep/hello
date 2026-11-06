import { redirect } from "next/navigation";
import { saveUser } from "@/lib/accounts";
import { me } from "@/lib/my";
import { blankSub, saveSub, subsFor } from "@/lib/seller";
export const dynamic = "force-dynamic";
/** Opens the empty draft already started, or starts one. */
export default async function New() {
  const u = await me("/account/sell/new");
  const open = (await subsFor(u.id)).find((s) => s.status === "draft" && !s.business.name);
  if (open) redirect(`/account/sell/${open.id}`);
  if (!u.roles.includes("seller")) { u.roles = [...u.roles, "seller"]; await saveUser(u); }
  const s = await saveSub(blankSub(u)); redirect(`/account/sell/${s.id}`);
}

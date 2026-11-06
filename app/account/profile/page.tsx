import { redirect } from "next/navigation";
import { portalOf } from "@/lib/accounts";
import { me } from "@/lib/my";
export const dynamic = "force-dynamic";
export default async function R() { const u = await me(); redirect(portalOf(u) === "/seller" ? "/seller/profile" : "/buyer/profile"); }

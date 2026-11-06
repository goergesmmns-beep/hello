import { redirect } from "next/navigation";
import { portalOf } from "@/lib/accounts";
import { me } from "@/lib/my";
export const dynamic = "force-dynamic";
/** Sends each account to its own dashboard: buyers to /buyer, sellers to /seller. */
export default async function Account() { const u = await me(); redirect(u.onboarded ? portalOf(u) : "/account/welcome"); }

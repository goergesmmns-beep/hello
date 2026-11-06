import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Activate } from "@/components/portal/common";
import { BuyerShell } from "@/components/portal/buyer-shell";
import { DeskTheme } from "@/components/desk/theme";
import { buyerCounts, me } from "@/lib/my";
export const dynamic = "force-dynamic";
export const metadata = { title: { default: "Buyer dashboard", template: "%s · Buyer · Westbound Road" }, robots: { index: false } };
export default async function L({ children }: { children: React.ReactNode }) {
  const u = await me("/buyer"); if (!u.onboarded) redirect("/account/welcome?next=/buyer");
  const t = (await cookies()).get("desk_theme")?.value === "light" ? "light" : "dark";
  const user = { name: u.name, email: u.email, photo: u.photo, roles: u.roles };
  if (!u.roles.includes("buyer")) return <DeskTheme initial={t}><Activate role="buyer" points={["Browse every listing with filters and saved searches", "Sign NDAs on any device and open private deal rooms", "Your seller dashboard stays separate"]} /></DeskTheme>;
  return <DeskTheme initial={t}><BuyerShell user={user} counts={await buyerCounts(u)}>{children}</BuyerShell></DeskTheme>;
}

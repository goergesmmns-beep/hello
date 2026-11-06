import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Activate } from "@/components/portal/common";
import { SellerShell } from "@/components/portal/seller-shell";
import { DeskTheme } from "@/components/desk/theme";
import { me } from "@/lib/my";
import { sellerCtx } from "@/lib/seller-portal";
export const dynamic = "force-dynamic";
export const metadata = { title: { default: "Seller dashboard", template: "%s · Seller · Westbound Road" }, robots: { index: false } };
export default async function L({ children }: { children: React.ReactNode }) {
  const u = await me("/seller"); if (!u.onboarded) redirect("/account/welcome?next=/seller");
  const t = (await cookies()).get("desk_theme")?.value === "light" ? "light" : "dark";
  const user = { name: u.name, email: u.email, photo: u.photo, roles: u.roles };
  if (!u.roles.includes("seller")) return <DeskTheme initial={t}><Activate role="seller" points={["List your business privately with an advisor", "See views, NDAs and offers as they happen", "Your buyer dashboard stays separate"]} /></DeskTheme>;
  const c = await sellerCtx(u);
  return <DeskTheme initial={t}><SellerShell user={user} listings={c.items} current={c.current} badges={c.badges}>{children}</SellerShell></DeskTheme>;
}

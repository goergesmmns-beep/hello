import { cookies } from "next/headers";
import { AccountShell } from "@/components/account/shell";
import { DeskTheme } from "@/components/desk/theme";
import { me, myCounts } from "@/lib/my";
export const dynamic = "force-dynamic";
export const metadata = { title: "Your account", robots: { index: false } };
export default async function L({ children }: { children: React.ReactNode }) {
  const u = await me(); const counts = await myCounts(u);
  const t = (await cookies()).get("desk_theme")?.value === "light" ? "light" : "dark";
  return <DeskTheme initial={t}><AccountShell user={{ name: u.name, email: u.email, photo: u.photo, seller: u.roles.includes("seller") }} counts={counts}>{children}</AccountShell></DeskTheme>;
}

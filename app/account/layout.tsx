import { cookies } from "next/headers";
import { AccountShell } from "@/components/account/shell";
import { DeskTheme } from "@/components/desk/theme";
import { me, myCounts } from "@/lib/my";
export const dynamic = "force-dynamic";
export const metadata = { title: "Your account", robots: { index: false } };
export default async function L({ children }: { children: React.ReactNode }) {
  const u = await me(); const counts = await myCounts(u);
  const jar = await cookies(); const t = jar.get("desk_theme")?.value === "light" ? "light" : "dark";
  const m = jar.get("wb_mode")?.value; const mode = m === "selling" || m === "buying" ? m : u.roles.includes("seller") && !u.roles.includes("buyer") ? "selling" : "buying";
  return <DeskTheme initial={t}><AccountShell user={{ name: u.name, email: u.email, photo: u.photo, seller: u.roles.includes("seller") }} counts={counts} mode={mode}>{children}</AccountShell></DeskTheme>;
}

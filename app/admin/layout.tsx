import { cookies } from "next/headers";
import { DeskTheme } from "@/components/desk/theme";
export default async function L({ children }: { children: React.ReactNode }) {
  const t = (await cookies()).get("desk_theme")?.value === "light" ? "light" : "dark";
  return <DeskTheme initial={t}>{children}</DeskTheme>;
}

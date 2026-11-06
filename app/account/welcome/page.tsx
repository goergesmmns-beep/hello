import { cookies } from "next/headers";
import { Onboard } from "@/components/account/onboard";
import { DeskTheme } from "@/components/desk/theme";
import { Mark } from "@/components/portal/common";
import { safeNext } from "@/lib/accounts";
import { me } from "@/lib/my";
export const dynamic = "force-dynamic";
export const metadata = { title: "Welcome", robots: { index: false } };
export default async function Welcome({ searchParams }: { searchParams: Promise<{ next?: string; intent?: string }> }) {
  const u = await me("/account/welcome"); const sp = await searchParams; const t = (await cookies()).get("desk_theme")?.value === "light" ? "light" : "dark";
  const next = safeNext(sp.next); const intent = sp.intent === "sell" || next.startsWith("/seller") ? "seller" : sp.intent === "buy" || next.startsWith("/buyer") || next.startsWith("/buy/") ? "buyer" : undefined;
  return <DeskTheme initial={t}><div className="min-h-dvh bg-background"><header className="mx-auto flex h-16 max-w-3xl items-center gap-2.5 px-5"><Mark /><span className="text-[15px] font-semibold tracking-tight">Westbound Road</span></header><main className="px-5 pb-20 pt-6 md:pt-10"><Onboard name={u.name.includes("@") ? "" : u.name} next={next} intent={intent} /></main></div></DeskTheme>;
}

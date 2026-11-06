import { Onboard } from "@/components/account/onboard";
import { safeNext } from "@/lib/accounts";
import { me } from "@/lib/my";
export default async function Welcome({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const u = await me(); return <Onboard name={u.name.includes("@") ? "" : u.name} next={safeNext((await searchParams).next)} />;
}

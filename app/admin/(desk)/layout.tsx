import { redirect } from "next/navigation";
import { Shell } from "@/components/desk/shell";
import { isAdmin } from "@/lib/admin";
import { allBuyers, allSubmissions } from "@/lib/store";

export const dynamic = "force-dynamic";
export default async function Desk({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) redirect("/admin/login");
  const [b, s] = await Promise.all([allBuyers(), allSubmissions()]);
  return <Shell review={b.filter((x) => x.stage === "review" && !x.archived).length} inbox={s.filter((x) => !x.handled).length}>{children}</Shell>;
}

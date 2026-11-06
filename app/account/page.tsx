import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ArrowRight, BadgeCheck, Bookmark, BriefcaseBusiness, FileSignature, Store, UserRound } from "lucide-react";
import { DealCard } from "@/components/account/deal-card";
import { Card, Empty } from "@/components/desk/panel";
import { ListingCard } from "@/components/listing-card";
import { money } from "@/content/listings";
import { publicListings } from "@/lib/catalog";
import { me, myDeals } from "@/lib/my";
import { subLabels, subsFor } from "@/lib/seller";
const budgetMax: Record<string, number> = { "Under $250K": 25e4, "$250K to $1M": 1e6, "$1M to $5M": 5e6, "$5M to $20M": 2e7, "$20M and up": 1e12 };
export default async function Overview() {
  const u = await me();
  // Sellers who chose Selling land on their listings, not the buyer overview.
  const m = (await cookies()).get("wb_mode")?.value;
  if (m === "selling" || (!m && u.roles.includes("seller") && !u.roles.includes("buyer"))) redirect("/account/sell"); const [deals, list, subs] = await Promise.all([myDeals(u), publicListings(), subsFor(u.id)]);
  const verified = deals.filter((d) => d.funds?.status === "verified" && (d.funds.expiresAt ?? "") > new Date().toISOString()).sort((a, b) => (b.funds!.verifiedUsd ?? 0) - (a.funds!.verifiedUsd ?? 0))[0];
  const max = budgetMax[u.buyer?.budget ?? ""] ?? Infinity; const sec = (u.buyer?.sectors ?? []).map((s) => s.toLowerCase());
  const matches = list.filter((l) => l.status !== "pending" && !deals.some((d) => d.listingSlug === l.slug) && (l.askUsd ?? 0) <= max * 1.2 && (!sec.length || sec.some((s) => l.category.toLowerCase().includes(s) || s.includes(l.category.toLowerCase())))).slice(0, 3);
  const fields = [u.phone, u.company, u.linkedin, u.location, u.buyer?.type, u.buyer?.budget, u.buyer?.sectors?.length, u.buyer?.funding, u.buyer?.about]; const done = Math.round((fields.filter(Boolean).length / fields.length) * 100);
  const stat = (I: typeof Store, k: string, v: string | number, s: string, href: string) => <Link href={href} className="panel transition-transform hover:-translate-y-0.5"><div className="well !p-4"><p className="flex items-center gap-2 text-[13px] text-muted-foreground"><I size={15} />{k}</p><p className="num mt-2 text-[30px] font-semibold leading-none">{v}</p><p className="mt-2 text-xs text-muted-foreground">{s}</p></div></Link>;
  return <>
    <div className="mb-6"><h1 className="text-[26px] font-semibold tracking-tight">Welcome back, {u.name.split(" ")[0]}<span className="font-normal text-muted-foreground"> · here is where your deals stand</span></h1></div>
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stat(BriefcaseBusiness, "Active deals", deals.filter((d) => d.stage !== "warm").length, `${deals.filter((d) => d.stage === "cim" || d.stage === "call").length} in a deal room`, "/account/deals")}
      {stat(FileSignature, "NDAs signed", deals.filter((d) => d.nda).length, "Copies in your account", "/account/ndas")}
      {stat(BadgeCheck, "Verified funds", verified ? money(verified.funds!.verifiedUsd ?? 0) : "None yet", verified ? `Valid until ${verified.funds!.expiresAt!.slice(0, 10)}` : "Verified on your first deal", "/account/deals")}
      {stat(Bookmark, "Saved", u.saved.length, "Listings you are watching", "/account/saved")}
    </div>
    <div className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <Card title="Your deals" action={<Link href="/account/deals" className="tbtn !h-8 !px-2.5 !text-[13px]">All</Link>}>{deals.length ? <div className="-m-1 grid gap-3">{deals.slice(0, 3).map((d) => <DealCard key={d.id} b={d} l={list.find((l) => l.slug === d.listingSlug)} />)}</div> : <Empty title="No deals yet" text="Request a listing and your NDA, deal room and documents will show up here." />}</Card>
      <div className="grid content-start gap-3">
        <Card title="Profile strength" icon={UserRound}><div className="flex items-end justify-between"><p className="num text-[30px] font-semibold leading-none">{done}%</p><Link href="/account/profile" className="text-sm font-medium underline-offset-4 hover:underline">Complete profile</Link></div><span className="mt-4 block h-2 overflow-hidden rounded-full bg-muted"><i className="grad-bar block h-full rounded-full" style={{ width: `${done}%` }} /></span><p className="mt-3 text-sm text-muted-foreground">A complete profile skips steps on every new listing, and advisors review you faster.</p></Card>
        <Card title="Selling" icon={Store} action={<Link href="/account/sell/new" className="tbtn !h-8 !px-2.5 !text-[13px]">New</Link>}>{subs.length ? <ul className="space-y-2.5">{subs.slice(0, 3).map((s) => <li key={s.id}><Link href={`/account/sell/${s.id}`} className="flex items-center justify-between gap-3 hover:text-c-orange"><span className="truncate font-medium">{s.business.publicTitle || s.business.name || "Untitled draft"}</span><span className="shrink-0 rounded-full border bg-surface-1 px-2.5 py-0.5 text-xs">{subLabels[s.status]}</span></Link></li>)}</ul> : <div><p className="text-sm text-muted-foreground">Thinking of selling? Submit your business privately. Nothing goes public until you approve it.</p><Link href="/account/sell/new" className="btn btn-ghost mt-4 !min-h-9 !text-sm">List a business <ArrowRight size={15} /></Link></div>}</Card>
      </div>
    </div>
    {matches.length > 0 && <section className="mt-8"><div className="mb-4 flex items-end justify-between"><div><h2 className="text-xl font-semibold tracking-tight">Matches for you</h2><p className="text-sm text-muted-foreground">Based on your budget and sectors.</p></div><Link href="/buy" className="text-sm font-medium hover:underline">Browse all</Link></div><div className="grid gap-4 md:grid-cols-3">{matches.map((l) => <ListingCard key={l.slug} l={l} />)}</div></section>}
  </>;
}

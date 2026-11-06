import { soldDeals as past } from "@/content/site";
import { soldListings } from "@/lib/catalog";

function Row({ deals, rev }: { deals: readonly (readonly [string, string])[]; rev?: boolean }) {
  return (
    <div className={`tape ${rev ? "rev" : ""}`}>
      {[...deals, ...deals].map(([t, c], i) => (
        <article key={i} aria-hidden={i >= deals.length} className="w-[250px] shrink-0 rounded-lg border bg-background p-4 transition-transform hover:-translate-y-1 hover:border-foreground/40">
          <div className="flex items-center justify-between"><span className="eyebrow !text-[11px]">{c}</span><span className="num rounded bg-brand px-1.5 py-0.5 text-[11px] font-semibold text-brand-foreground">SOLD</span></div>
          <h3 className="mt-3 text-[17px] font-semibold leading-snug tracking-tight">{t}</h3>
        </article>
      ))}
    </div>
  );
}
export async function SoldWall() {
  const soldDeals = [...(await soldListings()).map((l) => [l.title, l.category] as const), ...past];
  const half = Math.ceil(soldDeals.length / 2);
  return (
    <section className="overflow-hidden border-y bg-muted py-16 md:py-24">
      <div className="wrap mb-9 flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow mb-3">Closed deals</p><h2 className="h2 max-w-3xl">{soldDeals.length} recent exits across SaaS, DTC, agencies and more.</h2></div></div>
      <div className="tape-wrap space-y-2.5"><Row deals={soldDeals.slice(0, half)} /><Row deals={soldDeals.slice(half)} rev /></div>
    </section>
  );
}

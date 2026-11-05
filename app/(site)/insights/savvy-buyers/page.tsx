import type { Metadata } from "next";
import { PageHead, Cta } from "@/components/ui";
export const metadata: Metadata = { title: "3 quick tips and 3 telling questions for savvy buyers" };
const tips = [
  ["Always ask for the deal you want", "In acquisitions, assumptions can be costly. Many sellers may not realize the extent of their own flexibility until presented with a well-crafted offer. If your offer is below full price or uses creative terms, put it in a formal LOI."],
  ["Be ready with personal information", "Sellers often want a glimpse of the buyer's background before sharing sensitive information. Have your LinkedIn profile, current company website and a compelling personal statement ready."],
  ["Manage your enthusiasm", "Sharing all of your growth ideas upfront can weaken your bargaining position. We have seen sellers pull a business off the market to grow it themselves."],
];
const qs = ["How much time will this business require from me?", "What specific skills or expertise do I have that can elevate this business beyond its current state?", "Does the business excite me, or is it just a good investment?"];
export default function Post() {
  return (<><PageHead eyebrow="Becky Smith · Partner and M&A Advisor" title="3 quick tips and 3 telling questions for savvy buyers" />
    <article className="wrap grid gap-12 py-14 md:grid-cols-2 md:py-20"><section><h2 className="mb-5 text-3xl font-semibold">3 quick tips</h2><div className="space-y-6">{tips.map(([h, t]) => <div key={h}><h3 className="text-xl font-semibold">{h}</h3><p className="mt-1.5 leading-relaxed text-muted-foreground">{t}</p></div>)}</div></section><section><h2 className="mb-5 text-3xl font-semibold">3 telling questions</h2><ol className="border-t">{qs.map((q, i) => <li key={q} className="grid grid-cols-[40px_1fr] border-b py-4 text-lg"><span className="num text-brand-ink">{i + 1}</span>{q}</li>)}</ol></section></article>
    <Cta title="The good ones do not last long." text="Be ready to move when you find the right business." href="/buy" label="See current listings" /></>);
}

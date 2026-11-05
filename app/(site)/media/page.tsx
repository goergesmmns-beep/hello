import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { PageHead } from "@/components/ui";
import { media } from "@/content/site";
export const metadata: Metadata = { title: "Media" };
export default function Media() {
  return (<><PageHead eyebrow="Media" title="Interviews, podcasts and articles." />
    <section className="wrap py-14 md:py-20"><ul className="border-t">{media.map(([t, k, u]) => <li key={u}><a href={u} target="_blank" rel="noreferrer" className="group grid grid-cols-[1fr_24px] gap-4 border-b py-5 md:grid-cols-[110px_1fr_24px]"><span className="eyebrow hidden pt-1 md:block">{k}</span><span className="text-xl font-medium tracking-tight">{t}</span><ArrowUpRight size={20} className="group-hover:text-brand-ink" /></a></li>)}</ul></section></>);
}

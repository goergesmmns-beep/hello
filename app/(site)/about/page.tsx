import type { Metadata } from "next";
import { Cta, PageHead } from "@/components/ui";
export const metadata: Metadata = { title: "About" };
export default function About() {
  return (<>
    <PageHead eyebrow="About" title="Save jobs, grow companies and add enterprise value." lede="Westbound Road helps people buy and sell digital businesses, including e-commerce, software and SaaS, and marketing and business-services agencies, for clients around the world." />
    <section className="wrap grid gap-10 py-16 md:grid-cols-2 md:py-24">
      <div><h2 className="text-3xl font-semibold">For sellers</h2><p className="mt-3 text-muted-foreground">A complimentary strategy session covers timing, pricing, risk, and how to handle employee and customer communication during a sale.</p></div>
      <div><h2 className="text-3xl font-semibold">For buyers</h2><p className="mt-3 text-muted-foreground">We help companies decide if acquisition fits their growth plans, when to act, and how to execute, with over 230 strategies for acquiring businesses without depleting cash reserves.</p></div>
    </section>
    <Cta title="Both founding partners are Certified M&A Advisors." text="Designated by the Alliance of M&A Advisors." href="/team" label="Meet the team" />
  </>);
}

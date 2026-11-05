import type { Metadata } from "next";
import { PageHead } from "@/components/ui";
import { legalNote } from "@/content/site";
export const metadata: Metadata = { title: "Privacy" };
export default function Privacy() {
  return (<><PageHead eyebrow="Privacy" title="Privacy policy" />
    <section className="wrap prose-w space-y-5 py-14"><p>When you visit or log in to our website, cookies and similar technologies may be used by our online data partners or vendors to associate these activities with other personal information they or others have about you, including by association with your email or home address. We or service providers on our behalf may then send communications and marketing to these addresses. You may opt out of receiving this advertising at <a className="underline" href="https://app.retention.com/optout">app.retention.com/optout</a>.</p><p className="text-muted-foreground">{legalNote}</p></section></>);
}

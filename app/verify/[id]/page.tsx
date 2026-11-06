import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, CircleX } from "lucide-react";
import { Wordmark } from "@/components/chrome";
import { VerifyFile } from "@/components/verify-file";
import { allBuyers } from "@/lib/store";
export const metadata: Metadata = { title: "Verify a signed NDA", robots: { index: false } };
export const dynamic = "force-dynamic";
const mask = (n: string) => n.split(" ").map((w, i) => (i === 0 ? w : `${w[0]}.`)).join(" ");
/** Public check for a signed NDA. Shows only what proves it is genuine, never the listing or the email. */
export default async function Verify({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id; const b = /^[0-9a-f-]{36}$/.test(id) ? (await allBuyers()).find((x) => x.nda?.fileId === id) : undefined; const n = b?.nda;
  return <main className="grid min-h-dvh place-items-center bg-background px-5 py-10"><div className="w-full max-w-lg">
    <Link href="/" className="mb-8 block"><Wordmark /></Link>
    <section className="panel"><div className="panel-head">{n ? <BadgeCheck size={18} className="text-c-green" /> : <CircleX size={18} className="text-destructive" />}<h1 className="!text-[16px]">{n ? "Valid signed NDA" : "No matching document"}</h1></div><div className="well">
      {n ? <><dl className="space-y-3 text-sm">{[["Signed by", mask(n.signedName)], ["Signed", `${n.signedAt.replace("T", " ").slice(0, 16)} UTC`], ["Method", n.method === "drawn" ? "Drawn signature" : "Typed signature"], ["NDA version", n.version], ["Document ID", id]].map(([k, v]) => <div key={k} className="flex justify-between gap-4 border-b pb-3 last:border-0"><dt className="text-muted-foreground">{k}</dt><dd className="num text-right font-medium">{v}</dd></div>)}</dl>
        {n.hash && <p className="mt-4 break-all rounded-lg bg-surface-1 p-3 font-mono text-[11px] text-muted-foreground">Terms fingerprint {n.hash}</p>}<VerifyFile hash={n.pdfHash} /></>
        : <p className="text-muted-foreground">We could not find a signed NDA with this ID. Check the link on the signing certificate, or contact Westbound Road.</p>}
    </div></section>
    <p className="mt-4 text-center text-xs text-muted-foreground">Signed electronically through Westbound Road. Personal details are hidden on this page.</p>
  </div></main>;
}

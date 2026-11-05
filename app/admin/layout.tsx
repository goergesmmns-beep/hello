import type { Metadata } from "next";
import Link from "next/link";
import { Wordmark } from "@/components/chrome";
export const metadata: Metadata = { title: "Advisor desk", robots: { index: false } };
export default function L({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh"><header className="dark border-b bg-background text-foreground"><div className="wrap flex h-14 items-center justify-between"><Link href="/admin"><Wordmark /></Link><span className="eyebrow">Advisor desk</span></div></header><main className="wrap py-8">{children}</main></div>;
}

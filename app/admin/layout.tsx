import type { Metadata } from "next";
export const metadata: Metadata = { title: "Advisor desk", robots: { index: false } };
export default function L({ children }: { children: React.ReactNode }) { return <div className="dark min-h-dvh bg-background text-foreground">{children}</div>; }

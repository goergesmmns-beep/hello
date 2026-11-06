"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
/** Signed-in buyers continue inside their dashboard instead of the public form. */
export function SmartCta({ id, href, portal, className, children }: { id: string; href: string; portal: string; className: string; children: React.ReactNode }) {
  const [to, setTo] = useState(href);
  useEffect(() => { if (/(?:^|; )wb_who=/.test(document.cookie)) setTo(portal); }, [portal]);
  return <Link id={id} href={to} className={className}>{children}</Link>;
}

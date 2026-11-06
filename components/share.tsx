"use client";
import { useState } from "react";
import { Check, Link2 } from "lucide-react";
export function CopyLink() {
  const [ok, setOk] = useState(false);
  return <button type="button" onClick={async () => { try { await navigator.clipboard.writeText(location.href); setOk(true); setTimeout(() => setOk(false), 1800); } catch {} }} className="flex cursor-pointer items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">{ok ? <Check size={15} /> : <Link2 size={15} />}{ok ? "Link copied" : "Copy link"}</button>;
}

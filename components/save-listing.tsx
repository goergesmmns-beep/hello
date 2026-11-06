"use client";
import { useEffect, useState } from "react";
import { Bookmark } from "lucide-react";
export function SaveListing({ slug, className = "" }: { slug: string; className?: string }) {
  const [on, setOn] = useState(false); const [busy, setBusy] = useState(false);
  useEffect(() => { fetch("/api/account").then((r) => r.json()).then((d) => setOn(!!d.user?.saved?.includes(slug))).catch(() => {}); }, [slug]);
  return <button id="save-listing" type="button" aria-pressed={on} disabled={busy} onClick={async () => { setBusy(true); const r = await fetch("/api/account", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: on ? "unsave" : "save", slug }) }); setBusy(false); if (r.status === 401) { window.location.assign(`/login?next=${encodeURIComponent(location.pathname)}`); return; } if (r.ok) setOn(!on); }} className={`flex cursor-pointer items-center gap-1.5 text-sm ${on ? "font-medium text-c-orange" : "text-muted-foreground hover:text-foreground"} ${className}`}><Bookmark size={15} className={on ? "fill-current" : ""} />{on ? "Saved" : "Save"}</button>;
}

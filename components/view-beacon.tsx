"use client";
import { useEffect } from "react";
/** Counts a listing view for the seller's insights. */
export function ViewBeacon({ slug }: { slug: string }) {
  useEffect(() => { fetch("/api/view", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug }), keepalive: true }).catch(() => {}); }, [slug]);
  return null;
}

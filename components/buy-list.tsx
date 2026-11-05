"use client";
import { useState } from "react";
import { ListingRow } from "./ui";
import { listings } from "@/content/listings";

const opts = [["all", "All"], ["over", "Over $1M"], ["under", "Under $1M"]] as const;
export function BuyList() {
  const [f, setF] = useState<(typeof opts)[number][0]>("all");
  const rows = listings.filter((l) => f === "all" || l.band === f);
  return (
    <>
      <div className="mb-6 flex gap-2" role="group" aria-label="Filter listings">{opts.map(([k, l]) => <button key={k} aria-pressed={f === k} onClick={() => setF(k)} className={`btn !min-h-10 ${f === k ? "btn-primary" : "btn-ghost"}`}>{l}</button>)}</div>
      <div className="border-t">{rows.map((l) => <ListingRow key={l.slug} l={l} />)}</div>
    </>
  );
}

"use client";
import { useState } from "react";
import { CircleCheck, CircleX, Upload } from "lucide-react";
/** Hashes the chosen file in the browser and compares it with the original. The file never leaves the device. */
export function VerifyFile({ hash }: { hash?: string }) {
  const [r, setR] = useState<null | boolean>(null); const [name, setName] = useState("");
  if (!hash) return null;
  return <div className="mt-6 border-t pt-6"><h2 className="font-semibold">Check a copy</h2><p className="mt-1 text-sm text-muted-foreground">Choose the PDF you received. It is checked on your device and never uploaded.</p>
    <label htmlFor="vf-file" className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed p-5 text-sm font-medium hover:border-c-orange"><Upload size={17} className="text-c-orange" />{name || "Choose PDF"}<input id="vf-file" type="file" accept="application/pdf" className="sr-only" onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; setName(f.name); const d = await crypto.subtle.digest("SHA-256", await f.arrayBuffer()); setR(Array.from(new Uint8Array(d)).map((x) => x.toString(16).padStart(2, "0")).join("") === hash); }} /></label>
    {r !== null && <p role="status" className={`mt-3 flex items-center gap-2 rounded-xl p-3 text-sm font-medium ${r ? "bg-c-green/12 text-c-green" : "bg-destructive/10 text-destructive"}`}>{r ? <CircleCheck size={18} /> : <CircleX size={18} />}{r ? "This file is identical to the signed original." : "This file does not match the signed original. It may have been changed."}</p>}
  </div>;
}

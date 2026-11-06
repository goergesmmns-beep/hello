"use client";
import { useState } from "react";
export function StopButton({ token }: { token: string }) {
  const [s, setS] = useState<"idle" | "done" | "error">("idle");
  if (s === "done") return <p role="status" className="text-lg font-medium">You won't receive more reminders. Your NDA and buyer record are unchanged.</p>;
  return <>{s === "error" && <p role="alert" className="mb-3 text-sm text-destructive">That did not work. Try again.</p>}<button id="stop" className="btn btn-primary" onClick={async () => { const r = await fetch(`/api/access/${token}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "stop" }) }); setS(r.ok ? "done" : "error"); }}>Stop reminders</button></>;
}

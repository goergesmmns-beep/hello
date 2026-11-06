"use client";
import { useEffect, useRef, useState } from "react";
/** Typed or drawn signature. A drawn one is sent as a PNG. */
export function SignaturePad({ name, onName, onDrawn }: { name: string; onName: (v: string) => void; onDrawn: (png: string | null) => void }) {
  const [mode, setMode] = useState<"type" | "draw">("type");
  const ref = useRef<HTMLCanvasElement>(null); const drawing = useRef(false); const [has, setHas] = useState(false);
  useEffect(() => { if (mode !== "draw") { onDrawn(null); return; } onDrawn(""); const c = ref.current!; const d = Math.min(devicePixelRatio || 1, 2); const r = c.getBoundingClientRect(); c.width = r.width * d; c.height = r.height * d; const x = c.getContext("2d")!; x.scale(d, d); x.lineWidth = 2.4; x.lineCap = "round"; x.lineJoin = "round"; x.strokeStyle = "#101010"; setHas(false); }, [mode]); // eslint-disable-line
  const at = (e: React.PointerEvent) => { const r = ref.current!.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top] as const; };
  const clear = () => { const c = ref.current!; c.getContext("2d")!.clearRect(0, 0, c.width, c.height); setHas(false); onDrawn(""); };
  return <div className="space-y-3">
    <label className="field" htmlFor="signedName">Your full legal name<input id="signedName" name="signedName" className="input" required value={name} onChange={(e) => onName(e.target.value)} /></label>
    <div role="group" aria-label="Signature type" className="grid grid-cols-2 gap-1 rounded-md border p-1">{([["type", "Type"], ["draw", "Draw"]] as const).map(([k, l]) => <button key={k} type="button" id={`sig-${k}`} aria-pressed={mode === k} onClick={() => setMode(k)} className={`cursor-pointer rounded px-3 py-1.5 text-sm font-medium ${mode === k ? "bg-foreground text-background" : "text-muted-foreground"}`}>{l}</button>)}</div>
    {mode === "type" ? <div className="grid h-28 place-items-center overflow-hidden rounded-md border bg-white px-3 text-[#101010]"><span className="max-w-full truncate text-[34px] italic" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>{name || "Your name"}</span></div>
      : <div><canvas id="sig-canvas" ref={ref} aria-label="Draw your signature" className="h-36 w-full touch-none rounded-md border bg-white" onPointerDown={(e) => { drawing.current = true; e.currentTarget.setPointerCapture(e.pointerId); const [a, b] = at(e); const x = ref.current!.getContext("2d")!; x.beginPath(); x.moveTo(a, b); }} onPointerMove={(e) => { if (!drawing.current) return; const [a, b] = at(e); const x = ref.current!.getContext("2d")!; x.lineTo(a, b); x.stroke(); }} onPointerUp={() => { drawing.current = false; setHas(true); onDrawn(ref.current!.toDataURL("image/png")); }} /><div className="mt-1 flex justify-between text-xs text-muted-foreground"><span>Sign with your finger or mouse</span>{has && <button type="button" className="cursor-pointer underline" onClick={clear}>Clear</button>}</div></div>}
  </div>;
}

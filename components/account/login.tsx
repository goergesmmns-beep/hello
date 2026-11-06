"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Mail } from "lucide-react";

const Google = () => <svg viewBox="0 0 24 24" className="size-[18px]" aria-hidden><path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.2-2.1 3.5-5.1 3.5-8.7z" /><path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24z" /><path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.3a12 12 0 0 0 0 10.8l4-3.1z" /><path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.9 3.6-4.9 6.7-4.9z" /></svg>;

/** Six boxes that accept typing, backspace and a pasted code. */
function Otp({ value, onChange, onDone }: { value: string; onChange: (v: string) => void; onDone: (v: string) => void }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  useEffect(() => { refs.current[0]?.focus(); }, []);
  const set = (v: string) => { const c = v.replace(/\D/g, "").slice(0, 6); onChange(c); refs.current[Math.min(c.length, 5)]?.focus(); if (c.length === 6) onDone(c); };
  return <div className="flex justify-between gap-2" role="group" aria-label="Six-digit code">{Array.from({ length: 6 }, (_, i) => <input key={i} ref={(el) => { refs.current[i] = el; }} id={`otp-${i}`} inputMode="numeric" autoComplete={i === 0 ? "one-time-code" : "off"} aria-label={`Digit ${i + 1}`} value={value[i] ?? ""} className="num size-12 rounded-xl border bg-surface-2 text-center text-xl font-semibold outline-none transition-colors focus:border-c-orange focus:ring-2 focus:ring-c-orange/30 sm:size-14"
    onPaste={(e) => { e.preventDefault(); set(e.clipboardData.getData("text")); }}
    onKeyDown={(e) => { if (e.key === "Backspace" && !value[i] && i > 0) { refs.current[i - 1]?.focus(); onChange(value.slice(0, i - 1)); } }}
    onChange={(e) => { const d = e.target.value.replace(/\D/g, "").slice(-1); if (!d) { onChange(value.slice(0, i)); return; } set((value.slice(0, i) + d).slice(0, 6)); }} />)}</div>;
}

export function LoginCard({ next, google, error, intent }: { next: string; google: boolean; error?: string; intent?: string }) {
  const [step, setStep] = useState<"email" | "code">("email"); const [email, setEmail] = useState(""); const [code, setCode] = useState(""); const [busy, setBusy] = useState(false); const [err, setErr] = useState(error ?? ""); const [wait, setWait] = useState(0);
  useEffect(() => { if (!wait) return; const t = setTimeout(() => setWait(wait - 1), 1000); return () => clearTimeout(t); }, [wait]);
  const send = async () => { setBusy(true); setErr(""); const r = await fetch("/api/auth/code", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) }); const d = await r.json().catch(() => ({})); setBusy(false); if (!r.ok) return setErr(d.error ?? "That did not work."); setStep("code"); setCode(""); setWait(30); };
  const verify = async (c = code) => { setBusy(true); setErr(""); const r = await fetch("/api/auth/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, code: c, next }) }); const d = await r.json().catch(() => ({})); if (!r.ok) { setBusy(false); setCode(""); return setErr(d.error ?? "That did not work."); } window.location.assign(d.next); };
  return <div className="w-full max-w-[420px]">
    {step === "email" ? <>
      <h1 className="text-[30px] font-semibold leading-tight tracking-tight">{intent === "sell" ? "List your business" : intent === "buy" ? "Create your buyer account" : "Sign in or create an account"}</h1>
      <p className="mt-2 text-muted-foreground">One account for buying and selling. No password to remember.</p>
      {google && <a id="google" href={`/api/auth/google?next=${encodeURIComponent(next)}`} className="mt-8 flex h-12 w-full items-center justify-center gap-3 rounded-xl border bg-surface-2 font-medium shadow-sm transition-colors hover:bg-surface-1"><Google />Continue with Google</a>}
      {google && <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" /></div>}
      <form className={google ? "" : "mt-8"} onSubmit={(e) => { e.preventDefault(); send(); }}>
        <label className="field" htmlFor="login-email">Work email<span className="relative"><Mail size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" /><input id="login-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className="input !h-12 !rounded-xl !pl-10" /></span></label>
        {err && <p role="alert" className="mt-3 text-sm text-destructive">{err}</p>}
        <button id="login-send" disabled={busy} className="btn btn-primary mt-4 h-12 w-full !rounded-xl">{busy ? "Sending…" : "Continue with email"} <ArrowRight size={17} /></button>
      </form>
      <p className="mt-6 text-xs leading-relaxed text-muted-foreground">By continuing you agree to our <a href="/privacy" className="underline">privacy policy</a>. We email you a six-digit code to sign in.</p>
    </> : <>
      <button type="button" onClick={() => { setStep("email"); setErr(""); }} className="mb-6 flex cursor-pointer items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft size={15} /> Use a different email</button>
      <h1 className="text-[30px] font-semibold leading-tight tracking-tight">Check your email</h1>
      <p className="mt-2 text-muted-foreground">We sent a six-digit code to <b className="text-foreground">{email}</b>.</p>
      <div className="mt-8"><Otp value={code} onChange={setCode} onDone={verify} /></div>
      {err && <p role="alert" className="mt-4 text-sm text-destructive">{err}</p>}
      <button id="login-verify" onClick={() => verify()} disabled={busy || code.length < 6} className="btn btn-primary mt-6 h-12 w-full !rounded-xl">{busy ? "Signing in…" : "Sign in"}</button>
      <p className="mt-5 text-center text-sm text-muted-foreground">No email? {wait ? <span>Send again in {wait}s</span> : <button type="button" onClick={send} className="cursor-pointer font-medium text-foreground underline">Send a new code</button>}</p>
    </>}
  </div>;
}

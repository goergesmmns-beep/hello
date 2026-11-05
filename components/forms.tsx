"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Field = { name: string; label: string; type?: string; required?: boolean; options?: string[]; area?: boolean };
export function Control({ f, value }: { f: Field; value?: string }) {
  const id = `f-${f.name}`;
  return (
    <label className={`field ${f.area ? "sm:col-span-2" : ""}`} htmlFor={id}>{f.label}
      {f.options ? <select id={id} name={f.name} required={f.required} className="input" defaultValue=""><option value="" disabled>Choose one</option>{f.options.map((o) => <option key={o}>{o}</option>)}</select>
        : f.area ? <textarea id={id} name={f.name} required={f.required} rows={4} className="input" defaultValue={value} />
        : <input id={id} name={f.name} type={f.type ?? "text"} required={f.required} className="input" defaultValue={value} autoComplete={f.type === "email" ? "email" : undefined} />}
    </label>
  );
}
const Trap = () => <input tabIndex={-1} aria-hidden autoComplete="off" name="company_url" className="absolute left-[-9999px]" />;

export function ContactForm({ kind, fields, submit, done }: { kind: string; fields: Field[]; submit: string; done: string }) {
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [err, setErr] = useState("");
  if (state === "done") return <p role="status" className="rounded-lg border p-6 text-lg font-medium">{done}</p>;
  return (
    <form className="relative grid gap-4 sm:grid-cols-2" onSubmit={async (e) => {
      e.preventDefault(); setState("busy"); setErr("");
      const res = await fetch("/api/forms", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind, fields: Object.fromEntries(new FormData(e.currentTarget)) }) });
      if (res.ok) setState("done"); else { setState("idle"); setErr("That did not send. Check the form and try again."); }
    }}>
      <Trap />{fields.map((f) => <Control key={f.name} f={f} />)}
      {err && <p role="alert" className="text-sm text-destructive sm:col-span-2">{err}</p>}
      <button className="btn btn-primary sm:col-span-2" disabled={state === "busy"}>{state === "busy" ? "Sending…" : submit}</button>
    </form>
  );
}
export function RequestForm({ slug }: { slug: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  if (note) return <p role="status" className="rounded-lg border p-6 text-lg font-medium">{note}</p>;
  return (
    <form className="relative grid gap-4 sm:grid-cols-2" onSubmit={async (e) => {
      e.preventDefault(); setBusy(true);
      const res = await fetch("/api/inquiry", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...Object.fromEntries(new FormData(e.currentTarget)), listingSlug: slug }) });
      const data = await res.json().catch(() => ({}));
      setBusy(false);
      if (data.next) router.push(data.next);
      else setNote(res.ok ? "You already have a link for this listing. We just emailed it to you." : "That did not send. Check your details and try again.");
    }}>
      <Trap />
      {[{ name: "name", label: "Full name", required: true }, { name: "email", label: "Email", type: "email", required: true }, { name: "phone", label: "Phone", type: "tel" }, { name: "company", label: "Company, if any" }].map((f) => <Control key={f.name} f={f} />)}
      <button className="btn btn-primary sm:col-span-2" disabled={busy}>{busy ? "Starting…" : "Continue"}</button>
    </form>
  );
}

import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { addAdvisorNote, keepWarm, releaseCim, resendLink, setArchived, setReminders } from "@/lib/flow";
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Sign in again." }, { status: 401 });
  const { id } = await params;
  const b = await req.json().catch(() => ({}));
  try {
    if (b.action === "release") await releaseCim(id, "advisor");
    else if (b.action === "warm") await keepWarm(id, "advisor");
    else if (b.action === "resend") await resendLink(id);
    else if (b.action === "archive") await setArchived(id, !!b.value);
    else if (b.action === "reminders") await setReminders(id, !!b.value);
    else if (b.action === "note" && typeof b.text === "string" && b.text.trim()) await addAdvisorNote(id, b.text.trim().slice(0, 4000));
    else return NextResponse.json({ error: "Unknown action." }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (e) { console.error(e); return NextResponse.json({ error: "That did not work." }, { status: 400 }); }
}

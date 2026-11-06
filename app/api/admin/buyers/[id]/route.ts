import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { answerQuestion, resync, addOffer, addTask, declineFunds, requestMoreFunds, setOfferStatus, toggleTask, verifyFunds, addAdvisorNote, keepWarm, releaseCim, resendLink, setArchived, setReminders } from "@/lib/flow";
const statuses = ["Draft", "Submitted", "Countered", "Accepted", "Declined", "Withdrawn"];
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Sign in again." }, { status: 401 });
  const { id } = await params;
  const b = await req.json().catch(() => ({}));
  try {
    if (b.action === "release") await releaseCim(id, "advisor");
    else if (b.action === "warm") await keepWarm(id, "advisor");
    else if (b.action === "resend") await resendLink(id);
    else if (b.action === "funds-verify" && Number(b.amount) > 0) await verifyFunds(id, Number(b.amount), !!b.release);
    else if (b.action === "funds-more" && typeof b.note === "string" && b.note.trim()) await requestMoreFunds(id, b.note.trim().slice(0, 1000));
    else if (b.action === "funds-decline") await declineFunds(id);
    else if (b.action === "offer" && Number(b.amountUsd) > 0) await addOffer(id, { amountUsd: Number(b.amountUsd), cashUsd: Number(b.cashUsd) || undefined, sellerNoteUsd: Number(b.sellerNoteUsd) || undefined, earnoutUsd: Number(b.earnoutUsd) || undefined, status: statuses.includes(b.status) ? b.status : "Submitted", notes: typeof b.notes === "string" ? b.notes.slice(0, 1000) : undefined });
    else if (b.action === "offer-status" && statuses.includes(b.status)) await setOfferStatus(id, b.offerId, b.status);
    else if (b.action === "task" && typeof b.text === "string" && b.text.trim()) await addTask(id, b.text.trim().slice(0, 300), typeof b.due === "string" && b.due ? b.due.slice(0, 10) : undefined);
    else if (b.action === "task-toggle") await toggleTask(id, b.taskId);
    else if (b.action === "answer" && typeof b.a === "string" && b.a.trim()) await answerQuestion(id, b.qid, b.a.trim().slice(0, 3000));
    else if (b.action === "crm-sync") await resync(id);
    else if (b.action === "archive") await setArchived(id, !!b.value);
    else if (b.action === "reminders") await setReminders(id, !!b.value);
    else if (b.action === "note" && typeof b.text === "string" && b.text.trim()) await addAdvisorNote(id, b.text.trim().slice(0, 4000));
    else return NextResponse.json({ error: "Unknown action." }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (e) { console.error(e); return NextResponse.json({ error: "That did not work." }, { status: 400 }); }
}

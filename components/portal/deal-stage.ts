import type { Buyer } from "@/lib/types";
/** Stages in the buyer's words. */
export function buyerStage(b: Buyer): { label: string; tone: string; mine: boolean } {
  if (b.archived) return { label: "Archived", tone: "var(--c-gray)", mine: false };
  if (b.funds?.status === "more") return { label: "More proof needed", tone: "var(--c-orange)", mine: true };
  switch (b.stage) {
    case "inquiry": return { label: "Sign the NDA", tone: "var(--c-orange)", mine: true };
    case "nda": case "capacity": return { label: "Confirm funding", tone: "var(--c-orange)", mine: true };
    case "review": return { label: "Advisor review", tone: "var(--c-purple)", mine: false };
    case "cim": return { label: "Deal room open", tone: "var(--c-green)", mine: false };
    case "call": return { label: "Call requested", tone: "var(--c-green)", mine: false };
    default: return { label: "On hold", tone: "var(--c-gray)", mine: false };
  }
}
export const lanes = [["todo", "Your move"], ["review", "With an advisor"], ["room", "Deal room"], ["done", "On hold"]] as const;
export function lane(b: Buyer) { const s = buyerStage(b); return s.mine ? "todo" : b.stage === "review" ? "review" : b.stage === "cim" || b.stage === "call" ? "room" : "done"; }

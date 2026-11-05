export type Stage = "inquiry" | "nda" | "capacity" | "review" | "cim" | "call" | "warm";
export type Route = "own" | "company" | "letter" | "financing";
export const stageLabels: Record<Stage, string> = { inquiry: "New inquiry", nda: "NDA signed", capacity: "Capacity check", review: "Advisor review", cim: "CIM open", call: "Call requested", warm: "Keep warm" };
export type BuyerEvent = { at: string; type: string; detail: string };
export type Buyer = {
  id: string; token: string; verifyCode: string; listingSlug: string; source: string;
  name: string; email: string; phone?: string; company?: string; message?: string;
  linkedin?: string; website?: string; why?: string; route?: Route; stage: Stage;
  nda?: { signedName: string; signedAt: string; ip: string; userAgent: string; version: string; fileId: string };
  capacity?: { fileId?: string; fileName?: string; plan?: string; role?: string; acquisitions?: string; competitor?: string; notes?: string; submittedAt: string };
  pipedrive?: { personId?: number; dealId?: number };
  cimViews: number; createdAt: string; updatedAt: string; events: BuyerEvent[];
};
export type Submission = { id: string; kind: string; fields: Record<string, string>; createdAt: string };
export type StoredFile = { id: string; kind: "nda" | "capacity"; buyerId: string; name: string; mime: string; bytes: Uint8Array; createdAt: string };

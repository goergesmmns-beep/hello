export type Stage = "inquiry" | "nda" | "capacity" | "review" | "cim" | "call" | "warm";
export type Route = "own" | "company" | "letter" | "financing";
export const stageLabels: Record<Stage, string> = { inquiry: "New inquiry", nda: "NDA signed", capacity: "Capacity check", review: "Advisor review", cim: "CIM open", call: "Call requested", warm: "Keep warm" };
export type BuyerEvent = { at: string; type: string; detail: string };
export type FundsStatus = "submitted" | "verified" | "more" | "declined";
export type FundsDoc = { fileId: string; name: string; at: string };
export type Funds = { carriedFrom?: string; docType?: string; statedUsd?: number; docDate?: string; docs: FundsDoc[]; status?: FundsStatus; note?: string; verifiedUsd?: number; verifiedAt?: string; expiresAt?: string; submittedAt?: string };
export type OfferStatus = "Draft" | "Submitted" | "Countered" | "Accepted" | "Declined" | "Withdrawn";
export type Offer = { id: string; at: string; amountUsd: number; cashUsd?: number; sellerNoteUsd?: number; earnoutUsd?: number; status: OfferStatus; notes?: string };
export type Task = { id: string; text: string; due?: string; done?: boolean; at: string };
export type Question = { id: string; at: string; q: string; a?: string; answeredAt?: string };
export type RoomStats = { sections: Record<string, number>; docs: Record<string, number>; lastAt?: string };
export type Buyer = {
  id: string; token: string; verifyCode: string; listingSlug: string; source: string;
  name: string; email: string; phone?: string; company?: string; message?: string;
  linkedin?: string; website?: string; why?: string; route?: Route; stage: Stage;
  nda?: { signedName: string; signedAt: string; ip: string; userAgent: string; version: string; fileId: string; method?: "typed" | "drawn"; hash?: string; pdfHash?: string };
  funds?: Funds; offers?: Offer[]; tasks?: Task[];
  capacity?: { fileId?: string; fileName?: string; plan?: string; role?: string; acquisitions?: string; competitor?: string; notes?: string; submittedAt: string };
  pipedrive?: { personId?: number; dealId?: number; files?: string[]; syncedAt?: string; error?: string };
  room?: RoomStats; questions?: Question[];
  /** Sample record from the demo loader. Never emailed or synced. */
  demo?: boolean;
  /** Custom pipeline column the advisor moved this buyer to, and its place in that column. */
  board?: string; rank?: number;
  cimViews: number; notes?: { at: string; text: string }[]; archived?: boolean; reminders?: Record<string, string>; remindersOff?: boolean; createdAt: string; updatedAt: string; events: BuyerEvent[];
};
export type Submission = { id: string; kind: string; fields: Record<string, string>; createdAt: string; handled?: boolean; demo?: boolean };
export type StoredFile = { id: string; kind: "nda" | "capacity" | "cim" | "room"; buyerId: string; name: string; mime: string; bytes: Uint8Array; createdAt: string };

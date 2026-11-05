import { listings } from "@/content/listings";

/**
 * Reads a forwarded marketplace lead email. Written for labelled fields ("Name: ...").
 * Check it against a real BizBuySell lead email before going live.
 */
export function parseLead(subject: string, text: string) {
  const field = (...labels: string[]) => {
    for (const l of labels) {
      const m = text.match(new RegExp(`^\\s*${l}\\s*:\\s*(.+)$`, "im"));
      if (m) return m[1].trim();
    }
  };
  const email = field("Email", "E-mail", "Email Address") ?? text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/)?.[0];
  const name = field("Name", "Full Name", "Contact Name", "From");
  const phone = field("Phone", "Phone Number");
  const message = field("Message", "Comments");
  const hay = `${subject} ${text}`.toLowerCase();
  const words = (s: string) => s.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 3);
  const scored = listings.map((l) => ({ l, score: words(l.title).filter((w) => hay.includes(w)).length })).sort((a, b) => b.score - a.score);
  const listing = scored[0].score >= 2 ? scored[0].l : null;
  return { email, name, phone, message, listingSlug: listing?.slug };
}

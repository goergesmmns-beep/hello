import { promises as fs } from "fs";
import path from "path";
import { degrees, PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { nda } from "@/content/nda";
import type { Listing } from "@/content/listings";

function wrap(text: string, max: number) {
  const out: string[] = []; let line = "";
  for (const w of text.split(" ")) {
    if ((line + " " + w).trim().length > max) { out.push(line); line = w; } else line = (line + " " + w).trim();
  }
  if (line) out.push(line);
  return out;
}
const latin = (s: string) => s.replace(/[^\x20-\x7E]/g, "-");

export async function signedNdaPdf(input: { name: string; email: string; listing: string; at: string; ip: string; userAgent: string }) {
  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]);
  const reg = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  let y = 730;
  const put = (t: string, size = 11, f = reg) => { page.drawText(latin(t), { x: 56, y, size, font: f }); y -= size + 6; };
  put(nda.title, 20, bold); put(`Listing: ${input.listing}`); y -= 8;
  for (const [h, b] of nda.clauses) { put(h, 11, bold); wrap(b, 90).forEach((l) => put(l, 10.5)); y -= 6; }
  y -= 10; put("Electronic signature record", 12, bold);
  put(`Signed by: ${input.name}`); put(`Email: ${input.email}`); put(`Signed at (UTC): ${input.at}`);
  put(`IP address: ${input.ip}`); wrap(`Device: ${input.userAgent}`, 90).forEach((l) => put(l, 9)); put(`NDA version: ${nda.version}`, 9);
  return doc.save();
}

/** Returns the listing's CIM with the buyer's email and date on every page. */
export async function watermarkedCim(listing: Listing, email: string) {
  const file = path.join(process.cwd(), "private", "cims", `${listing.slug}.pdf`);
  let doc: PDFDocument;
  try { doc = await PDFDocument.load(await fs.readFile(file)); }
  catch {
    doc = await PDFDocument.create();
    const page = doc.addPage([612, 792]);
    const f = await doc.embedFont(StandardFonts.HelveticaBold);
    page.drawText(latin(listing.title), { x: 56, y: 700, size: 20, font: f, maxWidth: 500 });
    page.drawText("Sample page. The real CIM has not been added yet.", { x: 56, y: 640, size: 13, font: f });
  }
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const stamp = `${latin(email)}  -  ${new Date().toISOString().slice(0, 10)}  -  Confidential`;
  for (const p of doc.getPages()) {
    const { width, height } = p.getSize();
    for (let i = 0; i < 4; i++) {
      p.drawText(stamp, { x: width * 0.08, y: height * (0.12 + i * 0.24), size: 15, font, rotate: degrees(32), color: rgb(0.45, 0.45, 0.45), opacity: 0.22 });
    }
  }
  return doc.save();
}

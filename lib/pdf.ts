import { promises as fs } from "fs";
import path from "path";
import { degrees, PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { nda } from "@/content/nda";
import type { Listing } from "@/content/listings";
import { getFile } from "./store";

function wrap(text: string, max: number) {
  const out: string[] = []; let line = "";
  for (const w of text.split(" ")) {
    if ((line + " " + w).trim().length > max) { out.push(line); line = w; } else line = (line + " " + w).trim();
  }
  if (line) out.push(line);
  return out;
}
const latin = (s: string) => s.replace(/[^\x20-\x7E]/g, "-");

export const ndaText = () => nda.clauses.map(([h, b]) => `${h}: ${b}`).join("\n");
export async function signedNdaPdf(input: { name: string; email: string; listing: string; at: string; ip: string; userAgent: string; hash: string; signature?: Uint8Array; docId?: string; verifyUrl?: string; viewedAt?: string }) {
  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]);
  const reg = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const ital = await doc.embedFont(StandardFonts.TimesRomanItalic);
  let y = 730;
  const put = (t: string, size = 11, f = reg) => { page.drawText(latin(t), { x: 56, y, size, font: f }); y -= size + 6; };
  put(nda.title, 20, bold); put(`Listing: ${input.listing}`); y -= 8;
  for (const [h, b] of nda.clauses) { put(h, 11, bold); wrap(b, 90).forEach((l) => put(l, 10.5)); y -= 6; }
  y -= 8; put("Signature", 12, bold);
  if (input.signature) { const img = await doc.embedPng(input.signature); const s = img.scaleToFit(220, 64); page.drawImage(img, { x: 56, y: y - s.height + 10, width: s.width, height: s.height }); y -= s.height + 2; }
  else { page.drawText(latin(input.name), { x: 56, y: y - 16, size: 26, font: ital }); y -= 34; }
  page.drawLine({ start: { x: 56, y }, end: { x: 300, y }, thickness: .6 }); y -= 22;
  put("Electronic signature record", 12, bold);
  put(`Signed by: ${input.name}`, 10); put(`Email: ${input.email}`, 10); put(`Signed at (UTC): ${input.at}`, 10);
  put(`IP address: ${input.ip}`, 10); wrap(`Device: ${input.userAgent}`, 100).forEach((l) => put(l, 8.5));
  put(`NDA version: ${nda.version}`, 9); put(`Document fingerprint (SHA-256): ${input.hash}`, 7.5);
  if (input.docId) await certificate(doc, { ...input, docId: input.docId }, reg, bold);
  return doc.save();
}

/** A signing certificate page, in the style e-signature services attach to every signed document. */
async function certificate(doc: PDFDocument, i: { name: string; email: string; listing: string; at: string; ip: string; userAgent: string; hash: string; signature?: Uint8Array; docId: string; verifyUrl?: string; viewedAt?: string }, reg: Awaited<ReturnType<PDFDocument["embedFont"]>>, bold: Awaited<ReturnType<PDFDocument["embedFont"]>>) {
  const QR = (await import("qrcode")).default;
  const p = doc.addPage([612, 792]); const ink = rgb(0.08, 0.08, 0.08), mute = rgb(0.42, 0.42, 0.42), line = rgb(0.86, 0.86, 0.86), brand = rgb(0.96, 0.62, 0.27);
  p.drawRectangle({ x: 0, y: 742, width: 612, height: 50, color: ink }); p.drawRectangle({ x: 40, y: 764, width: 14, height: 4, color: brand }); p.drawRectangle({ x: 57, y: 764, width: 14, height: 4, color: rgb(1, 1, 1) });
  p.drawText("Westbound Road", { x: 80, y: 760, size: 13, font: bold, color: rgb(1, 1, 1) }); p.drawText("SIGNING CERTIFICATE", { x: 430, y: 761, size: 10, font: bold, color: brand });
  p.drawText("Electronic signature record", { x: 40, y: 700, size: 22, font: bold, color: ink });
  p.drawText(latin(`Document ID ${i.docId}`), { x: 40, y: 680, size: 9.5, font: reg, color: mute });
  const rows: [string, string][] = [["Document", "Non-disclosure agreement"], ["Listing", i.listing], ["Signer", i.name], ["Email", i.email], ["Signature method", i.signature ? "Drawn by hand on screen" : "Typed name"], ...(i.viewedAt ? [["Agreement opened", `${i.viewedAt.replace("T", " ").slice(0, 19)} UTC`] as [string, string]] : []), ["Signed", `${i.at.replace("T", " ").slice(0, 19)} UTC`], ["IP address", i.ip], ["NDA version", nda.version], ["Consent", "Signer agreed to the terms and to use electronic records and signatures"]];
  let y = 640;
  for (const [k, v] of rows) { p.drawText(k, { x: 40, y, size: 10, font: reg, color: mute }); wrap(latin(v), 62).forEach((l, n) => p.drawText(l, { x: 190, y: y - n * 13, size: 10.5, font: bold, color: ink })); y -= 13 * Math.max(1, wrap(v, 62).length) + 12; p.drawLine({ start: { x: 40, y: y + 6 }, end: { x: 572, y: y + 6 }, thickness: .5, color: line }); }
  p.drawText("Device", { x: 40, y, size: 10, font: reg, color: mute }); wrap(latin(i.userAgent), 80).slice(0, 3).forEach((l, n) => p.drawText(l, { x: 190, y: y - n * 11, size: 8.5, font: reg, color: ink })); y -= 48;
  p.drawText("Terms fingerprint (SHA-256)", { x: 40, y, size: 10, font: reg, color: mute }); p.drawText(i.hash, { x: 40, y: y - 15, size: 8.2, font: reg, color: ink }); y -= 46;
  if (i.verifyUrl) {
    const png = await QR.toBuffer(i.verifyUrl, { margin: 1, width: 300, color: { dark: "#111111", light: "#ffffff" } }); const img = await doc.embedPng(png);
    p.drawRectangle({ x: 40, y: y - 120, width: 532, height: 132, borderColor: line, borderWidth: 1, color: rgb(0.985, 0.985, 0.985) });
    p.drawImage(img, { x: 52, y: y - 110, width: 110, height: 110 });
    p.drawText("Check this document", { x: 180, y: y - 20, size: 13, font: bold, color: ink });
    wrap("Scan the code or open the link to confirm this NDA was signed through Westbound Road. You can also upload a copy there to check it has not been changed.", 62).forEach((l, n) => p.drawText(l, { x: 180, y: y - 40 - n * 13, size: 10, font: reg, color: mute }));
    p.drawText(latin(i.verifyUrl), { x: 180, y: y - 98, size: 9, font: bold, color: rgb(0.75, 0.42, 0.1) });
  }
  p.drawText("Signed electronically through Westbound Road. This page is part of the signed document.", { x: 40, y: 40, size: 8.5, font: reg, color: mute });
}

/** Returns the listing's CIM with the buyer's email and date on every page. */
export async function watermarkedCim(listing: Listing, email: string, ip = "") {
  const file = path.join(process.cwd(), "private", "cims", `${listing.slug}.pdf`);
  let doc: PDFDocument;
  try {
    const stored = await getFile(`cim:${listing.slug}`);
    doc = await PDFDocument.load(stored ? stored.bytes : await fs.readFile(file));
  } catch {
    doc = await PDFDocument.create();
    const page = doc.addPage([612, 792]);
    const f = await doc.embedFont(StandardFonts.HelveticaBold);
    page.drawText(latin(listing.title), { x: 56, y: 700, size: 20, font: f, maxWidth: 500 });
    page.drawText("Sample page. The real CIM has not been added yet.", { x: 56, y: 640, size: 13, font: f });
  }
  return stampPdf(doc, email, ip);
}
/** Stamps the buyer's email across every page of any PDF. */
export async function watermarkBytes(bytes: Uint8Array, email: string, ip = "") { return stampPdf(await PDFDocument.load(bytes), email, ip); }
async function stampPdf(doc: PDFDocument, email: string, ip: string) {
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const foot = latin(`Prepared for ${email}${ip ? ` from ${ip}` : ""} at ${new Date().toISOString().slice(0, 16).replace("T", " ")} UTC. Confidential under NDA. Westbound Road.`);
  const stamp = `${latin(email)}  -  ${new Date().toISOString().slice(0, 10)}  -  Confidential`;
  for (const p of doc.getPages()) {
    const { width, height } = p.getSize();
    for (let i = 0; i < 4; i++) {
      p.drawText(stamp, { x: width * 0.08, y: height * (0.12 + i * 0.24), size: 15, font, rotate: degrees(32), color: rgb(0.32, 0.32, 0.32), opacity: 0.34 });
    }
    p.drawText(foot, { x: 24, y: 12, size: 7, font, color: rgb(0.35, 0.35, 0.35), maxWidth: width - 48 });
  }
  return doc.save();
}

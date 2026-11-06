import { createHash, randomBytes, randomUUID } from "crypto";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { nda } from "@/content/nda";
import { catalog } from "./catalog";
import { ndaText, signedNdaPdf } from "./pdf";
import { clearDemo, saveBuyerRaw, saveFile, saveSubmission } from "./store";
import type { Buyer, BuyerEvent, Offer, OfferStatus, Route, Stage } from "./types";

/** Repeatable pseudo-random numbers, so every load looks the same. */
function rng(seed: number) { return () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; }; }
const first = ["Daniel", "Priya", "Marcus", "Elena", "James", "Aisha", "Robert", "Sofia", "Kevin", "Hannah", "Omar", "Laura", "Victor", "Grace", "Thomas", "Nadia", "Andre", "Claire", "Raj", "Monica", "Peter", "Yuki", "Samuel", "Isabel", "Chris", "Fatima", "Brian", "Leah", "Mateo", "Rachel", "Ethan", "Zara", "Hugo", "Megan", "Ivan", "Tara", "Felix", "Dana", "Noah", "Amara", "Luis", "Ingrid", "Owen", "Mei", "Gavin"];
const last = ["Whitfield", "Raman", "Okafor", "Brandt", "Carver", "Haddad", "Lindqvist", "Moretti", "Tanaka", "Ellison", "Farouk", "Delgado", "Ashby", "Novak", "Pryce", "Castellano", "Odum", "Becker", "Iyer", "Sutton", "Varga", "Holloway", "Mensah", "Quinn", "Reyes", "Sorensen", "Abbott", "Kowalski", "Navarro", "Fitzgerald", "Osei", "Lambert", "Duarte", "Kerr", "Petrov", "Hale", "Winter", "Rhodes", "Achebe", "Lund", "Vance", "Moss", "Calder", "Zhou", "Morrow"];
const firms = ["Northlake Capital", "Harbor Ridge Partners", "Summit Lane Holdings", "Bluewater Equity", "Keystone Growth", "Granite Peak Ventures", "Meridian Search Fund", "Cedar Point Group", "Atlas Digital Holdings", "Riverbend Capital"];
const whys = ["I run a lead generation agency and this fits our buyer network.", "Former operator looking for a profitable, remote business to run full time.", "Search fund backed by six investors, focused on recurring revenue.", "We acquire digital businesses and add them to our portfolio.", "Strategic fit with our existing customer base in this market.", "Twelve years in SaaS operations. Ready to buy my first company.", "Family office allocating to profitable online businesses."];
const sources = [["BizBuySell", 40], ["Website", 30], ["Referral", 12], ["Axial", 10], ["Newsletter", 8]] as const;
const routesW: [Route, number][] = [["own", 45], ["financing", 25], ["letter", 15], ["company", 15]];
const stagesW: [Stage, number][] = [["inquiry", 18], ["nda", 8], ["capacity", 9], ["review", 12], ["cim", 24], ["call", 15], ["warm", 14]];
const weights: Record<string, number> = { "insurance-pay-per-call-agency": 11, "edtech-crm-enrollment-platform": 8, "online-art-design-education": 6, "patented-sports-bbq-brand": 5, "ai-content-intelligence-platform": 5, "energy-transition-media-platform": 4, "dtc-health-wellness-portfolio": 3, "childrens-language-subscription": 3 };
const questions = [["What share of revenue comes from the top five customers?", "The top five account for about 38% of revenue. No single customer is over 11%."], ["Is the owner willing to stay on after closing?", "Yes. The seller offers 90 days of transition support, with longer consulting available."], ["Are the financials accrual or cash basis?", "Cash basis. A quality of earnings review can be arranged during diligence."], ["Can you share churn for the last 12 months?", ""], ["Would the seller consider a seller note?", ""], ["How are publishers paid and on what terms?", "Net 30 for most publishers, with weekly pay for the top tier."]];

async function bankPdf(name: string, amount: number, date: string) {
  const doc = await PDFDocument.create(); const p = doc.addPage([612, 792]);
  const b = await doc.embedFont(StandardFonts.HelveticaBold), r = await doc.embedFont(StandardFonts.Helvetica);
  p.drawRectangle({ x: 0, y: 742, width: 612, height: 50, color: rgb(0.1, 0.1, 0.1) });
  p.drawText("SAMPLE BANK  ·  DEMO DOCUMENT", { x: 40, y: 760, size: 14, font: b, color: rgb(1, 1, 1) });
  [["Account holder", name], ["Statement date", date], ["Account", "Checking ****4821"], ["Available balance", `$${amount.toLocaleString("en-US")}`]].forEach(([k, v], i) => { p.drawText(k, { x: 40, y: 690 - i * 34, size: 11, font: r, color: rgb(0.4, 0.4, 0.4) }); p.drawText(v, { x: 220, y: 690 - i * 34, size: 13, font: b }); });
  p.drawText("This is a generated sample for demonstrations. It is not a real statement.", { x: 40, y: 480, size: 10, font: r, color: rgb(0.5, 0.5, 0.5) });
  return doc.save();
}

/** Loads a realistic, clearly flagged sample dataset. Running it again replaces the previous sample. */
export async function seedDemo() {
  await clearDemo();
  const R = rng(20261106); const pick = <T,>(w: readonly (readonly [T, number])[]) => { const t = w.reduce((s, x) => s + x[1], 0); let v = R() * t; for (const [k, n] of w) { if ((v -= n) < 0) return k; } return w[0][0]; };
  const listings = (await catalog()).filter((l) => weights[l.slug]);
  const now = Date.now(); const day = 864e5; const iso = (t: number) => new Date(Math.min(t, now - 60e3)).toISOString();
  let count = 0; const used = new Set<string>();
  for (let i = 0; i < 46; i++) {
    const l = pick(listings.map((x) => [x, weights[x.slug]] as const));
    let name = ""; do { name = `${first[Math.floor(R() * first.length)]} ${last[Math.floor(R() * last.length)]}`; } while (used.has(name)); used.add(name);
    const [fn, ln] = name.toLowerCase().split(" ");
    const firm = R() < .45 ? firms[Math.floor(R() * firms.length)] : undefined;
    const email = `${fn}.${ln}@${firm ? firm.toLowerCase().replace(/[^a-z]/g, "") : "mail"}.example`;
    let stage = pick(stagesW); if (l.status === "pending" && (stage === "inquiry" || stage === "nda")) stage = "cim";
    // Buyers waiting on an advisor are recent, as they would be on a well-run desk.
    const age = stage === "review" ? R() * 2.5 + 0.2 : stage === "capacity" || stage === "inquiry" ? R() * 12 + 0.3 : Math.pow(R(), 1.6) * 88 + .2; const created = now - age * day;
    const route: Route = l.idealBuyer === "strategic" && R() < .6 ? "company" : pick(routesW);
    if (stage === "warm" && route === "own" && R() < .5) stage = "cim";
    const ev: BuyerEvent[] = []; let t = created; const step = (h: number) => (t = Math.min(t + h * 36e5 * (0.5 + R()), now - 60e3));
    const add = (type: string, detail: string) => ev.unshift({ at: iso(t), type, detail });
    const src = pick(sources);
    add("inquiry", `Inquiry from ${src}`);
    const b: Buyer = { id: randomUUID(), token: randomBytes(24).toString("base64url"), verifyCode: randomBytes(16).toString("base64url"), listingSlug: l.slug, source: src, name, email, phone: R() < .6 ? `(555) ${100 + Math.floor(R() * 899)}-${1000 + Math.floor(R() * 8999)}` : undefined, company: firm, stage, cimViews: 0, createdAt: iso(created), updatedAt: iso(created), events: ev, demo: true, remindersOff: true };
    const at = (s: Stage) => ["nda", "capacity", "review", "cim", "call", "warm"].indexOf(stage) >= ["nda", "capacity", "review", "cim", "call", "warm"].indexOf(s);
    if (stage !== "inquiry") {
      step(6); b.route = route; b.why = whys[Math.floor(R() * whys.length)]; b.linkedin = `https://www.linkedin.com/in/${fn}-${ln}-example`; add("profile", `Profile saved. Route: ${route}`);
      step(3); const signedAt = iso(t); const drawn = R() < .35;
      const hash = createHash("sha256").update(`${nda.version}\n${l.title}\n${ndaText()}\n${name}\n${email}\n${signedAt}`).digest("hex");
      const fileId = randomUUID(); const ip = `203.0.113.${Math.floor(R() * 250) + 2}`; const ua = R() < .55 ? "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) Mobile/15E148 Safari" : "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) Chrome/131.0 Safari/537.36";
      await saveFile({ id: fileId, kind: "nda", buyerId: b.id, name: `NDA ${name}.pdf`, mime: "application/pdf", bytes: await signedNdaPdf({ name, email, listing: l.title, at: signedAt, ip, userAgent: ua, hash }), createdAt: signedAt });
      b.nda = { signedName: name, signedAt, ip, userAgent: ua, version: nda.version, fileId, method: drawn ? "drawn" : "typed", hash }; add("nda", `NDA signed by ${name}`);
    }
    const fundsRoute = route === "own" || route === "letter";
    if (stage === "warm") { step(10); add("warm", route === "financing" ? "No funding plan yet. Moved to keep warm" : "Moved to keep warm by advisor"); }
    if (fundsRoute && (stage === "review" || stage === "cim" || stage === "call" || (stage === "capacity" && R() < .4))) {
      step(8); const floor = l.floorUsd ?? 50000; const amt = Math.round((floor * (1.1 + R() * 2.2)) / 5000) * 5000; const docDate = iso(t - (5 + R() * 25) * day).slice(0, 10);
      const fid = randomUUID(); await saveFile({ id: fid, kind: "capacity", buyerId: b.id, name: `${route === "letter" ? "Bank letter" : "Statement"} ${docDate}.pdf`, mime: "application/pdf", bytes: await bankPdf(name, amt, docDate), createdAt: iso(t) });
      b.funds = { docType: route === "letter" ? "Bank letter" : R() < .7 ? "Bank statement" : "Brokerage or investment statement", statedUsd: amt, docDate, docs: [{ fileId: fid, name: `${route === "letter" ? "Bank letter" : "Statement"} ${docDate}.pdf`, at: iso(t) }], status: "submitted", submittedAt: iso(t) };
      add("funds", `Proof of funds submitted: ${b.funds.docType}`);
      if (stage === "capacity") { b.funds.status = "more"; b.funds.note = "The statement is over 90 days old. Please send the latest one."; add("funds_more", "Advisor asked for more proof of funds"); }
      else if (stage !== "review") { step(5); b.funds = { ...b.funds, status: "verified", verifiedUsd: amt, verifiedAt: iso(t), expiresAt: new Date(t + 90 * day).toISOString() }; add("funds_ok", "Advisor verified proof of funds"); }
      else add("review", "Sent to advisor review");
    } else if (stage === "review") { step(4); add("review", "Sent to advisor review"); }
    if (at("cim") && stage !== "warm") {
      step(4); add("cim", R() < .5 ? "CIM released after funds were verified" : "CIM released by advisor");
      const views = 1 + Math.floor(R() * 5); for (let v = 0; v < views; v++) { step(14); add("cim_view", v === 0 ? "Deal room opened" : R() < .5 ? "Opened CIM" : "Deal room opened"); }
      b.cimViews = views;
      const secs = (n: number) => Math.round(n * (0.4 + R()));
      b.room = { sections: { overview: secs(140), financials: secs(420), business: secs(230), terms: secs(180), documents: secs(120), questions: secs(70), next: secs(60) }, docs: { CIM: views }, lastAt: iso(t) };
      if (R() < .45) { const [q, a] = questions[Math.floor(R() * questions.length)]; step(6); b.questions = [{ id: randomUUID(), at: iso(t), q, ...(a && R() < .7 ? { a, answeredAt: iso(t + 5 * 36e5) } : {}) }]; add("question", "Asked a question in the deal room"); }
    }
    if (stage === "call") { step(12); add("call", "Buyer asked for a call"); }
    if ((stage === "call" && R() < .75) || (stage === "cim" && R() < .15)) {
      const base = l.askUsd ?? 900000; const amt = Math.round((base * (0.78 + R() * 0.2)) / 5000) * 5000; const status: OfferStatus = ([["Submitted", 4], ["Countered", 3], ["Accepted", 1], ["Declined", 1]] as const).map(([s]) => s)[Math.floor(R() * 4)] as OfferStatus;
      step(30); const cash = Math.round((amt * (0.7 + R() * 0.2)) / 5000) * 5000;
      const o: Offer = { id: randomUUID(), at: iso(t), amountUsd: amt, cashUsd: cash, sellerNoteUsd: amt - cash, status, notes: R() < .5 ? "Close in 60 days. SBA pre-qualified." : "Seller to stay on for 90 days." };
      b.offers = [o]; add("offer", `Offer logged: $${amt.toLocaleString("en-US")}, ${status}`);
    }
    if (["review", "call", "cim"].includes(stage) && R() < .45) { const due = new Date(now + (Math.floor(R() * 9) - 3) * day).toISOString().slice(0, 10); b.tasks = [{ id: randomUUID(), text: stage === "call" ? `Call ${name.split(" ")[0]} about LOI terms` : stage === "review" ? `Check ${name.split(" ")[0]}'s funds and release` : `Follow up with ${name.split(" ")[0]} on the CIM`, due, at: iso(t) }]; }
    if (R() < .25 && stage !== "inquiry") b.notes = [{ at: iso(t), text: route === "company" ? "Strong strategic fit. Already serves the same customer base." : "Responsive. Asked good questions on margins." }];
    b.updatedAt = ev[0].at; b.events = ev;
    await saveBuyerRaw(b); count++;
  }
  const subs: [string, Record<string, string>, number, boolean][] = [
    ["Seller inquiry", { name: "Helen Marsh", email: "helen@brightpathsaas.example", company: "BrightPath SaaS", url: "brightpathsaas.example", details: "B2B scheduling SaaS, $2.4M ARR, 70% margins. Exploring an exit in the next 12 months." }, 1, false],
    ["Valuation request", { name: "Tomás Reyes", email: "tomas@verdeoutdoor.example", company: "Verde Outdoor", industry: "eCommerce or DTC", revenue: "$5M to $10M", profit: "$1M to $3M", timeline: "6 to 12 months" }, 2, false],
    ["Deal alert", { name: "Sasha Lin", email: "sasha@lincapital.example", budget: "$1M to $5M", sectors: "SaaS, Agency", funding: "Investors or a fund" }, 3, false],
    ["Contact", { name: "Ben Ortiz", email: "ben@ortizgroup.example", company: "Ortiz Group", comments: "Do you work with buyers outside the U.S.? We are based in Mexico City." }, 5, true],
    ["Valuation request", { name: "Joanne Pike", email: "joanne@pikemedia.example", company: "Pike Media", industry: "Publishing or media", revenue: "Under $1M", profit: "Under $250K", timeline: "Just exploring" }, 9, true],
    ["Newsletter", { name: "Arun Mehta", email: "arun@mail.example" }, 12, true],
  ];
  for (const [kind, fields, ago, handled] of subs) await saveSubmission({ id: randomUUID(), kind, fields, createdAt: new Date(now - ago * day + 3 * 36e5).toISOString(), handled, demo: true });
  return { buyers: count, inbox: subs.length };
}

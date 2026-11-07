export type Gate = "after_nda" | "after_review";
/** Private deal room content. Only buyers with an open CIM see it. */
export type Room = {
  financials?: { period: string; revenue: number; sde: number }[];
  reason?: string; transition?: string; structure?: string; team?: string;
  faq?: { q: string; a: string }[];
};
export type Listing = {
  slug: string;
  title: string;
  headline: string;
  band: "over" | "under";
  category: string;
  status: "available" | "offers" | "pending" | "sold" | "draft";
  askLabel: string;
  askUsd: number | null;
  metrics: { label: string; value: string }[];
  summary: string;
  highlights: string[];
  body: { heading?: string; text: string }[];
  /** Marty's rule for this listing. `after_nda` opens the CIM once the NDA and profile are done. */
  gate: Gate;
  /** Placeholder rule: 10% of asking. Marty sets the real figure per listing. */
  floorUsd: number | null;
  idealBuyer: "any" | "strategic";
  /** Public fact sheet. Nothing that identifies the business. */
  facts?: { label: string; value: string }[];
  /** Public growth levers, one per line. */
  growth?: string[];
  /** Annual or TTM figures in USD, used for multiples on cards. Leave empty for partial years or other currencies. */
  revenueUsd?: number; earningsUsd?: number;
  room?: Room;
  /** Sample listing from the demo loader. */
  demo?: boolean;
};

export const listings: Listing[] = [
  {
    slug: "insurance-pay-per-call-agency",
    title: "Insurance Pay-Per-Call Marketing Agency",
    headline: "Profitable, high-growth insurance pay-per-call marketing agency",
    band: "over", category: "Agency", status: "available",
    askLabel: "$2,100,000", askUsd: 2100000,
    metrics: [{ label: "TTM revenue", value: "$5.6M+" }, { label: "TTM net income / SDE", value: "$633K+" }, { label: "Margin", value: "11%" }],
    summary: "U.S.-based, fully remote performance marketing company operating in the insurance space on a proven pay-per-call model.",
    highlights: ["About 60 active insurance buyers and about 50 active publishers", "100% U.S.-based revenue", "Fully remote, asset-light operating model", "Exposure to major annual insurance enrollment periods"],
    body: [
      { heading: "A profitable, scalable business", text: "Publishers generate qualified, consumer-initiated inbound insurance calls. The company tracks, routes and optimizes that volume, and insurance buyers, including agencies, carriers and licensed providers, purchase the calls they need to grow." },
      { heading: "How it runs", text: "Founded by serial entrepreneurs with 15+ years of combined experience, the company has stayed lean, asset-light and largely automated. Current ownership devotes only a modest number of hours per week, and growth has come primarily through organic referral." },
      { heading: "Room to grow", text: "Documented headroom includes live call transfers, web and lead-gen expansion, in-house media buying, additional insurance verticals, and a buyer base still under-penetrated relative to publisher supply." },
    ],
    facts: [{ label: "Business model", value: "Pay-per-call lead generation" }, { label: "Location", value: "U.S., fully remote" }, { label: "Customers", value: "About 60 insurance buyers" }, { label: "Supply", value: "About 50 active publishers" }, { label: "Revenue base", value: "100% U.S." }, { label: "Owner time", value: "A modest number of hours per week" }],
    growth: ["Live call transfers", "Web and lead-gen expansion", "In-house media buying", "Additional insurance verticals", "More buyers relative to publisher supply"],
    revenueUsd: 5600000, earningsUsd: 633000,
    gate: "after_review", floorUsd: 210000, idealBuyer: "any",
    room: {
      financials: [{ period: "TTM", revenue: 5600000, sde: 633000 }],
      faq: [{ q: "Is the business tied to the current owners?", a: "Current ownership devotes a modest number of hours per week. The day-to-day is largely automated, and transition support is open to discussion." }, { q: "Where does the revenue come from?", a: "About 60 active insurance buyers, with call volume supplied by about 50 active publishers. All revenue is U.S.-based." }],
    },
  },
  {
    slug: "online-art-design-education",
    title: "Online Art & Design Education Platform",
    headline: "Profitable, premier online art and design education platform with global brand recognition",
    band: "over", category: "eLearning", status: "available",
    askLabel: "$6,500,000 CAD", askUsd: 4700000,
    metrics: [{ label: "Asking, approx. USD", value: "$4.7M" }, { label: "TTM gross revenue", value: "$1,641,978 CAD" }, { label: "Registered users", value: "96,000+" }],
    summary: "Trusted by aspiring and professional artists worldwide for expert-led, video-based instruction in illustration, character design, digital painting and concept art.",
    highlights: ["76 courses taught by 51 industry professionals", "39,031 students served since launch", "4,658 active students in the last 90 days", "365,000+ social followers and 84,000+ email subscribers"],
    body: [{ heading: "The platform", text: "Its teachers include professionals from top animation and VFX studios, giving the brand real standing within the creative industry. A content library of 477 video episodes spans artist interviews, live drawing sessions and industry challenges." }],
    facts: [{ label: "Business model", value: "Video courses and memberships" }, { label: "Catalog", value: "76 courses, 477 episodes" }, { label: "Instructors", value: "51 industry professionals" }, { label: "Students since launch", value: "39,031" }, { label: "Active students, 90 days", value: "4,658" }, { label: "Audience", value: "365K+ social, 84K+ email" }],
    gate: "after_review", floorUsd: 470000, idealBuyer: "any",
  },
  {
    slug: "energy-transition-media-platform",
    title: "Energy Transition Media Platform",
    headline: "Leading energy transition markets media platform, highly profitable",
    band: "over", category: "Publishing", status: "offers",
    askLabel: "Accepting offers", askUsd: null,
    metrics: [{ label: "2025 revenue", value: "$560,000" }, { label: "Users, last three years", value: "7.5M" }, { label: "Google impressions", value: "108M+" }],
    summary: "Established digital media platform serving carbon markets, sustainability, clean energy, critical minerals and energy transition sectors.",
    highlights: ["Nearly 50,000 email subscribers", "Visitors from 247 countries", "Lean operating structure", "Engaged audience of investors, executives and policymakers"],
    body: [{ heading: "The platform", text: "The business delivers industry news, market intelligence, sponsored content and thought leadership, and has built a significant position within a specialized global market." }],
    facts: [{ label: "Business model", value: "Sponsored content and market intelligence" }, { label: "Email subscribers", value: "Nearly 50,000" }, { label: "Reach", value: "Visitors from 247 countries" }, { label: "Audience", value: "Investors, executives, policymakers" }],
    revenueUsd: 560000,
    gate: "after_review", floorUsd: null, idealBuyer: "any",
  },
  {
    slug: "edtech-crm-enrollment-platform",
    title: "EdTech CRM & Enrollment Marketing Platform",
    headline: "Rapid-growing EdTech CRM and marketing platform powering charter school enrollment",
    band: "over", category: "SaaS", status: "available",
    askLabel: "$1,200,000", askUsd: 1200000,
    metrics: [{ label: "TTM revenue", value: "$602,685" }, { label: "School networks", value: "18" }, { label: "Launched", value: "2022" }],
    summary: "A fast-growing, profitable platform that combines a specialized CRM with full-service digital marketing for public charter schools.",
    highlights: ["Strong recurring revenue", "High customer retention", "Lean operational footprint", "Foothold in a $20B+ school recruitment market"],
    body: [{ heading: "The business", text: "Launched in 2022 as a spinoff from a successful digital agency, it now serves 18 school networks across the U.S. The founders are seeking an acquisition partner who can take it to the next level." }],
    facts: [{ label: "Business model", value: "SaaS CRM plus marketing services" }, { label: "Launched", value: "2022" }, { label: "Customers", value: "18 charter school networks" }, { label: "Market", value: "U.S. school enrollment" }],
    revenueUsd: 602685,
    gate: "after_review", floorUsd: 120000, idealBuyer: "any",
  },
  {
    slug: "patented-sports-bbq-brand",
    title: "Patented Sports and BBQ Brand",
    headline: "A grand slam strategic acquisition: licensed baseball brand with MLB and MiLB reach",
    band: "under", category: "Consumer brand", status: "available",
    askLabel: "$895,000", askUsd: 895000,
    metrics: [{ label: "2025 revenue", value: "$644,466" }, { label: "2025 gross profit", value: "$387,595" }, { label: "Inventory, MSRP up to", value: "$940,000" }],
    summary: "Baseball meets grilling: patented products, official league licensing and national distribution, best suited to a strategic acquirer.",
    highlights: ["Official MLB and MiLB licensing rights", "Six issued U.S. design patents", "About 23,000 email subscribers", "About 30 wholesale, retail, dropship and distribution partners"],
    body: [
      { heading: "Who this suits", text: "This opportunity is best suited for a strategic acquirer, not a traditional cash-flow buyer. The brand has generated meaningful revenue but has not achieved consistent profitability as a standalone operation." },
      { heading: "The opportunity", text: "A company in licensed merchandise, sporting goods, grilling, gifting or wholesale could eliminate redundant overhead, improve purchasing and introduce the products to its existing customers." },
      { heading: "Transition", text: "The sellers are open to creative structures including a full acquisition, earn-outs, retained equity, royalty agreements or equity participation, and to meaningful post-transition support." },
    ],
    facts: [{ label: "Business model", value: "Licensed consumer products" }, { label: "Licensing", value: "Official MLB and MiLB" }, { label: "IP", value: "Six U.S. design patents" }, { label: "Channels", value: "About 30 retail and distribution partners" }, { label: "Email list", value: "About 23,000" }, { label: "Best suited to", value: "Strategic acquirer" }],
    revenueUsd: 644466,
    gate: "after_review", floorUsd: 89500, idealBuyer: "strategic",
  },
  {
    slug: "ai-content-intelligence-platform",
    title: "AI Content Intelligence Platform",
    headline: "AI content intelligence platform with recurring revenue and high margins",
    band: "under", category: "SaaS", status: "available",
    askLabel: "$120,000", askUsd: 120000,
    metrics: [{ label: "Revenue, Dec to Sept '26", value: "$97,260" }],
    summary: "Most AI content tools help users write. This platform helps them decide what to write.",
    highlights: ["Proprietary SaaS platform", "Monitors news, newsletters, RSS, video and social conversations", "Turns insights into ready-to-publish content", "Content tailored to each user's voice"],
    body: [{ heading: "The platform", text: "Rather than relying on users to start with a blank prompt, the software continuously identifies the stories and topics audiences already engage with, then transforms them into marketing content, social posts, articles and thought leadership." }],
    facts: [{ label: "Business model", value: "SaaS subscription" }, { label: "Product", value: "Content intelligence and generation" }, { label: "Sources monitored", value: "News, newsletters, RSS, video, social" }],
    gate: "after_nda", floorUsd: 12000, idealBuyer: "any",
  },
  {
    slug: "dtc-health-wellness-portfolio",
    title: "Multi-Brand DTC Health and Wellness Portfolio",
    headline: "Multi-brand DTC portfolio with $3.2M in gross platform health and wellness sales",
    band: "under", category: "DTC", status: "pending",
    askLabel: "$795,000", askUsd: 795000,
    metrics: [{ label: "TTM revenue", value: "$1,042,232" }, { label: "Product margins", value: "93%" }, { label: "Brands", value: "8" }],
    summary: "Eight direct-to-consumer brands across six categories, distributed through a national affiliate network and offered with no inventory to carry.",
    highlights: ["Product fulfilled on demand", "Hundreds of affiliate partners", "All accounts transfer to the buyer", "No minimum order commitments"],
    body: [{ heading: "The portfolio", text: "A buyer's capital goes toward growth instead of goods. Distribution is actively managed through a quarterly partner audit, a partner gifting program and white-glove service for top producers." }],
    facts: [{ label: "Business model", value: "DTC brands via affiliates" }, { label: "Brands", value: "8 across 6 categories" }, { label: "Inventory", value: "None, fulfilled on demand" }, { label: "Product margins", value: "93%" }],
    revenueUsd: 1042232,
    gate: "after_review", floorUsd: 79500, idealBuyer: "any",
  },
  {
    slug: "childrens-language-subscription",
    title: "Children's Language Learning Subscription",
    headline: "Established children's language learning subscription brand with recurring revenue",
    band: "under", category: "Subscription", status: "available",
    askLabel: "$195,000", askUsd: 195000,
    metrics: [{ label: "YTD revenue, through Aug.", value: "$124,849" }, { label: "Inventory, MSRP", value: "$733,000" }],
    summary: "Illustrated storybooks that begin in English and gradually transition into a second language, sold as physical story boxes or digital books with an app.",
    highlights: ["Subscription-based recurring revenue", "Physical and digital formats", "Inventory included in the sale", "Learning through context rather than memorization"],
    body: [{ heading: "The product", text: "Children absorb vocabulary and sentence structure naturally. The result feels like a bedtime story, but functions as a structured language-learning experience." }],
    facts: [{ label: "Business model", value: "Subscription boxes and digital app" }, { label: "Formats", value: "Physical and digital" }, { label: "Inventory included", value: "$733,000 MSRP" }],
    gate: "after_review", floorUsd: 19500, idealBuyer: "any",
  },
];

export const getListing = (slug: string) => listings.find((l) => l.slug === slug);
export const statusLabel = { available: "Available", offers: "Accepting offers", pending: "Sale pending", sold: "Sold", draft: "Hidden" } as const;
export const money = (n: number) => "$" + n.toLocaleString("en-US");
export const compact = (n: number) => (n >= 1e6 ? `$${(n / 1e6).toFixed(n >= 1e7 ? 1 : 2).replace(/\.?0+$/, "")}M` : n >= 1e3 ? `$${Math.round(n / 1e3)}K` : `$${n}`);
/** Asking price over earnings or revenue, only when both are known in USD. */
export const multiples = (l: Listing) => ({ earnings: l.askUsd && l.earningsUsd ? l.askUsd / l.earningsUsd : null, revenue: l.askUsd && l.revenueUsd ? l.askUsd / l.revenueUsd : null });

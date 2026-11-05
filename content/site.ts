export const company = {
  name: "Westbound Road", legal: "Westbound Road, LLC", phone: "(913) 565-2884",
  address: ["1623 Central Avenue, Suite 18", "Cheyenne, WY 82001"],
};
export const nav = [
  { href: "/buy", label: "Buy" }, { href: "/sell", label: "Sell" }, { href: "/grow", label: "Grow" }, { href: "/valuation", label: "Valuation" },
  { href: "/team", label: "Team" }, { href: "/success", label: "Results" }, { href: "/insights", label: "Insights" },
];
export const stats = [
  { value: "78.6%", label: "of the businesses we list get sold" },
  { value: "230+", label: "acquisition funding strategies" },
  { value: "5", label: "offers on an average deal" },
  { value: "60%", label: "of our deals cross international borders" },
];
export const differences = [
  ["Certified M&A advisors, not just listing agents", "We go far beyond listing your business. We act as strategic partners, helping you position for maximum value and guiding every step of the exit."],
  ["You work with experts, not interns", "You work directly with experienced M&A professionals who have been operators themselves. No junior reps. No handoffs."],
  ["Fewer clients, more attention", "We intentionally limit the number of clients we take on, so you never get lost in a sea of listings."],
  ["No sugarcoating, no B.S., no surprises", "We tell you what your business is really worth, what buyers are really looking for, and how to position it."],
  ["Built by operators, for operators", "We have built and sold businesses too, so we understand the value behind the numbers and how to explain it to buyers."],
  ["Marketing that actually sells", "We launch a multi-channel campaign that tells your business's story to sophisticated buyers in the right places."],
] as const;
export const team = [
  { id: "marty", name: "Marty M. Fahncke", role: "Co-Founder and Partner", cred: "Certified M&A Advisor", bio: "A marketer with over 30 years of experience growing and scaling businesses, and over 20 years in mergers and acquisitions. Marty has helped businesses scale to over $1 billion in revenue and executed over $450 million in M&A transactions. He is the author of a best-selling book on business acquisitions. His name is pronounced Fawn-Key." },
  { id: "becky", name: "Becky J. Smith", role: "Co-Founder and Partner", cred: "Certified M&A Advisor", bio: "A seasoned entrepreneur with over $50 million in revenue generated across multiple ventures. Becky pairs a deep online marketing background with a straight-talking, results-driven approach, and believes every business sale deserves a strategy, not just a listing." },
  { id: "steve", name: "Steve Kilberg", role: "Acquisition Advisor", cred: "MBA", bio: "An internet direct marketing professional with over 20 years of business experience. Steve built a seven-figure eCommerce business on an idea he and his wife had at dinner one night, and speaks internationally on growth inside online businesses." },
  { id: "bill", name: "Bill O'Connor", role: "Acquisition Advisor", cred: "Operations and finance", bio: "Bill's career spans operations, manufacturing, regulatory compliance, finance, logistics and supply chain, from start-ups to Fortune 500 companies. He brings an objective approach, with the interests of all stakeholders as a priority." },
  { id: "monique", name: "Monique Messer-Baldwin", role: "Strategic Advisor", cred: "Acquisition and private lending", bio: "A growth advisor with proven systems for scaling through existing assets and targeted joint ventures, and over 22 years of experience in acquiring real estate properties, judgments and mortgages." },
];
export const testimonials = [
  { quote: "Westbound Road efficiently helped us close on time, which was crucial to us.", name: "Matt Anderson", role: "Founder, Nexwear.com", side: "Buyer" },
  { quote: "I highly recommend Westbound Road for high quality, professional and cost-effective M&A Advisory services.", name: "Zach Anderson", role: "Founder, RingBot", side: "Seller" },
  { quote: "We will be connecting every founder we know looking for an exit to Marty and his team going forward!", name: "Sydney Larson & Jason Holloway", role: "Co-Founders, Lily Bird, Inc.", side: "Seller" },
  { quote: "I know who to call for the next exit!", name: "Olam Sule", role: "Founder, King Leonidas", side: "Seller" },
  { quote: "I would recommend Marty to anyone looking to sell their business.", name: "Stephanie Lyons", role: "Founder, Barre Intensity", side: "Seller" },
];
export const media = [
  ["How2Exit: Mergers and Acquisitions of Small to Middle-Market Businesses", "Podcast", "https://www.spreaker.com/user/ronaldskelton/m-fahncke-full-interview"],
  ["Saving businesses and saving jobs through strategic investing", "Article", "https://dmcenter.com/strategic-investments/"],
  ["Marketing, Mergers and more about Marty Fahncke", "Video", "https://www.adventuristmarketing.com/blog/marketing-mergers-and-more-about-marty"],
  ["Chasing the Whale", "Video", "https://www.youtube.com/watch?v=_wqDlvCVqnI"],
  ["More Than One Way to Grow Your Business", "Podcast", "https://gaildoby.com/more-than-one-way-to-grow-your-business/"],
  ["Interview with Marty Fahncke", "Podcast", "https://www.listennotes.com/podcasts/absolute-business/interview-with-marty-fahncke-CVxHdj3ZtFc/"],
  ["Smarter Ways to Invest in Social Media and Your Business", "Podcast", "https://growing-social-now-with-barbara-rozgonyi.simplecast.com/episodes/marty-fahnke-social-media-investor-DVkXtl2a"],
] as const;
export const legalNote = "This site is for informational purposes only. It does not contain any investment recommendations whatsoever. Reliance on any statements, materials, information, data or resources made available in connection with this site is solely at your own risk. The information on this site is not intended as an offer or solicitation to buy or sell securities.";

/** Public sold listings from westboundroad.com. Generic descriptions only, as shown there. */
export const soldDeals = [
  ["Marketing automation SaaS", "SaaS"], ["Powersports aftermarket manufacturer", "Manufacturing"], ["eCommerce health subscription", "Subscription"],
  ["Digital performance marketing agency", "Agency"], ["Senior facility management SaaS", "SaaS"], ["25-year-old design firm", "Services"],
  ["Automated social media content platform", "SaaS"], ["Customer engagement SaaS", "SaaS"], ["10-year-old reusable drinkware brand", "Consumer brand"],
  ["AI sales personalization SaaS", "SaaS"], ["Portfolio of 19 software and AI products", "Portfolio"], ["Remote developer recruiting platform", "Marketplace"],
  ["Clean beauty eCommerce and Amazon brand", "eCommerce"], ["Tutoring center software", "SaaS"], ["Sustainable travel gear brand", "DTC"],
  ["Remodeling and design-build business", "Services"], ["Children's language book publisher", "DTC"], ["Starter business platform", "Marketplace"],
  ["Premium gaming computer shop", "eCommerce"], ["Men's grooming Amazon FBA brand", "eCommerce"], ["Fast-growing AI media platform", "Publishing"],
] as const;

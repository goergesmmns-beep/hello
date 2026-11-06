import type { NextConfig } from "next";

const moved: Record<string, string> = {
  "/index.html": "/",
  "/available-for-acquisition.html": "/buy",
  "/businesses-for-sale-over-one-million.html": "/buy",
  "/businesses-for-sale-under-one-million.html": "/buy",
  "/high-growth-insurance-pay-per-call-marketing-agency.html": "/buy/insurance-pay-per-call-agency",
  "/high-growth-insurance-pay-per-call-marketing-agency-nda.html": "/buy/insurance-pay-per-call-agency/request",
  "/premier-online-art-design-education-platform.html": "/buy/online-art-design-education",
  "/premier-online-art-design-education-platform-nda.html": "/buy/online-art-design-education/request",
  "/leading-energy-markets-media-platform.html": "/buy/energy-transition-media-platform",
  "/leading-energy-markets-media-platform-nda.html": "/buy/energy-transition-media-platform/request",
  "/scalable-edtech-crm-school-enrollment-marketing-platform.html": "/buy/edtech-crm-enrollment-platform",
  "/scalable-edtech-crm-school-enrollment-marketing-platform-nda.html": "/buy/edtech-crm-enrollment-platform/request",
  "/multi-brand-dtc-health-and-wellness-portfolio.html": "/buy/dtc-health-wellness-portfolio",
  "/patented-sports-and-bbq-brand.html": "/buy/patented-sports-bbq-brand",
  "/patented-sports-and-bbq-brand-nda.html": "/buy/patented-sports-bbq-brand/request",
  "/ai-content-intelligence-platform.html": "/buy/ai-content-intelligence-platform",
  "/ai-content-intelligence-platform-nda.html": "/buy/ai-content-intelligence-platform/request",
  "/childrens-language-learning-book-subscription.html": "/buy/childrens-language-subscription",
  "/childrens-language-learning-book-subscription-nda.html": "/buy/childrens-language-subscription/request",
  "/sell-your-business.html": "/sell",
  "/sell-my-business.html": "/sell",
  "/business-valuation.html": "/valuation",
  "/team.html": "/team",
  "/about.html": "/about",
  "/referral-program.html": "/referrals",
  "/contact.html": "/contact",
  "/success.html": "/success",
  "/press1.html": "/media",
  "/media.html": "/media",
  "/blog.html": "/insights",
  "/blog": "/insights",
  "/privacy-policy.html": "/privacy",
  "/acquisitions-alliance.html": "/acquisitions-alliance",
  "/3-quick-tips-and-3-telling-questions-for-savvy-buyers.html": "/insights/savvy-buyers",
};

const config: NextConfig = {
  poweredByHeader: false,
  outputFileTracingIncludes: { "/api/cim/**": ["./private/cims/**"], "/admin/integrations": ["./private/cims/**"] },
  async redirects() {
    return Object.entries(moved).map(([source, destination]) => ({ source, destination, permanent: true }));
  },
  async headers() {
    const base = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
    ];
    const privateArea = [{ key: "X-Robots-Tag", value: "noindex, nofollow" }, { key: "Cache-Control", value: "no-store" }];
    return [
      { source: "/:path*", headers: base },
      { source: "/access/:path*", headers: privateArea },
      { source: "/admin/:path*", headers: privateArea },
      { source: "/unsubscribe/:path*", headers: privateArea },
    ];
  },
};
export default config;

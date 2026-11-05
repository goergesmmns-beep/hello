import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  if (process.env.TEST_MODE === "true") return { rules: { userAgent: "*", disallow: "/" } };
  return { rules: { userAgent: "*", allow: "/", disallow: ["/access/", "/admin/", "/api/"] } };
}

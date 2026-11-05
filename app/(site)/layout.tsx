import { Footer, Header } from "@/components/chrome";
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <><Header /><main>{children}</main><Footer /></>;
}

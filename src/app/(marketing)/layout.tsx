import "@/styles/skavyra-site.css";

import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { MarketingPageMotion } from "@/components/marketing/MarketingPageMotion";
import { WhatsAppFloat } from "@/components/marketing/WhatsAppFloat";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="site">
      <a href="#main" className="skip">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main"><MarketingPageMotion>{children}</MarketingPageMotion></main>
      <SiteFooter />
      <WhatsAppFloat />
    </div>
  );
}

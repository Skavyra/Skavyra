import "@/styles/skavyra-site.css";

import AuthPanelPhoto from "@/components/marketing/AuthPanelPhoto";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="site"><AuthPanelPhoto>{children}</AuthPanelPhoto></div>;
}

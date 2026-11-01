import type { ReactNode } from "react";

export function FlagshipStripMotion({ children }: { children: ReactNode }) {
  return <div className="flag__grid">{children}</div>;
}

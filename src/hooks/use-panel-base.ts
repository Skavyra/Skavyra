"use client";

import { usePathname } from "next/navigation";

/** "/hr" when rendered inside the HR panel, otherwise "/admin". Lets shared components link within their own panel. */
export function usePanelBase(): "/admin" | "/hr" {
  return usePathname().startsWith("/hr") ? "/hr" : "/admin";
}

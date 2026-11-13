import type { AppRole } from "@/types";

/** Shared page bodies render inside either the admin or the HR panel. */
export type PanelProps = {
  base: "/admin" | "/hr";
  /** Roles allowed to see the page. Passed to requireRole. */
  roles: AppRole[];
};

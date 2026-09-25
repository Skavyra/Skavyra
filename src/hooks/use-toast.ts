"use client";

import { toast } from "sonner";

import type { ActionResult } from "@/types";

export { toast };

/** Shows the right toast for a server action result and returns whether it succeeded. */
export function toastResult<T>(result: ActionResult<T>, success: string) {
  if (result.ok) toast.success(success);
  else toast.error(result.error);
  return result.ok;
}

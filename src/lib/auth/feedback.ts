"use client";

import { toast } from "sonner";

/**
 * One place for sign-in, sign-up and reset messages. They appear as toasts, and a fixed id means a second attempt
 * replaces the first message instead of stacking another one under it.
 */
const ID = "auth-feedback";

export const authError = (message: string | null | undefined) => {
  if (message) toast.error(message, { id: ID });
};

export const authSuccess = (message: string) => toast.success(message, { id: ID });

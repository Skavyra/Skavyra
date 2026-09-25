"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { payNow } from "@/actions/payments";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { formatInr } from "@/lib/utils";

/**
 * Payments run through the simulate-payment edge function while the client is
 * still on simulated mode, so the dialog says exactly what will happen.
 */
export function PayButton({
  enrollmentId,
  amount,
  installmentId,
  purpose,
  label = "Pay",
  variant = "default",
  size = "sm",
  upiId,
}: {
  enrollmentId: string;
  amount: number;
  installmentId?: string | null;
  purpose: "registration" | "installment" | "full" | "balance";
  label?: string;
  variant?: "default" | "gold" | "outline";
  size?: "sm" | "default" | "lg";
  upiId?: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  return (
    <>
      <Button variant={variant} size={size} onClick={() => setOpen(true)}>
        {label}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Pay {formatInr(amount)}</DialogTitle>
            <DialogDescription>
              Card and UPI checkout is not switched on yet. Confirming records this payment and unlocks your course
              straight away, and your counsellor will collect the amount{upiId ? ` on ${upiId}` : ""}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              loading={pending}
              onClick={() =>
                start(async () => {
                  const result = await payNow({ enrollmentId, amount, installmentId, purpose });
                  if (!result.ok) {
                    toast.error(result.error);
                    return;
                  }
                  toast.success(`${formatInr(amount)} recorded`);
                  setOpen(false);
                  router.refresh();
                })
              }
            >
              Confirm payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

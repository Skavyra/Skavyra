"use client";

import { Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { uploadPaymentProof } from "@/actions/leads";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { toast } from "@/hooks/use-toast";

/**
 * Counsellors log a UPI payment with its screenshot. It is saved as pending
 * and only an admin's verification makes it count, through apply_payment().
 */
export function PaymentProofUpload({ leadId }: { leadId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  return (
    <form
      className="flex flex-col gap-4 rounded-xl border bg-muted/40 p-4"
      action={(formData) => {
        setError(null);
        start(async () => {
          const result = await uploadPaymentProof(leadId, formData);
          if (!result.ok) {
            setError(result.error);
            return;
          }
          toast.success("Payment logged. An admin will verify it.");
          setFileName(null);
          router.refresh();
        });
      }}
    >
      <div>
        <h3 className="font-display text-sm font-bold">Log a payment</h3>
        <p className="mt-1 text-xs text-muted-foreground">Upload the UPI screenshot. An admin verifies it before it counts.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Amount received" htmlFor={`amount-${leadId}`}>
          <Input id={`amount-${leadId}`} name="amount" inputMode="decimal" required />
        </Field>
        <Field label="UPI reference" htmlFor={`ref-${leadId}`}>
          <Input id={`ref-${leadId}`} name="transaction_ref" required />
        </Field>
        <Field label="Towards" htmlFor={`purpose-${leadId}`}>
          <NativeSelect id={`purpose-${leadId}`} name="purpose" defaultValue="registration">
            <option value="registration">Registration</option>
            <option value="installment">Installment</option>
            <option value="full">Full fee</option>
            <option value="balance">Balance</option>
          </NativeSelect>
        </Field>
        <Field label="Screenshot" htmlFor={`proof-${leadId}`}>
          <Input
            id={`proof-${leadId}`}
            name="proof"
            type="file"
            accept="image/*,application/pdf"
            required
            className="file:mr-3 file:rounded file:bg-muted file:px-2 file:py-1 file:text-xs"
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
          />
        </Field>
      </div>
      {fileName && <p className="text-xs text-muted-foreground">Selected: {fileName}</p>}
      {error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}
      <Button type="submit" size="sm" loading={pending} className="self-start">
        <Upload /> Save payment
      </Button>
    </form>
  );
}

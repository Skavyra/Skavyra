"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";

import { saveLetterTemplate, saveSetting } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import type { CompanySettings } from "@/lib/pdf/shared";
import type { TemplateBody } from "@/lib/pdf/offer-letter";

type PaymentSettings = { upi_id?: string; provider?: string; currency?: string };
type CertificateSettings = { prefix?: string; verify_base_url?: string };

function SaveButton({ pending }: { pending: boolean }) {
  return (
    <Button type="submit" loading={pending} className="self-start">
      Save
    </Button>
  );
}

export function SettingsForms({
  company,
  payments,
  certificates,
  template,
  templateVersion,
}: {
  company: CompanySettings;
  payments: PaymentSettings;
  certificates: CertificateSettings;
  template: TemplateBody;
  templateVersion: number;
}) {
  const [pending, start] = useTransition();
  const [clauses, setClauses] = useState<string[]>(template.clauses ?? []);

  const save = (key: "company" | "payments" | "certificates", formData: FormData) =>
    start(async () => {
      const result = await saveSetting(key, formData);
      if (!result.ok) toast.error(result.error);
      else toast.success("Saved");
    });

  return (
    <Tabs defaultValue="company">
      <TabsList>
        <TabsTrigger value="company">Company</TabsTrigger>
        <TabsTrigger value="payments">Payments</TabsTrigger>
        <TabsTrigger value="certificates">Certificates</TabsTrigger>
        <TabsTrigger value="template">Offer letter</TabsTrigger>
      </TabsList>

      <TabsContent value="company">
        <form
          className="flex max-w-2xl flex-col gap-4 rounded-xl border bg-card p-5"
          action={(fd) => save("company", fd)}
        >
          <Field label="Legal name" htmlFor="legal_name">
            <Input id="legal_name" name="legal_name" defaultValue={company.legal_name ?? ""} />
          </Field>
          <Field label="Registered address" htmlFor="address">
            <Textarea id="address" name="address" rows={3} defaultValue={company.address ?? ""} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Support email" htmlFor="support_email">
              <Input id="support_email" name="support_email" type="email" defaultValue={company.support_email ?? ""} />
            </Field>
            <Field label="Support phone" htmlFor="support_phone">
              <Input id="support_phone" name="support_phone" defaultValue={company.support_phone ?? ""} />
            </Field>
          </div>
          <Field label="GSTIN" htmlFor="gstin" hint="Printed on receipts and offer letters when set.">
            <Input id="gstin" name="gstin" defaultValue={company.gstin ?? ""} className="max-w-xs" />
          </Field>
          <SaveButton pending={pending} />
        </form>
      </TabsContent>

      <TabsContent value="payments">
        <form
          className="flex max-w-2xl flex-col gap-4 rounded-xl border bg-card p-5"
          action={(fd) => save("payments", fd)}
        >
          <Field label="UPI id" htmlFor="upi_id" hint="Shown to students when they pay.">
            <Input id="upi_id" name="upi_id" defaultValue={payments.upi_id ?? ""} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Gateway" htmlFor="provider" hint="Leave as simulated until Razorpay is live.">
              <Input id="provider" name="provider" defaultValue={payments.provider ?? "simulated"} />
            </Field>
            <Field label="Currency" htmlFor="currency">
              <Input id="currency" name="currency" defaultValue={payments.currency ?? "INR"} />
            </Field>
          </div>
          <SaveButton pending={pending} />
        </form>
      </TabsContent>

      <TabsContent value="certificates">
        <form
          className="flex max-w-2xl flex-col gap-4 rounded-xl border bg-card p-5"
          action={(fd) => save("certificates", fd)}
        >
          <Field label="Certificate prefix" htmlFor="prefix" hint="Numbers look like SKV-26-00001.">
            <Input id="prefix" name="prefix" defaultValue={certificates.prefix ?? "SKV"} className="max-w-[10rem]" />
          </Field>
          <Field label="Verification link base" htmlFor="verify_base_url" hint="The token is added to the end of this.">
            <Input id="verify_base_url" name="verify_base_url" defaultValue={certificates.verify_base_url ?? ""} />
          </Field>
          <SaveButton pending={pending} />
        </form>
      </TabsContent>

      <TabsContent value="template">
        <form
          className="flex max-w-2xl flex-col gap-5 rounded-xl border bg-card p-5"
          action={(fd) =>
            start(async () => {
              const result = await saveLetterTemplate({
                name: "standard",
                intro: String(fd.get("intro") ?? ""),
                clauses: clauses.filter((c) => c.trim()),
                closing: String(fd.get("closing") ?? ""),
              });
              if (!result.ok) toast.error(result.error);
              else toast.success(`Saved as version ${result.data.version}`);
            })
          }
        >
          <p className="text-sm text-muted-foreground">
            Version {templateVersion} is in use. Saving creates a new version, so letters already generated keep their
            wording. Use {"{{candidate_name}}"}, {"{{role_title}}"}, {"{{ctc}}"} and {"{{joining_date}}"} anywhere.
          </p>
          <Field label="Opening paragraph" htmlFor="intro">
            <Textarea id="intro" name="intro" rows={4} defaultValue={template.intro ?? ""} />
          </Field>

          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-semibold">Terms</legend>
            {clauses.map((clause, i) => (
              <div key={i} className="flex items-start gap-2">
                <Textarea
                  aria-label={`Term ${i + 1}`}
                  rows={2}
                  value={clause}
                  onChange={(e) => setClauses((c) => c.map((x, xi) => (xi === i ? e.target.value : x)))}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove term ${i + 1}`}
                  onClick={() => setClauses((c) => c.filter((_, xi) => xi !== i))}
                >
                  <Trash2 />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" className="self-start" onClick={() => setClauses((c) => [...c, ""])}>
              <Plus /> Add a term
            </Button>
          </fieldset>

          <Field label="Closing paragraph" htmlFor="closing">
            <Textarea id="closing" name="closing" rows={3} defaultValue={template.closing ?? ""} />
          </Field>
          <SaveButton pending={pending} />
        </form>
      </TabsContent>
    </Tabs>
  );
}

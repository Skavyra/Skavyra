import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export const metadata: Metadata = {
  title: "Verify a certificate",
  description: "Check that a Skavyra certificate is genuine.",
};

export default function VerifyPage() {
  async function check(formData: FormData) {
    "use server";
    const token = String(formData.get("token") ?? "").trim();
    redirect(token ? `/verify/${encodeURIComponent(token)}` : "/verify");
  }

  return (
    <div className="container section max-w-xl">
      <h1 className="text-fluid-3xl">Verify a certificate</h1>
      <p className="mt-4 text-muted-foreground">
        Enter the verification code printed on the certificate, or open the link on it directly.
      </p>
      <form action={check} className="mt-8 flex flex-col gap-4">
        <Field label="Verification code" htmlFor="token">
          <Input id="token" name="token" placeholder="e.g. 9f2c4a7b1d3e5f60" required />
        </Field>
        <Button type="submit" size="lg" className="self-start">
          Check certificate
        </Button>
      </form>
    </div>
  );
}

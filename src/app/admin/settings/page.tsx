import type { Metadata } from "next";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { SettingsForms } from "@/components/settings/SettingsForms";
import { requireRole } from "@/lib/auth/require-role";
import type { TemplateBody } from "@/lib/pdf/offer-letter";
import type { CompanySettings } from "@/lib/pdf/shared";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  await requireRole("admin");
  const supabase = await createClient();

  const [{ data: settings }, { data: template }] = await Promise.all([
    supabase.from("app_settings").select("key, value"),
    supabase.from("offer_letter_templates").select("body, version").eq("is_active", true).order("version", { ascending: false }).limit(1).maybeSingle(),
  ]);

  const byKey = new Map((settings ?? []).map((s) => [s.key, s.value as Record<string, unknown>]));

  return (
    <div className="max-w-4xl">
      <PageHeader title="Settings" description="Company details, payments, certificates and the offer letter wording." />
      <SettingsForms
        company={(byKey.get("company") ?? {}) as CompanySettings}
        payments={byKey.get("payments") ?? {}}
        certificates={byKey.get("certificates") ?? {}}
        template={(template?.body ?? {}) as TemplateBody}
        templateVersion={template?.version ?? 1}
      />
    </div>
  );
}

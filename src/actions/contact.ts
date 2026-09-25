"use server";

import { getUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";
import { contactSchema } from "@/lib/validations/contact";
import { firstError, formToObject } from "@/lib/validations/common";
import type { ActionResult } from "@/types";

/**
 * Website form -> student_leads with source website_form, left unassigned
 * until an admin distributes it. Visitors have no direct insert rights, so
 * this calls submit_contact_lead(), a security-definer function that
 * validates the input and owns the lead on the earliest admin account.
 */
export async function submitContact(formData: FormData): Promise<ActionResult> {
  const parsed = contactSchema.safeParse(formToObject(formData));
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };

  const topic = formData.get("topic");
  const remarks = [parsed.data.remarks, topic === "college" ? "Enquiry from a college" : null].filter(Boolean).join(". ");

  const supabase = await createClient();
  const { error } = await supabase.rpc("submit_contact_lead", {
    p_full_name: parsed.data.full_name,
    p_phone: parsed.data.phone,
    p_email: parsed.data.email ?? null,
    p_interested_course_text: parsed.data.interested_course_text ?? null,
    p_remarks: remarks || null,
  });

  if (error) {
    // unique phone among live leads: the student is already with a counsellor
    if (error.code === "23505") return { ok: true, data: undefined };
    return { ok: false, error: "Your details could not be saved. Try again in a minute." };
  }
  return { ok: true, data: undefined };
}

/**
 * "Enroll now" for a signed-in student who is not enrolled yet. Enrolments are
 * created by staff (create_enrollment is staff-only), so this raises a website
 * lead for the course and a counsellor sets up the plan.
 */
export async function requestEnrollment(courseTitle: string): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "Log in first." };
  const phone = user.profile?.phone;
  if (!phone) return { ok: false, error: "Add your mobile number in your profile so a counsellor can call you." };

  const formData = new FormData();
  formData.set("full_name", [user.profile?.first_name, user.profile?.last_name].filter(Boolean).join(" ") || user.email);
  formData.set("phone", phone);
  formData.set("email", user.email);
  formData.set("interested_course_text", courseTitle);
  formData.set("remarks", "Enrolment request from the course page");
  return submitContact(formData);
}

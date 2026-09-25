import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { LEAD_STATUSES, PAGE_SIZE } from "@/lib/constants";
import { fullName } from "@/lib/utils";
import type { Database, LeadStatus, StudentLead } from "@/types";

export type LeadQuery = { q?: string; status?: string; assignee?: string; follow?: string; page?: string };

export const LEAD_STATUS_FILTER = {
  key: "status",
  label: "Any status",
  options: LEAD_STATUSES.map((s) => ({ value: s.value, label: s.label })),
};

export const FOLLOW_UP_FILTER = {
  key: "follow",
  label: "Any follow up",
  options: [
    { value: "today", label: "Due today" },
    { value: "overdue", label: "Overdue" },
    { value: "week", label: "Next 7 days" },
    { value: "none", label: "No date set" },
  ],
};

function dayBounds() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  const week = new Date(start);
  week.setDate(week.getDate() + 7);
  return { start: start.toISOString(), end: end.toISOString(), week: week.toISOString() };
}

/**
 * Shared lead list query. RLS already limits an employee to their own leads,
 * so the same code serves both panels.
 */
export async function fetchLeads(
  supabase: SupabaseClient<Database>,
  params: LeadQuery,
  options: { assignedTo?: string; unassignedOnly?: boolean } = {},
) {
  const page = Math.max(1, Number(params.page) || 1);
  let query = supabase
    .from("student_leads")
    .select(
      "id, full_name, phone, college_name, status, follow_up_on, assigned_employee_id, assignee:profiles!student_leads_assigned_employee_id_fkey(first_name, last_name)",
      { count: "exact" },
    )
    .is("deleted_at", null);

  if (options.assignedTo) query = query.eq("assigned_employee_id", options.assignedTo);
  if (options.unassignedOnly) query = query.is("assigned_employee_id", null);
  if (params.assignee === "unassigned") query = query.is("assigned_employee_id", null);
  else if (params.assignee) query = query.eq("assigned_employee_id", params.assignee);

  if (params.status) query = query.eq("status", params.status as LeadStatus);

  if (params.q) {
    const term = params.q.replace(/[%,()]/g, "");
    query = query.or(`full_name.ilike.%${term}%,phone.ilike.%${term}%,college_name.ilike.%${term}%,email.ilike.%${term}%`);
  }

  const { start, end, week } = dayBounds();
  if (params.follow === "today") query = query.gte("follow_up_on", start).lt("follow_up_on", end);
  if (params.follow === "overdue") query = query.lt("follow_up_on", start);
  if (params.follow === "week") query = query.gte("follow_up_on", start).lt("follow_up_on", week);
  if (params.follow === "none") query = query.is("follow_up_on", null);

  const { data, count } = await query
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  return {
    page,
    total: count ?? 0,
    pageCount: Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE)),
    leads: (data ?? []).map((l) => ({
      id: l.id,
      full_name: l.full_name,
      phone: l.phone,
      college_name: l.college_name,
      status: l.status,
      follow_up_on: l.follow_up_on,
      assigned_employee_id: l.assigned_employee_id,
      assignee_name: fullName(l.assignee) || null,
    })),
  };
}

/** Everything the detail panel needs for one lead. */
export async function fetchLeadDetail(supabase: SupabaseClient<Database>, leadId: string) {
  const { data: lead } = await supabase.from("student_leads").select("*").eq("id", leadId).maybeSingle();
  if (!lead) return null;

  const [{ data: activities }, { data: picked }, { data: courses }, { data: assignee }] = await Promise.all([
    supabase
      .from("lead_activities")
      .select("id, action, old_status, new_status, notes, created_at, actor:profiles(first_name, last_name)")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false })
      .limit(30),
    supabase.from("lead_courses").select("course_id").eq("lead_id", leadId),
    supabase.from("courses").select("id, title").eq("status", "published").order("sort_order"),
    lead.assigned_employee_id
      ? supabase.from("profiles").select("first_name, last_name").eq("id", lead.assigned_employee_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return {
    lead: lead as StudentLead,
    activities: (activities ?? []).map((a) => ({
      id: a.id,
      action: a.action,
      old_status: a.old_status,
      new_status: a.new_status,
      notes: a.notes,
      created_at: a.created_at,
      actor_name: fullName(a.actor) || null,
    })),
    selectedCourseIds: (picked ?? []).map((p) => p.course_id),
    courses: courses ?? [],
    assigneeName: fullName(assignee) || null,
  };
}

/** Active counsellors with their open lead counts, for the assign dialogs. */
export async function fetchCounsellors(supabase: SupabaseClient<Database>) {
  const { data: employees } = await supabase
    .from("employees")
    .select("id, is_active, profile:profiles!employees_id_fkey(first_name, last_name)")
    .eq("is_active", true);

  const active = employees ?? [];
  if (active.length === 0) return [];

  const { data: openLeads } = await supabase
    .from("student_leads")
    .select("assigned_employee_id")
    .is("deleted_at", null)
    .in("status", ["new", "interested", "follow_up", "callback_requested", "called_no_response"]);

  const counts = new Map<string, number>();
  for (const l of openLeads ?? []) {
    if (l.assigned_employee_id) counts.set(l.assigned_employee_id, (counts.get(l.assigned_employee_id) ?? 0) + 1);
  }

  return active
    .map((e) => ({ id: e.id, name: fullName(e.profile) || "Unnamed", openLeads: counts.get(e.id) ?? 0 }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

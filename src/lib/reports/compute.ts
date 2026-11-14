import { LEAD_STATUSES } from "@/lib/constants";
import type { LeadStatus } from "@/types";

/* ---------- dates (everything is bucketed by the Indian calendar day) ---------- */

const TZ = "Asia/Kolkata";

export const istDay = (iso: string) => new Date(iso).toLocaleDateString("en-CA", { timeZone: TZ });
export const todayKey = () => istDay(new Date().toISOString());

function addDays(key: string, n: number) {
  const d = new Date(`${key}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
function addMonths(monthKey: string, n: number) {
  const [y, m] = monthKey.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + n, 1));
  return d.toISOString().slice(0, 7);
}
function weekStart(key: string) {
  const dow = (new Date(`${key}T00:00:00Z`).getUTCDay() + 6) % 7; // Monday = 0
  return addDays(key, -dow);
}
const dayLabel = (key: string) =>
  new Date(`${key}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" });
const monthLabel = (key: string) =>
  new Date(`${key}-01T00:00:00Z`).toLocaleDateString("en-IN", { month: "short", year: "numeric", timeZone: "UTC" });

export const PERIODS = [
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "month", label: "This month" },
  { value: "lastmonth", label: "Last month" },
  { value: "all", label: "All time" },
  { value: "custom", label: "Custom dates" },
] as const;
export type Period = (typeof PERIODS)[number]["value"];

export type Range = { from: string | null; to: string | null; label: string; period: Period };

export function resolveRange(period: string | undefined, from?: string, to?: string): Range {
  const today = todayKey();
  const iso = /^\d{4}-\d{2}-\d{2}$/;
  if (period === "custom" && from && to && iso.test(from) && iso.test(to) && from <= to) {
    return { from, to, label: `${dayLabel(from)} to ${dayLabel(to)}`, period: "custom" };
  }
  switch (period) {
    case "today":
      return { from: today, to: today, label: "Today", period: "today" };
    case "7d":
      return { from: addDays(today, -6), to: today, label: "Last 7 days", period: "7d" };
    case "month":
      return { from: `${today.slice(0, 7)}-01`, to: today, label: "This month", period: "month" };
    case "lastmonth":
      return {
        from: `${addMonths(today.slice(0, 7), -1)}-01`,
        to: addDays(`${today.slice(0, 7)}-01`, -1),
        label: "Last month",
        period: "lastmonth",
      };
    case "all":
      return { from: null, to: null, label: "All time", period: "all" };
    default:
      return { from: addDays(today, -29), to: today, label: "Last 30 days", period: "30d" };
  }
}

const inRange = (day: string, r: Range) => (!r.from || day >= r.from) && (!r.to || day <= r.to);

/* ---------- inputs ---------- */

export type LeadIn = {
  id: string;
  status: LeadStatus;
  assigned_employee_id: string | null;
  assigned_at: string | null;
  created_at: string;
  last_contacted_at: string | null;
};
export type ActivityIn = {
  lead_id: string;
  actor_id: string | null;
  action: string;
  old_status: LeadStatus | null;
  new_status: LeadStatus | null;
  created_at: string;
};
export type PaymentIn = { amount: number; status: string; paid_at: string | null; created_at: string; lead_id: string | null; enrollment_id: string | null };
export type EnrollmentIn = {
  id: string;
  user_id: string;
  course_id: string;
  lead_id: string | null;
  enrolled_by: string | null;
  total_amount: number;
  amount_paid: number;
  payment_status: string;
  created_at: string;
};
export type CourseIn = { id: string; title: string; price: number };
export type EmployeeIn = { id: string; name: string; active: boolean };
export type StudentIn = { id: string; name: string; email: string };

/* ---------- outputs ---------- */

export type StatusCounts = Record<LeadStatus, number>;
const emptyCounts = (): StatusCounts => Object.fromEntries(LEAD_STATUSES.map((s) => [s.value, 0])) as StatusCounts;

export type EmployeeRow = {
  id: string;
  name: string;
  active: boolean;
  pipeline: number;
  enrolledNow: number;
  conversion: number;
  updates: number;
  activeDays: number;
  avgPerActiveDay: number;
  changes: StatusCounts;
  enrolments: number;
  collected: number;
};

export type Bucket = {
  label: string;
  newLeads: number;
  updates: number;
  interested: number;
  followUp: number;
  notInterested: number;
  enrolments: number;
  collected: number;
};

export type CourseRow = {
  id: string;
  title: string;
  price: number;
  students: number;
  newInPeriod: number;
  collectedInPeriod: number;
  collectedTotal: number;
  outstanding: number;
  list: { name: string; email: string; enrolledOn: string; total: number; paid: number; balance: number; status: string; counsellor: string }[];
};

export type Report = {
  range: Range;
  employeeName: string | null;
  kpis: { newLeads: number; updates: number; interested: number; notInterested: number; followUp: number; enrolments: number; collected: number };
  employees: EmployeeRow[];
  pipeline: { rows: { id: string; name: string; counts: StatusCounts; total: number }[]; unassigned: StatusCounts & { total: number } };
  daily: Bucket[];
  weekly: Bucket[];
  monthly: Bucket[];
  employeeMonthly: { employee: string; month: string; updates: number; enrolments: number; collected: number }[];
  courses: CourseRow[];
  unlinkedCollected: number;
};

/* ---------- the report ---------- */

export function buildReport(input: {
  leads: LeadIn[];
  activities: ActivityIn[];
  payments: PaymentIn[];
  enrollments: EnrollmentIn[];
  courses: CourseIn[];
  employees: EmployeeIn[];
  students: StudentIn[];
  range: Range;
  employeeId: string | null;
}): Report {
  const { leads, activities, enrollments, courses, employees, range, employeeId } = input;
  const payments = input.payments.filter((p) => p.status === "success");
  const nameOf = new Map(employees.map((e) => [e.id, e.name]));
  const studentOf = new Map(input.students.map((s) => [s.id, s]));

  const leadOwner = new Map(leads.map((l) => [l.id, l.assigned_employee_id]));
  const enrollmentById = new Map(enrollments.map((e) => [e.id, e]));

  /** Who gets credit for an enrolment: the counsellor holding its lead, else whoever enrolled the student. */
  const enrolmentOwner = (e: EnrollmentIn) => (e.lead_id ? leadOwner.get(e.lead_id) ?? null : null) ?? e.enrolled_by ?? null;
  const paymentOwner = (p: PaymentIn) => {
    if (p.lead_id && leadOwner.get(p.lead_id)) return leadOwner.get(p.lead_id) ?? null;
    const e = p.enrollment_id ? enrollmentById.get(p.enrollment_id) : undefined;
    return e ? enrolmentOwner(e) : null;
  };

  const mine = (owner: string | null | undefined) => !employeeId || owner === employeeId;

  /* events, each reduced to a day and an owner */
  const leadEvents = leads.filter((l) => mine(l.assigned_employee_id)).map((l) => ({ day: istDay(l.created_at) }));
  const actEvents = activities
    .filter((a) => a.action !== "created" && mine(a.actor_id))
    .map((a) => ({
      day: istDay(a.created_at),
      actor: a.actor_id,
      change: a.new_status && a.old_status && a.new_status !== a.old_status ? a.new_status : null,
    }));
  const enrolEvents = enrollments.map((e) => ({ day: istDay(e.created_at), owner: enrolmentOwner(e), id: e.id })).filter((e) => mine(e.owner));
  const payEvents = payments
    .map((p) => ({ day: istDay(p.paid_at ?? p.created_at), owner: paymentOwner(p), amount: Number(p.amount), enrollmentId: p.enrollment_id }))
    .filter((p) => mine(p.owner));

  /* ---- headline numbers for the chosen period ---- */
  const inPeriodActs = actEvents.filter((a) => inRange(a.day, range));
  const countChange = (s: LeadStatus) => inPeriodActs.filter((a) => a.change === s).length;
  const kpis = {
    newLeads: leadEvents.filter((l) => inRange(l.day, range)).length,
    updates: inPeriodActs.length,
    interested: countChange("interested"),
    notInterested: countChange("not_interested"),
    followUp: countChange("follow_up"),
    enrolments: enrolEvents.filter((e) => inRange(e.day, range)).length,
    collected: payEvents.filter((p) => inRange(p.day, range)).reduce((s, p) => s + p.amount, 0),
  };

  /* ---- one row per counsellor ---- */
  const visibleEmployees = employees.filter((e) => !employeeId || e.id === employeeId);
  const employeeRows: EmployeeRow[] = visibleEmployees
    .map((e) => {
      const held = leads.filter((l) => l.assigned_employee_id === e.id);
      const enrolledNow = held.filter((l) => l.status === "enrolled").length;
      const acts = activities.filter((a) => a.actor_id === e.id && a.action !== "created" && inRange(istDay(a.created_at), range));
      const changes = emptyCounts();
      const days = new Set<string>();
      for (const a of acts) {
        days.add(istDay(a.created_at));
        if (a.new_status && a.old_status && a.new_status !== a.old_status) changes[a.new_status] += 1;
      }
      return {
        id: e.id,
        name: e.name,
        active: e.active,
        pipeline: held.length,
        enrolledNow,
        conversion: held.length ? Math.round((enrolledNow / held.length) * 100) : 0,
        updates: acts.length,
        activeDays: days.size,
        avgPerActiveDay: days.size ? Math.round((acts.length / days.size) * 10) / 10 : 0,
        changes,
        enrolments: enrollments.filter((x) => enrolmentOwner(x) === e.id && inRange(istDay(x.created_at), range)).length,
        collected: payments
          .filter((p) => paymentOwner(p) === e.id && inRange(istDay(p.paid_at ?? p.created_at), range))
          .reduce((s, p) => s + Number(p.amount), 0),
      };
    })
    .sort((a, b) => b.collected - a.collected || b.enrolments - a.enrolments || b.updates - a.updates);

  /* ---- pipeline now: current status of every lead each person holds ---- */
  const pipelineRows = visibleEmployees.map((e) => {
    const counts = emptyCounts();
    let total = 0;
    for (const l of leads) if (l.assigned_employee_id === e.id) (counts[l.status] += 1, (total += 1));
    return { id: e.id, name: e.name, counts, total };
  });
  const unassigned = { ...emptyCounts(), total: 0 };
  if (!employeeId) for (const l of leads) if (!l.assigned_employee_id) (unassigned[l.status] += 1, (unassigned.total += 1));

  /* ---- daily, weekly and monthly sheets (fixed windows, not tied to the period filter) ---- */
  const today = todayKey();
  const blank = (label: string): Bucket => ({ label, newLeads: 0, updates: 0, interested: 0, followUp: 0, notInterested: 0, enrolments: 0, collected: 0 });

  function sheet(keys: { key: string; label: string }[], keyOf: (day: string) => string): Bucket[] {
    const map = new Map(keys.map((k) => [k.key, blank(k.label)]));
    for (const l of leadEvents) {
      const b = map.get(keyOf(l.day));
      if (b) b.newLeads += 1;
    }
    for (const a of actEvents) {
      const b = map.get(keyOf(a.day));
      if (!b) continue;
      b.updates += 1;
      if (a.change === "interested") b.interested += 1;
      if (a.change === "follow_up") b.followUp += 1;
      if (a.change === "not_interested") b.notInterested += 1;
    }
    for (const e of enrolEvents) {
      const b = map.get(keyOf(e.day));
      if (b) b.enrolments += 1;
    }
    for (const p of payEvents) {
      const b = map.get(keyOf(p.day));
      if (b) b.collected += p.amount;
    }
    return keys.map((k) => map.get(k.key)!);
  }

  const dayKeys = Array.from({ length: 31 }, (_, i) => addDays(today, -(30 - i))).map((k) => ({ key: k, label: dayLabel(k) }));
  const weekKeys = Array.from({ length: 12 }, (_, i) => addDays(weekStart(today), -7 * (11 - i))).map((k) => ({ key: k, label: `Week of ${dayLabel(k)}` }));
  const monthKeys = Array.from({ length: 12 }, (_, i) => addMonths(today.slice(0, 7), -(11 - i))).map((k) => ({ key: k, label: monthLabel(k) }));

  const daily = sheet(dayKeys, (d) => d);
  const weekly = sheet(weekKeys, weekStart);
  const monthly = sheet(monthKeys, (d) => d.slice(0, 7));

  /* ---- each counsellor by month, the basis for pay ---- */
  const employeeMonthly: Report["employeeMonthly"] = [];
  for (const e of visibleEmployees) {
    for (const m of monthKeys) {
      const updates = activities.filter((a) => a.actor_id === e.id && a.action !== "created" && istDay(a.created_at).slice(0, 7) === m.key).length;
      const enrols = enrollments.filter((x) => enrolmentOwner(x) === e.id && istDay(x.created_at).slice(0, 7) === m.key).length;
      const collected = payments
        .filter((p) => paymentOwner(p) === e.id && istDay(p.paid_at ?? p.created_at).slice(0, 7) === m.key)
        .reduce((s, p) => s + Number(p.amount), 0);
      if (updates || enrols || collected) employeeMonthly.push({ employee: e.name, month: m.label, updates, enrolments: enrols, collected });
    }
  }

  /* ---- per course ---- */
  const courseRows: CourseRow[] = courses.map((c) => {
    const mine = enrollments.filter((e) => e.course_id === c.id && (!employeeId || enrolmentOwner(e) === employeeId));
    const paid = payments.filter((p) => p.enrollment_id && mine.some((e) => e.id === p.enrollment_id));
    return {
      id: c.id,
      title: c.title,
      price: Number(c.price),
      students: mine.length,
      newInPeriod: mine.filter((e) => inRange(istDay(e.created_at), range)).length,
      collectedInPeriod: paid.filter((p) => inRange(istDay(p.paid_at ?? p.created_at), range)).reduce((s, p) => s + Number(p.amount), 0),
      collectedTotal: paid.reduce((s, p) => s + Number(p.amount), 0),
      outstanding: mine.filter((e) => e.payment_status !== "refunded").reduce((s, e) => s + Math.max(0, Number(e.total_amount) - Number(e.amount_paid)), 0),
      list: mine
        .map((e) => ({
          name: studentOf.get(e.user_id)?.name || "Unnamed",
          email: studentOf.get(e.user_id)?.email ?? "",
          enrolledOn: istDay(e.created_at),
          total: Number(e.total_amount),
          paid: Number(e.amount_paid),
          balance: Math.max(0, Number(e.total_amount) - Number(e.amount_paid)),
          status: e.payment_status,
          counsellor: nameOf.get(enrolmentOwner(e) ?? "") ?? "—",
        }))
        .sort((a, b) => b.enrolledOn.localeCompare(a.enrolledOn)),
    };
  });

  const unlinkedCollected = payEvents.filter((p) => !p.enrollmentId && inRange(p.day, range)).reduce((s, p) => s + p.amount, 0);

  return {
    range,
    employeeName: employeeId ? nameOf.get(employeeId) ?? null : null,
    kpis,
    employees: employeeRows,
    pipeline: { rows: pipelineRows, unassigned },
    daily,
    weekly,
    monthly,
    employeeMonthly,
    courses: courseRows.sort((a, b) => b.students - a.students),
    unlinkedCollected,
  };
}

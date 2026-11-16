"use client";

import { Download, FileText } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LEAD_STATUSES } from "@/lib/constants";
import { downloadSheet, downloadWorkbook } from "@/lib/excel/parse";
import { downloadTablePdf } from "@/lib/pdf/shared";
import type { Bucket, Report } from "@/lib/reports/compute";
import { cn, formatInr } from "@/lib/utils";

const GOLD = ["#F2C75C", "#DDAA2F", "#B98A24", "#8E6718", "#0D0D0D"];

/* ---------- one table shape that feeds the screen, Excel and PDF ---------- */

type Val = string | number;
type Sheet = { head: string[]; body: Val[][]; foot?: Val[][]; money?: number[] };

const show = (v: Val, col: number, money?: number[]) => (money?.includes(col) && typeof v === "number" ? formatInr(v) : String(v));
const rowsOf = (t: Sheet) => [...t.body, ...(t.foot ?? [])];
const asObjects = (t: Sheet) => rowsOf(t).map((r) => Object.fromEntries(t.head.map((h, i) => [h, r[i]])));
const sum = (rows: Val[][], col: number) => rows.reduce((s, r) => s + (Number(r[col]) || 0), 0);
const avg = (rows: Val[][], col: number) => (rows.length ? Math.round((sum(rows, col) / rows.length) * 10) / 10 : 0);

function SheetView({ title, file, t, empty }: { title: string; file: string; t: Sheet; empty?: string }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => downloadSheet(`${file}.xlsx`, title, asObjects(t))}>
          <Download /> Excel
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => downloadTablePdf({ title, filename: `${file}.pdf`, head: t.head, body: rowsOf(t).map((r) => r.map((v, i) => show(v, i, t.money))) })}
        >
          <FileText /> PDF
        </Button>
      </div>
      {t.body.length === 0 ? (
        <p className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">{empty ?? "Nothing to show for these filters."}</p>
      ) : (
        <div className="max-h-[34rem] overflow-auto rounded-xl border bg-card">
          <Table>
            <TableHeader className="sticky top-0 z-10">
              <TableRow>
                {t.head.map((h, i) => (
                  <TableHead key={h} className={cn(i > 0 && "text-right")}>
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {t.body.map((r, ri) => (
                <TableRow key={ri}>
                  {r.map((v, i) => (
                    <TableCell key={i} className={cn(i > 0 && "text-right tabular-nums", i === 0 && "font-medium")}>
                      {show(v, i, t.money)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              {(t.foot ?? []).map((r, ri) => (
                <TableRow key={`f${ri}`} className="bg-muted/60 font-semibold">
                  {r.map((v, i) => (
                    <TableCell key={i} className={cn(i > 0 && "text-right tabular-nums")}>
                      {show(v, i, t.money)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

/* ---------- sheet builders ---------- */

function periodic(buckets: Bucket[], first: string): Sheet {
  const body = buckets.map((b) => [b.label, b.newLeads, b.updates, b.interested, b.followUp, b.notInterested, b.enrolments, b.collected]);
  return {
    head: [first, "New leads", "Updates", "Interested", "Follow up", "Not interested", "Enrolments", "Collected"],
    body,
    foot: [
      ["Total", ...[1, 2, 3, 4, 5, 6, 7].map((c) => sum(body, c))],
      ["Average per row", ...[1, 2, 3, 4, 5, 6, 7].map((c) => avg(body, c))],
    ],
    money: [7],
  };
}

export function ReportTabs({ report, statusFilter, initialTab }: { report: Report; statusFilter: string; initialTab: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [tab, setTab] = useState(initialTab);
  const [sheetKind, setSheetKind] = useState<"daily" | "weekly" | "monthly">("daily");
  const [courseId, setCourseId] = useState("");

  function changeTab(next: string) {
    setTab(next);
    const q = new URLSearchParams(params.toString());
    q.set("tab", next);
    router.replace(`${pathname}?${q.toString()}`, { scroll: false });
  }

  const statuses = LEAD_STATUSES.filter((s) => !statusFilter || s.value === statusFilter);
  const who = report.employeeName ?? "all employees";

  /* counsellors */
  const empBody = report.employees.map((e) => [
    e.name,
    e.pipeline,
    e.updates,
    e.activeDays,
    e.avgPerActiveDay,
    e.changes.interested,
    e.changes.follow_up,
    e.changes.not_interested,
    e.enrolments,
    e.conversion,
    e.collected,
  ]);
  const employees: Sheet = {
    head: ["Employee", "Leads held", "Updates", "Active days", "Updates per active day", "Marked interested", "Marked follow up", "Marked not interested", "Enrolments", "Conversion % (all time)", "Collected"],
    body: empBody,
    foot: [
      ["Total", ...[1, 2, 3, 4, 5, 6, 7, 8].map((c) => (c === 4 ? "" : sum(empBody, c))), "", sum(empBody, 10)],
      ["Average per employee", ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((c) => avg(empBody, c))],
    ],
    money: [10],
  };

  /* status changes in the period */
  const changeBody = report.employees.map((e) => [e.name, ...statuses.map((s) => e.changes[s.value]), statuses.reduce((n, s) => n + e.changes[s.value], 0)]);
  const changes: Sheet = {
    head: ["Employee", ...statuses.map((s) => s.label), "Total"],
    body: changeBody,
    foot: [
      ["Total", ...statuses.map((_, i) => sum(changeBody, i + 1)), sum(changeBody, statuses.length + 1)],
      ["Average per employee", ...statuses.map((_, i) => avg(changeBody, i + 1)), avg(changeBody, statuses.length + 1)],
    ],
  };

  /* pipeline right now */
  const pipeBody: Val[][] = report.pipeline.rows.map((r) => [r.name, ...statuses.map((s) => r.counts[s.value]), statuses.reduce((n, s) => n + r.counts[s.value], 0)]);
  const un = report.pipeline.unassigned;
  const pipeAll = [...pipeBody];
  if (!report.employeeName) pipeAll.push(["Unassigned", ...statuses.map((s) => un[s.value]), statuses.reduce((n, s) => n + un[s.value], 0)]);
  const pipeline: Sheet = {
    head: ["Employee", ...statuses.map((s) => s.label), "Total"],
    body: pipeAll,
    foot: [
      ["Total", ...statuses.map((_, i) => sum(pipeAll, i + 1)), sum(pipeAll, statuses.length + 1)],
      ["Average per employee", ...statuses.map((_, i) => avg(pipeBody, i + 1)), avg(pipeBody, statuses.length + 1)],
    ],
  };

  /* day / week / month */
  const sheets = { daily: periodic(report.daily, "Day"), weekly: periodic(report.weekly, "Week"), monthly: periodic(report.monthly, "Month") };
  const monthlyByEmployee: Sheet = {
    head: ["Employee", "Month", "Updates", "Enrolments", "Collected"],
    body: report.employeeMonthly.map((r) => [r.employee, r.month, r.updates, r.enrolments, r.collected]),
    money: [4],
  };

  /* courses */
  const courseBody = report.courses.map((c) => [c.title, c.price, c.students, c.newInPeriod, c.collectedInPeriod, c.collectedTotal, c.outstanding]);
  const courses: Sheet = {
    head: ["Course", "Price", "Students", `New (${report.range.label})`, `Collected (${report.range.label})`, "Collected (all time)", "Still to collect"],
    body: courseBody,
    foot: [["Total", "", sum(courseBody, 2), sum(courseBody, 3), sum(courseBody, 4), sum(courseBody, 5), sum(courseBody, 6)]],
    money: [1, 4, 5, 6],
  };
  const chosen = report.courses.find((c) => c.id === courseId);
  const studentHead = ["Student", "Email", "Enrolled on", "Fee", "Paid", "Balance", "Payment", "Employee"];
  const studentRows = (list: Report["courses"][number]["list"]) => list.map((s) => [s.name, s.email, s.enrolledOn, s.total, s.paid, s.balance, s.status, s.counsellor]);
  const students: Sheet = { head: studentHead, body: chosen ? studentRows(chosen.list) : [], money: [3, 4, 5] };

  function downloadAll() {
    const stamp = new Date().toISOString().slice(0, 10);
    downloadWorkbook(`skavyra-performance-${stamp}.xlsx`, [
      { name: "Employees", rows: asObjects(employees) },
      { name: "Status changes", rows: asObjects(changes) },
      { name: "Pipeline now", rows: asObjects(pipeline) },
      { name: "Daily", rows: asObjects(sheets.daily) },
      { name: "Weekly", rows: asObjects(sheets.weekly) },
      { name: "Monthly", rows: asObjects(sheets.monthly) },
      { name: "Employee by month", rows: asObjects(monthlyByEmployee) },
      { name: "Courses", rows: asObjects(courses) },
      {
        name: "Course students",
        rows: report.courses.flatMap((c) => c.list.map((s) => ({ Course: c.title, Student: s.name, Email: s.email, "Enrolled on": s.enrolledOn, Fee: s.total, Paid: s.paid, Balance: s.balance, Payment: s.status, Counsellor: s.counsellor }))),
      },
    ]);
  }

  const k = report.kpis;
  const stamp = report.range.label.replace(/\W+/g, "-").toLowerCase();

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Showing <strong className="text-foreground">{who}</strong> · {report.range.label}
        </p>
        <Button size="sm" onClick={downloadAll}>
          <Download /> Full workbook (Excel)
        </Button>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="New leads" value={k.newLeads} />
        <StatCard label="Updates logged" value={k.updates} hint={`${k.interested} interested · ${k.followUp} follow up · ${k.notInterested} not interested`} />
        <StatCard label="Enrolments" value={k.enrolments} />
        <StatCard label="Collected" value={formatInr(k.collected)} tone="gold" />
      </div>

      <div className="mt-8">
        <Tabs value={tab} onValueChange={changeTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="employees">Employees</TabsTrigger>
            <TabsTrigger value="status">Status</TabsTrigger>
            <TabsTrigger value="sheets">Day, week, month</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="h-80 rounded-xl border bg-card p-4">
                <p className="mb-2 text-sm font-semibold">Pipeline by status, right now</p>
                <ResponsiveContainer width="100%" height="90%">
                  <BarChart
                    data={LEAD_STATUSES.map((s) => ({ stage: s.label, count: report.pipeline.rows.reduce((n, r) => n + r.counts[s.value], 0) + (report.employeeName ? 0 : un[s.value]) }))}
                    layout="vertical"
                    margin={{ left: 8, right: 16 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E6DFCF" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                    <YAxis type="category" dataKey="stage" width={120} tick={{ fontSize: 12 }} />
                    <Tooltip cursor={{ fill: "rgba(221,170,47,0.08)" }} />
                    <Bar dataKey="count" name="Leads" radius={[0, 6, 6, 0]}>
                      {LEAD_STATUSES.map((_, i) => (
                        <Cell key={i} fill={GOLD[i % GOLD.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="h-80 rounded-xl border bg-card p-4">
                <p className="mb-2 text-sm font-semibold">Last 12 months</p>
                <ResponsiveContainer width="100%" height="90%">
                  <LineChart data={report.monthly.map((m) => ({ month: m.label, collected: m.collected, enrolments: m.enrolments }))} margin={{ left: 8, right: 16 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E6DFCF" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 12 }} width={70} />
                    <Tooltip formatter={(value: number, name) => (name === "Collected" ? formatInr(value) : value)} />
                    <Legend />
                    <Line type="monotone" dataKey="collected" name="Collected" stroke="#B98A24" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="enrolments" name="Enrolments" stroke="#0D0D0D" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Money and enrolments are credited to the counsellor who holds the lead (or who enrolled the student). Updates are the status
              changes and notes an employee saves on a lead. Dates follow the Indian calendar day.
            </p>
          </TabsContent>

          <TabsContent value="employees">
            <SheetView title={`Employee performance, ${report.range.label}`} file={`skavyra-employees-${stamp}`} t={employees} empty="No employees yet." />
            <p className="mt-3 text-sm text-muted-foreground">
              Pick an employee in the filter above for their individual report across every tab.
            </p>
          </TabsContent>

          <TabsContent value="status">
            <div className="flex flex-col gap-8">
              <div>
                <h3 className="mb-2 font-display text-base font-bold">Status changes made, {report.range.label}</h3>
                <SheetView title="Status changes" file={`skavyra-status-changes-${stamp}`} t={changes} />
              </div>
              <div>
                <h3 className="mb-2 font-display text-base font-bold">Leads by status, right now</h3>
                <SheetView title="Pipeline now" file="skavyra-pipeline-now" t={pipeline} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sheets">
            <div className="mb-3 flex flex-wrap gap-2">
              {(["daily", "weekly", "monthly"] as const).map((kind) => (
                <Button key={kind} size="sm" variant={sheetKind === kind ? "default" : "outline"} onClick={() => setSheetKind(kind)}>
                  {kind === "daily" ? "Daily (31 days)" : kind === "weekly" ? "Weekly (12 weeks)" : "Monthly (12 months)"}
                </Button>
              ))}
            </div>
            <SheetView title={`${sheetKind} report`} file={`skavyra-${sheetKind}-report`} t={sheets[sheetKind]} />
            <h3 className="mb-2 mt-8 font-display text-base font-bold">Each employee, month by month (for pay)</h3>
            <SheetView title="Employee by month" file="skavyra-employee-by-month" t={monthlyByEmployee} empty="No activity in the last 12 months." />
          </TabsContent>

          <TabsContent value="courses">
            <SheetView title={`Courses, ${report.range.label}`} file={`skavyra-courses-${stamp}`} t={courses} empty="No courses yet." />
            {report.unlinkedCollected > 0 && (
              <p className="mt-3 text-sm text-muted-foreground">
                Another {formatInr(report.unlinkedCollected)} was collected in this period before the student was enrolled in a course, so it
                is not counted against any course above.
              </p>
            )}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <h3 className="font-display text-base font-bold">Students in a course</h3>
              <NativeSelect value={courseId} onChange={(e) => setCourseId(e.target.value)} className="w-72 text-sm" aria-label="Choose a course">
                <option value="">Choose a course…</option>
                {report.courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} ({c.students})
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="mt-3">
              {chosen ? (
                <SheetView title={`${chosen.title}, students`} file={`skavyra-students-${chosen.id.slice(0, 8)}`} t={students} empty="No students in this course yet." />
              ) : (
                <p className="text-sm text-muted-foreground">Choose a course to see who is enrolled, what they paid and what is left.</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

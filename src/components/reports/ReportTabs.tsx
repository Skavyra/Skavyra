"use client";

import { Download, FileText } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { DataTable, type Column } from "@/components/dashboard/DataTable";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { downloadSheet } from "@/lib/excel/parse";
import { downloadTablePdf } from "@/lib/pdf/shared";
import { formatInr } from "@/lib/utils";

export type FunnelPoint = { stage: string; count: number };
export type CounsellorRow = {
  id: string;
  name: string;
  assigned: number;
  contacted: number;
  interested: number;
  enrolled: number;
  conversion: number;
};
export type RevenuePoint = { month: string; collected: number; enrolments: number };

const GOLD = ["#F2C75C", "#DDAA2F", "#B98A24", "#8E6718", "#0D0D0D"];

export function ReportTabs({
  funnel,
  counsellors,
  revenue,
  totals,
}: {
  funnel: FunnelPoint[];
  counsellors: CounsellorRow[];
  revenue: RevenuePoint[];
  totals: { collected: number; enrolments: number; leads: number };
}) {
  const counsellorColumns: Column<CounsellorRow>[] = [
    { key: "name", header: "Counsellor", cell: (r) => r.name },
    { key: "assigned", header: "Assigned", cell: (r) => r.assigned },
    { key: "contacted", header: "Contacted", cell: (r) => r.contacted },
    { key: "interested", header: "Interested", cell: (r) => r.interested },
    { key: "enrolled", header: "Enrolled", cell: (r) => r.enrolled },
    { key: "conversion", header: "Conversion", cell: (r) => `${r.conversion}%` },
  ];

  const counsellorSheet = counsellors.map((c) => ({
    Counsellor: c.name,
    Assigned: c.assigned,
    Contacted: c.contacted,
    Interested: c.interested,
    Enrolled: c.enrolled,
    "Conversion %": c.conversion,
  }));

  return (
    <Tabs defaultValue="funnel">
      <TabsList>
        <TabsTrigger value="funnel">Lead funnel</TabsTrigger>
        <TabsTrigger value="counsellors">Counsellors</TabsTrigger>
        <TabsTrigger value="revenue">Revenue</TabsTrigger>
      </TabsList>

      <TabsContent value="funnel">
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadSheet("skavyra-funnel.xlsx", "Funnel", funnel.map((f) => ({ Stage: f.stage, Leads: f.count })))}
          >
            <Download /> Excel
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              downloadTablePdf({
                title: "Lead funnel",
                filename: "skavyra-funnel.pdf",
                head: ["Stage", "Leads"],
                body: funnel.map((f) => [f.stage, String(f.count)]),
              })
            }
          >
            <FileText /> PDF
          </Button>
        </div>
        <div className="mt-4 h-80 rounded-xl border bg-card p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={funnel} layout="vertical" margin={{ left: 8, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E6DFCF" horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="stage" width={120} tick={{ fontSize: 12 }} />
              <Tooltip cursor={{ fill: "rgba(221,170,47,0.08)" }} />
              <Bar dataKey="count" name="Leads" radius={[0, 6, 6, 0]}>
                {funnel.map((_, i) => (
                  <Cell key={i} fill={GOLD[i % GOLD.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </TabsContent>

      <TabsContent value="counsellors">
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => downloadSheet("skavyra-counsellors.xlsx", "Counsellors", counsellorSheet)}>
            <Download /> Excel
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              downloadTablePdf({
                title: "Counsellor performance",
                filename: "skavyra-counsellors.pdf",
                head: ["Counsellor", "Assigned", "Contacted", "Interested", "Enrolled", "Conversion %"],
                body: counsellors.map((c) => [c.name, String(c.assigned), String(c.contacted), String(c.interested), String(c.enrolled), `${c.conversion}%`]),
              })
            }
          >
            <FileText /> PDF
          </Button>
        </div>
        <div className="mt-4">
          <DataTable
            rows={counsellors}
            columns={counsellorColumns}
            rowKey={(r) => r.id}
            empty={<p className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">No counsellors yet.</p>}
          />
        </div>
      </TabsContent>

      <TabsContent value="revenue">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {formatInr(totals.collected)} collected across {totals.enrolments} enrolments.
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                downloadSheet(
                  "skavyra-revenue.xlsx",
                  "Revenue",
                  revenue.map((r) => ({ Month: r.month, Collected: r.collected, Enrolments: r.enrolments })),
                )
              }
            >
              <Download /> Excel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                downloadTablePdf({
                  title: "Revenue by month",
                  filename: "skavyra-revenue.pdf",
                  head: ["Month", "Collected", "Enrolments"],
                  body: revenue.map((r) => [r.month, formatInr(r.collected), String(r.enrolments)]),
                })
              }
            >
              <FileText /> PDF
            </Button>
          </div>
        </div>
        <div className="mt-4 h-80 rounded-xl border bg-card p-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenue} margin={{ left: 8, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E6DFCF" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} width={70} />
              <Tooltip formatter={(value: number, name) => (name === "collected" ? formatInr(value) : value)} />
              <Legend />
              <Line type="monotone" dataKey="collected" name="Collected" stroke="#B98A24" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="enrolments" name="Enrolments" stroke="#0D0D0D" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </TabsContent>
    </Tabs>
  );
}

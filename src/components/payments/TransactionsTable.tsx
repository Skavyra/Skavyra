"use client";

import { Download } from "lucide-react";

import { PaymentBadge } from "@/components/dashboard/StatusBadge";
import { DataTable, type Column } from "@/components/dashboard/DataTable";
import { Button } from "@/components/ui/button";
import { downloadSheet } from "@/lib/excel/parse";
import { formatDate, formatInr } from "@/lib/utils";

export type TransactionRow = {
  id: string;
  created_at: string;
  paid_at: string | null;
  amount: number;
  purpose: string;
  provider: string;
  status: string;
  reference: string;
  who: string;
  course: string;
};

export function TransactionsTable({ rows }: { rows: TransactionRow[] }) {
  const columns: Column<TransactionRow>[] = [
    { key: "date", header: "Date", cell: (r) => formatDate(r.paid_at ?? r.created_at) },
    { key: "who", header: "Student", cell: (r) => r.who },
    { key: "course", header: "Course", cell: (r) => r.course },
    { key: "amount", header: "Amount", cell: (r) => <span className="font-semibold">{formatInr(r.amount)}</span> },
    { key: "provider", header: "Provider", cell: (r) => <span className="capitalize">{r.provider.replace("_", " ")}</span> },
    { key: "reference", header: "Reference", cell: (r) => <span className="font-mono text-xs">{r.reference}</span> },
    { key: "status", header: "Status", cell: (r) => <PaymentBadge status={r.status} /> },
  ];

  return (
    <>
      <div className="mb-3 flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            downloadSheet(
              `skavyra-payments-${new Date().toISOString().slice(0, 10)}.xlsx`,
              "Payments",
              rows.map((r) => ({
                Date: formatDate(r.paid_at ?? r.created_at),
                Student: r.who,
                Course: r.course,
                Amount: r.amount,
                Towards: r.purpose,
                Provider: r.provider,
                Reference: r.reference,
                Status: r.status,
              })),
            )
          }
        >
          <Download /> Export
        </Button>
      </div>
      <DataTable
        rows={rows}
        columns={columns}
        rowKey={(r) => r.id}
        empty={<p className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">No transactions yet.</p>}
      />
    </>
  );
}

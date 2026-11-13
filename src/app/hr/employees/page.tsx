import type { Metadata } from "next";

import { EmployeesView } from "@/components/panels/EmployeesView";

export const metadata: Metadata = { title: "Employees" };

export default function Page() {
  return <EmployeesView base="/hr" roles={["hr", "admin"]} />;
}

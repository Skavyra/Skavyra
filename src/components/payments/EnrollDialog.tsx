"use client";

import { GraduationCap, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { createEnrollment, searchStudents } from "@/actions/enrollments";
import { createUserAccount } from "@/actions/staff";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { cn, formatInr } from "@/lib/utils";

import { InstallmentBuilder, type InstallmentDraft } from "./InstallmentBuilder";

type Student = { id: string; name: string; email: string; phone: string | null };
export type EnrollCourse = { id: string; title: string; price: number; allows_partial: boolean };

/** Search an existing student or create the login, pick the course, set the plan. */
export function EnrollDialog({ courses, leadId }: { courses: EnrollCourse[]; leadId?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [student, setStudent] = useState<Student | null>(null);
  const [results, setResults] = useState<Student[]>([]);
  const [term, setTerm] = useState("");
  const [courseId, setCourseId] = useState(courses[0]?.id ?? "");
  const [plan, setPlan] = useState<"full" | "partial">("full");
  const [totalInput, setTotalInput] = useState("");
  const [rows, setRows] = useState<InstallmentDraft[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const course = courses.find((c) => c.id === courseId);
  const total = totalInput === "" ? (course?.price ?? 0) : Number(totalInput) || 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <GraduationCap /> Enrol a student
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Enrol a student</DialogTitle>
          <DialogDescription>Find their account or create one, then set the fee and plan.</DialogDescription>
        </DialogHeader>

        {student ? (
          <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/50 p-3">
            <div className="min-w-0">
              <p className="truncate font-semibold">{student.name}</p>
              <p className="truncate text-xs text-muted-foreground">{student.email}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setStudent(null)}>
              Change
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="search">
            <TabsList>
              <TabsTrigger value="search">Find student</TabsTrigger>
              <TabsTrigger value="create">Create login</TabsTrigger>
            </TabsList>
            <TabsContent value="search">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    placeholder="Name, email or phone"
                    aria-label="Search students"
                    className="pl-9"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  loading={pending}
                  onClick={() =>
                    start(async () => {
                      const result = await searchStudents(term);
                      if (!result.ok) {
                        toast.error(result.error);
                        return;
                      }
                      setResults(result.data);
                    })
                  }
                >
                  Search
                </Button>
              </div>
              <ul className="mt-3 flex max-h-48 flex-col gap-1 overflow-y-auto">
                {results.length === 0 && <li className="text-sm text-muted-foreground">No results yet.</li>}
                {results.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => setStudent(s)}
                      className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-muted"
                    >
                      <span className="font-semibold">{s.name}</span>
                      <span className="block text-xs text-muted-foreground">
                        {s.email}
                        {s.phone ? ` · ${s.phone}` : ""}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </TabsContent>

            <TabsContent value="create">
              <form
                className="flex flex-col gap-3"
                action={(formData) => {
                  formData.set("role", "student");
                  setError(null);
                  start(async () => {
                    const result = await createUserAccount(formData);
                    if (!result.ok) {
                      setError(result.error);
                      return;
                    }
                    setStudent({
                      id: result.data.user_id,
                      name: `${formData.get("first_name")} ${formData.get("last_name")}`.trim(),
                      email: String(formData.get("email")),
                      phone: String(formData.get("phone") ?? "") || null,
                    });
                    toast.success(result.data.invited ? "Invite sent" : "Login created");
                  });
                }}
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="First name" htmlFor="s-first">
                    <Input id="s-first" name="first_name" required />
                  </Field>
                  <Field label="Last name" htmlFor="s-last">
                    <Input id="s-last" name="last_name" />
                  </Field>
                  <Field label="Email" htmlFor="s-email">
                    <Input id="s-email" name="email" type="email" required />
                  </Field>
                  <Field label="Phone" htmlFor="s-phone">
                    <Input id="s-phone" name="phone" inputMode="numeric" />
                  </Field>
                  <Field label="Password" htmlFor="s-password" hint="10+ characters, or empty to invite." className="sm:col-span-2">
                    <Input id="s-password" name="password" type="password" />
                  </Field>
                </div>
                <Button type="submit" variant="outline" loading={pending} className="self-start">
                  Create login
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        )}

        <div className="grid gap-4 border-t pt-4 sm:grid-cols-2">
          <Field label="Course" htmlFor="enrol-course">
            <NativeSelect
              id="enrol-course"
              value={courseId}
              onChange={(e) => {
                setCourseId(e.target.value);
                setTotalInput("");
                setPlan("full");
                setRows([]);
              }}
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} — {formatInr(c.price)}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field label="Total fee" htmlFor="enrol-total" hint="Change it to apply a discount.">
            <Input
              id="enrol-total"
              inputMode="decimal"
              value={totalInput}
              placeholder={String(course?.price ?? 0)}
              onChange={(e) => setTotalInput(e.target.value)}
            />
          </Field>
        </div>

        <div className="flex gap-2">
          {(["full", "partial"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => {
                setPlan(p);
                if (p === "partial" && rows.length === 0) {
                  setRows([{ seq: 1, label: "Registration", amount: total, due_date: "" }]);
                }
              }}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-semibold",
                plan === p ? "border-ink bg-ink text-ivory" : "hover:border-gold-300",
              )}
            >
              {p === "full" ? "Full payment" : "Installments"}
            </button>
          ))}
        </div>

        {plan === "partial" && <InstallmentBuilder total={total} rows={rows} onChange={setRows} />}

        {error && (
          <p role="alert" className="text-sm font-medium text-destructive">
            {error}
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            loading={pending}
            disabled={!student || !courseId}
            onClick={() => {
              setError(null);
              start(async () => {
                const result = await createEnrollment({
                  user_id: student!.id,
                  course_id: courseId,
                  plan,
                  total_amount: total,
                  installments: rows.map((r, i) => ({
                    seq: i + 1,
                    label: r.label || `Installment ${i + 1}`,
                    amount: r.amount,
                    due_date: r.due_date,
                  })),
                  lead_id: leadId ?? null,
                });
                if (!result.ok) {
                  setError(result.error);
                  return;
                }
                toast.success("Student enrolled");
                setOpen(false);
                router.push(`/admin/enrollments/${result.data.id}`);
              });
            }}
          >
            Enrol student
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

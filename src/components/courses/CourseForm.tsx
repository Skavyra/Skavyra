"use client";

import { useState, useTransition } from "react";

import { updateCourse } from "@/actions/courses";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import type { Course } from "@/types";

function toLocalInput(iso: string | null) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function CourseForm({ course }: { course: Course }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [partial, setPartial] = useState(course.allows_partial);
  const [isFlagship, setIsFlagship] = useState(course.is_flagship);
  const [showCountdown, setShowCountdown] = useState(course.show_countdown);

  return (
    <form
      className="flex flex-col gap-5"
      action={(formData) => {
        setError(null);
        formData.set("allows_partial", partial ? "on" : "");
        formData.set("is_flagship", isFlagship ? "on" : "");
        formData.set("show_countdown", showCountdown ? "on" : "");
        const offerEndsAt = formData.get("offer_ends_at");
        if (typeof offerEndsAt === "string" && offerEndsAt !== "") {
          formData.set("offer_ends_at", new Date(offerEndsAt).toISOString());
        }
        start(async () => {
          const result = await updateCourse(course.id, formData);
          if (!result.ok) {
            setError(result.error);
            return;
          }
          toast.success("Course saved");
        });
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Title" htmlFor="title" className="sm:col-span-2">
          <Input id="title" name="title" defaultValue={course.title} required />
        </Field>
        <Field label="URL slug" htmlFor="slug" hint={`/courses/${course.slug}`}>
          <Input id="slug" name="slug" defaultValue={course.slug} required />
        </Field>
        <Field label="Sort order" htmlFor="sort_order" hint="Lower numbers come first.">
          <Input id="sort_order" name="sort_order" inputMode="numeric" defaultValue={course.sort_order} />
        </Field>
        <Field label="Short line" htmlFor="subtitle" className="sm:col-span-2" hint="One sentence shown on the course card.">
          <Input id="subtitle" name="subtitle" defaultValue={course.subtitle ?? ""} />
        </Field>
        <Field label="Course overview" htmlFor="description" className="sm:col-span-2" hint="Introduce the course and what students will achieve. Existing descriptions are preserved here.">
          <Textarea id="description" name="description" rows={5} defaultValue={course.description ?? ""} />
        </Field>
        <Field label="Stream" htmlFor="category">
          <NativeSelect id="category" name="category" defaultValue={course.category}>
            <option value="it">IT</option>
            <option value="non_it">Non-IT</option>
            <option value="both">Both</option>
          </NativeSelect>
        </Field>
        <Field label="Level" htmlFor="level">
          <NativeSelect id="level" name="level" defaultValue={course.level}>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </NativeSelect>
        </Field>
        <Field label="Fee" htmlFor="price">
          <Input id="price" name="price" inputMode="decimal" defaultValue={course.price} required />
        </Field>
        <Field label="MRP" htmlFor="mrp" hint="Shown struck through. Leave empty for none.">
          <Input id="mrp" name="mrp" inputMode="decimal" defaultValue={course.mrp ?? ""} />
        </Field>
        <Field label="Duration in weeks" htmlFor="duration_weeks">
          <Input id="duration_weeks" name="duration_weeks" inputMode="numeric" defaultValue={course.duration_weeks ?? ""} />
        </Field>
        <Field label="Language" htmlFor="language">
          <Input id="language" name="language" defaultValue={course.language ?? "English"} />
        </Field>
        <Field label="Mentor name" htmlFor="mentor_name">
          <Input id="mentor_name" name="mentor_name" defaultValue={course.mentor_name ?? ""} />
        </Field>
        <Field label="Mentor company" htmlFor="mentor_company">
          <Input id="mentor_company" name="mentor_company" defaultValue={course.mentor_company ?? ""} />
        </Field>
      </div>

      <section aria-labelledby="course-page-content" className="rounded-xl border bg-card p-5 sm:p-6">
        <h2 id="course-page-content" className="text-lg">Course page content</h2>
        <p className="mt-1 text-sm text-muted-foreground">All fields are optional. Empty sections stay hidden on the public course page.</p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Field label="What students will learn" htmlFor="learning_outcomes" hint="One learning outcome per line.">
            <Textarea id="learning_outcomes" name="learning_outcomes" rows={5} defaultValue={course.learning_outcomes ?? ""} />
          </Field>
          <Field label="Who this course is for" htmlFor="target_audience" hint="One audience group per line.">
            <Textarea id="target_audience" name="target_audience" rows={5} defaultValue={course.target_audience ?? ""} />
          </Field>
          <Field label="Prerequisites" htmlFor="prerequisites" hint="One requirement per line. If none are needed, say so explicitly.">
            <Textarea id="prerequisites" name="prerequisites" rows={4} defaultValue={course.prerequisites ?? ""} />
          </Field>
          <Field label="Projects students will build" htmlFor="projects" hint="One project per line, with a short description.">
            <Textarea id="projects" name="projects" rows={4} defaultValue={course.projects ?? ""} />
          </Field>
          <Field label="Mentor biography" htmlFor="mentor_bio" className="sm:col-span-2" hint="Describe the mentor’s relevant experience. Add their name above and photo in Images.">
            <Textarea id="mentor_bio" name="mentor_bio" rows={4} defaultValue={course.mentor_bio ?? ""} />
          </Field>
        </div>
      </section>

      <section aria-labelledby="flagship-offer" className="rounded-xl border bg-card p-5 sm:p-6">
        <h2 id="flagship-offer" className="text-lg">Flagship &amp; offer</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Optional. Leave the offer empty for no offer. The site goes back to the normal fee automatically after the end date.
        </p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <label className="flex items-center justify-between gap-4 sm:col-span-2">
            <span>
              <span className="block text-sm font-semibold">Flagship program</span>
              <span className="block text-xs text-muted-foreground">Shows this course on the Flagship page with a premium badge.</span>
            </span>
            <Switch checked={isFlagship} onCheckedChange={setIsFlagship} />
          </label>
          <Field label="Offer price" htmlFor="offer_price" hint="Must be lower than the fee. Leave empty for no offer.">
            <Input id="offer_price" name="offer_price" inputMode="decimal" defaultValue={course.offer_price ?? ""} />
          </Field>
          <Field label="Offer label" htmlFor="offer_label" hint="e.g. Diwali offer">
            <Input id="offer_label" name="offer_label" defaultValue={course.offer_label ?? ""} />
          </Field>
          <Field label="Offer ends" htmlFor="offer_ends_at" hint="Optional. Your local time.">
            <Input id="offer_ends_at" name="offer_ends_at" type="datetime-local" defaultValue={toLocalInput(course.offer_ends_at)} />
          </Field>
          <label className="flex items-center justify-between gap-4">
            <span>
              <span className="block text-sm font-semibold">Show countdown timer</span>
              <span className="block text-xs text-muted-foreground">Only works when an end date is set.</span>
            </span>
            <Switch checked={showCountdown} onCheckedChange={setShowCountdown} />
          </label>
          <Field label="Tools covered" htmlFor="tools" hint="One tool per line, e.g. Python, LangChain." className="sm:col-span-2">
            <Textarea id="tools" name="tools" rows={4} defaultValue={(course.tools ?? []).join("\n")} />
          </Field>
        </div>
      </section>

      <div className="flex flex-col gap-4 rounded-xl border p-4">
        <label className="flex items-center justify-between gap-4">
          <span>
            <span className="block text-sm font-semibold">Allow installments</span>
            <span className="block text-xs text-muted-foreground">Counsellors can set up a payment plan for this course.</span>
          </span>
          <Switch checked={partial} onCheckedChange={setPartial} />
        </label>
        {partial && (
          <Field label="Smallest first payment" htmlFor="min_first_payment" hint="Leave empty for no minimum.">
            <Input id="min_first_payment" name="min_first_payment" inputMode="decimal" defaultValue={course.min_first_payment ?? ""} className="max-w-xs" />
          </Field>
        )}
      </div>

      {error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}
      <Button type="submit" loading={pending} className="self-start">
        Save course
      </Button>
    </form>
  );
}

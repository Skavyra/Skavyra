"use client";

import { useState, useTransition } from "react";

import { submitContact } from "@/actions/contact";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function ContactForm({
  compact = false,
  defaultCourse,
  topic,
}: {
  compact?: boolean;
  defaultCourse?: string;
  topic?: string;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <div role="status" className="rounded-2xl border border-gold-300 bg-gold-100/20 p-6">
        <p className="font-display text-lg font-bold">Thanks, we have your number.</p>
        <p className="mt-2 text-sm text-muted-foreground">A counsellor will call you back, usually within one working day.</p>
      </div>
    );
  }

  return (
    <form
      className="flex flex-col gap-4"
      action={(formData) => {
        setError(null);
        start(async () => {
          const result = await submitContact(formData);
          if (result.ok) setDone(true);
          else setError(result.error);
        });
      }}
    >
      {topic && <input type="hidden" name="topic" value={topic} />}
      <div className={compact ? "flex flex-col gap-4" : "grid gap-4 sm:grid-cols-2"}>
        <Field label="Your name" htmlFor="c-name">
          <Input id="c-name" name="full_name" autoComplete="name" required />
        </Field>
        <Field label="Mobile number" htmlFor="c-phone">
          <Input id="c-phone" name="phone" type="tel" inputMode="numeric" autoComplete="tel" required />
        </Field>
      </div>
      {!compact && (
        <>
          <Field label="Email (optional)" htmlFor="c-email">
            <Input id="c-email" name="email" type="email" autoComplete="email" />
          </Field>
          <Field label="Course you are interested in (optional)" htmlFor="c-course">
            <Input id="c-course" name="interested_course_text" defaultValue={defaultCourse} />
          </Field>
          <Field label="Anything we should know (optional)" htmlFor="c-msg">
            <Textarea id="c-msg" name="remarks" rows={4} />
          </Field>
        </>
      )}
      {error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}
      <Button type="submit" size="lg" loading={pending}>
        {compact ? "Request a call back" : "Send"}
      </Button>
    </form>
  );
}

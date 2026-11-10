"use client";

import { ArrowRight } from "lucide-react";
import { useState, useTransition } from "react";

import { submitContact } from "@/actions/contact";

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
      <div role="status" className="preview-note is-on">
        <p>Thanks, we have your number. A counsellor will call you back, usually within one working day.</p>
      </div>
    );
  }

  return (
    <form
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
      <label className={compact ? undefined : "field"} htmlFor="c-name">
        Your name
        <input id="c-name" name="full_name" autoComplete="name" required placeholder="Your name" />
      </label>
      <label className={compact ? undefined : "field"} htmlFor="c-phone">
        Mobile number
        <input id="c-phone" name="phone" type="tel" inputMode="numeric" autoComplete="tel" required placeholder="Mobile number" />
      </label>
      {!compact && (
        <>
          <label className="field" htmlFor="c-email">
            Email <small>(optional)</small>
            <input id="c-email" name="email" type="email" autoComplete="email" placeholder="Email" />
          </label>
          <label className="field" htmlFor="c-course">
            Course you are interested in <small>(optional)</small>
            <input id="c-course" name="interested_course_text" defaultValue={defaultCourse} placeholder="Course you are interested in" />
          </label>
          <label className="field" htmlFor="c-msg">
            Anything we should know <small>(optional)</small>
            <textarea id="c-msg" name="remarks" rows={4} placeholder="Anything we should know" />
          </label>
        </>
      )}
      {error && <p role="alert" className="preview-note is-on">{error}</p>}
      <button type="submit" className="btn btn--ink btn--block btn--lg" disabled={pending}>
        {pending ? "Sending…" : compact ? "Request a call back" : "Send"}
        <ArrowRight className="ic" strokeWidth={1.75} />
      </button>
    </form>
  );
}

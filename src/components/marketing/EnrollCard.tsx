"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useTransition } from "react";

import { requestEnrollment } from "@/actions/contact";
import { Button } from "@/components/ui/button";
import { formatInr } from "@/lib/utils";

import { Quarter } from "./Quarter";

type State = "guest" | "student" | "enrolled" | "staff";

/** Sticky fee card on the course page. */
export function EnrollCard({
  course,
  state,
  enrolledHref,
}: {
  course: { title: string; slug: string; price: number; mrp: number | null; cover_image_url: string | null; allows_partial: boolean; duration_weeks: number | null; language: string | null };
  state: State;
  enrolledHref?: string;
}) {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const requestStarted = useRef(false);

  return (
    <div data-course-enrollment className="flex flex-col gap-4 rounded-2xl border border-gold-500/30 bg-card p-5 shadow-[0_24px_55px_-38px_rgba(13,13,13,0.42)] ring-1 ring-ink/[0.03] transition-shadow duration-300 hover:shadow-[0_30px_65px_-38px_rgba(142,103,24,0.34)]">
      <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-ink">
        {course.cover_image_url ? (
          <Image src={course.cover_image_url} alt="" fill sizes="360px" className="object-cover" />
        ) : (
          <div className="grid size-full place-items-center">
            <Quarter className="size-16" />
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-3">
        <span className="font-display text-3xl font-bold">{formatInr(course.price)}</span>
        {course.mrp && course.mrp > course.price && (
          <span className="text-sm text-muted-foreground line-through">{formatInr(course.mrp)}</span>
        )}
      </div>

      {state === "enrolled" && enrolledHref ? (
        <Button asChild variant="gold" size="lg">
          <Link href={enrolledHref}>Go to course</Link>
        </Button>
      ) : state === "guest" ? (
        <Button asChild variant="gold" size="lg">
          <Link href={`/signup?next=${encodeURIComponent(`/courses/${course.slug}`)}`}>Enroll now</Link>
        </Button>
      ) : state === "student" ? (
        <Button
          variant="gold"
          size="lg"
          loading={pending}
          disabled={pending}
          onClick={() =>
            {
              if (requestStarted.current) return;
              requestStarted.current = true;
              setMessage(null);
              start(async () => {
                try {
                  const r = await requestEnrollment(course.title);
                  setMessage(r.ok
                    ? { ok: true, text: "Your request was sent. A counsellor will contact you to confirm the plan and enrollment." }
                    : { ok: false, text: r.error });
                } catch {
                  setMessage({ ok: false, text: "We couldn’t send your request. Please try again." });
                } finally {
                  requestStarted.current = false;
                }
              });
            }
          }
        >
          {pending ? "Sending request…" : "Request enrollment"}
        </Button>
      ) : null}

      <Button asChild variant="outline" size="lg">
        <Link href={`/contact?course=${encodeURIComponent(course.title)}`}>Talk to a counsellor</Link>
      </Button>

      {message && (
        <p role={message.ok ? "status" : "alert"} aria-live={message.ok ? "polite" : "assertive"} className={message.ok ? "text-sm text-success" : "text-sm text-destructive"}>
          {message.text}
          {!message.ok && message.text.includes("Log in first") && (
            <> {" "}<Link className="font-semibold underline" href={`/login?next=${encodeURIComponent(`/courses/${course.slug}`)}`}>Sign in again</Link></>
          )}
          {!message.ok && message.text.includes("Add your mobile number") && (
            <> {" "}<Link className="font-semibold underline" href="/dashboard/profile">Update your profile</Link></>
          )}
        </p>
      )}

      <ul className="flex flex-col gap-2 border-t border-ink/10 pt-4 text-sm text-muted-foreground">
        {course.duration_weeks && <li>{course.duration_weeks} weeks</li>}
        {course.language && <li>Taught in {course.language}</li>}
        {course.allows_partial && <li>Installment plans available</li>}
        <li>Certificate on completion</li>
      </ul>
      {state === "guest" && (
        <p className="text-xs text-muted-foreground">
          Sign in or create a free account to continue. A counsellor will then contact you to confirm your plan and enrollment. {" "}
          <Link className="font-semibold text-foreground underline-offset-4 hover:underline" href={`/login?next=${encodeURIComponent(`/courses/${course.slug}`)}`}>
            Already have an account?
          </Link>
        </p>
      )}
    </div>
  );
}

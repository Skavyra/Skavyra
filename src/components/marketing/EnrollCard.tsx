"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";

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

  return (
    <div className="flex flex-col gap-4 rounded-2xl border bg-card p-5 lg:sticky lg:top-28">
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
        <Button asChild size="lg">
          <Link href={enrolledHref}>Go to course</Link>
        </Button>
      ) : state === "guest" ? (
        <Button asChild size="lg">
          <Link href={`/signup?next=${encodeURIComponent(`/courses/${course.slug}`)}`}>Enroll now</Link>
        </Button>
      ) : state === "student" ? (
        <Button
          size="lg"
          loading={pending}
          onClick={() =>
            start(async () => {
              const r = await requestEnrollment(course.title);
              setMessage(r.ok ? { ok: true, text: "Request sent. A counsellor will call you to confirm your plan and unlock the course." } : { ok: false, text: r.error });
            })
          }
        >
          Enroll now
        </Button>
      ) : null}

      <Button asChild variant="outline" size="lg">
        <Link href={`/contact?course=${encodeURIComponent(course.title)}`}>Talk to a counsellor</Link>
      </Button>

      {message && (
        <p role="status" className={message.ok ? "text-sm text-success" : "text-sm text-destructive"}>
          {message.text}
        </p>
      )}

      <ul className="flex flex-col gap-2 border-t pt-4 text-sm text-muted-foreground">
        {course.duration_weeks && <li>{course.duration_weeks} weeks</li>}
        {course.language && <li>Taught in {course.language}</li>}
        {course.allows_partial && <li>Installment plans available</li>}
        <li>Certificate on completion</li>
      </ul>
      {state === "guest" && <p className="text-xs text-muted-foreground">Create a free account first. It takes a minute.</p>}
    </div>
  );
}

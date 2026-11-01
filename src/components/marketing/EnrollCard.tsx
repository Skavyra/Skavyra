"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Phone } from "lucide-react";
import { useRef, useState, useTransition } from "react";

import { requestEnrollment } from "@/actions/contact";
import { formatInr, getOfferPricing } from "@/lib/utils";
import { whatsappLink } from "@/lib/whatsapp";

import { OfferCountdown } from "./OfferCountdown";
import { WhatsAppIcon } from "./WhatsAppIcon";

type State = "guest" | "student" | "enrolled" | "staff";

/** Sticky fee card on the course page. */
export function EnrollCard({
  course,
  state,
  enrolledHref,
}: {
  course: {
    title: string;
    slug: string;
    price: number;
    mrp: number | null;
    cover_image_url: string | null;
    allows_partial: boolean;
    duration_weeks: number | null;
    language: string | null;
    is_flagship?: boolean;
    offer_price?: number | null;
    offer_label?: string | null;
    offer_ends_at?: string | null;
    show_countdown?: boolean;
  };
  state: State;
  enrolledHref?: string;
}) {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const requestStarted = useRef(false);
  const pricing = getOfferPricing(course);
  const whatsappHref = whatsappLink(`Hi Skavyra, I'd like details about the ${course.title} course.`);

  const handleRequest = () => {
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
        setMessage({ ok: false, text: "We couldnâ€™t send your request. Please try again." });
      } finally {
        requestStarted.current = false;
      }
    });
  };

  return (
    <div className="enroll" data-course-enrollment>
      <div className="enroll__img">
        {course.cover_image_url ? (
          <Image src={course.cover_image_url} alt={`${course.title} course cover`} fill sizes="384px" style={{ objectFit: "cover" }} />
        ) : (
          <div className="absolute inset-0 bg-[#0D0D0D]" aria-hidden="true" />
        )}
      </div>
      <div className="enroll__b">
        {course.is_flagship ? (
          <>
            {pricing.active && (
              <div className="enroll__offer">
                {course.offer_label && <span className="offerpill">{course.offer_label}</span>}
                {course.show_countdown && course.offer_ends_at && <span className="cdown">Offer ends in <b><OfferCountdown endsAt={course.offer_ends_at} /></b></span>}
              </div>
            )}
            <div className="enroll__price">
              <b>{formatInr(pricing.current)}</b>
              {pricing.active && pricing.original !== null && <s>{formatInr(pricing.original)}</s>}
              {pricing.active && pricing.savings > 0 && <em>Save {pricing.savings}%</em>}
            </div>
          </>
        ) : (
          <div className="enroll__price">
            <b>{formatInr(course.price)}</b>
            {course.mrp && course.mrp > course.price && <s>{formatInr(course.mrp)}</s>}
          </div>
        )}

        {state === "enrolled" && enrolledHref ? (
          <Link className="btn btn--ink btn--block btn--lg" href={enrolledHref}>Go to course<ArrowRight className="ic" strokeWidth={1.75} /></Link>
        ) : state === "guest" ? (
          <Link className="btn btn--ink btn--block btn--lg" href={`/signup?next=${encodeURIComponent(`/courses/${course.slug}`)}`}>Enroll now<ArrowRight className="ic" strokeWidth={1.75} /></Link>
        ) : state === "student" ? (
          <button type="button" className="btn btn--ink btn--block btn--lg" disabled={pending} onClick={handleRequest}>
            {pending ? "Sending requestâ€¦" : "Request enrollment"}
          </button>
        ) : null}

        {(state === "guest" || state === "student") && whatsappHref && (
          <a className="btn btn--wa2 btn--block" href={whatsappHref} target="_blank" rel="noopener noreferrer" aria-label={`Ask about ${course.title} on WhatsApp`}>
            <WhatsAppIcon className="ic" />Ask on WhatsApp
          </a>
        )}

        <Link className="btn btn--line btn--block" href={`/contact?course=${encodeURIComponent(course.title)}`}><Phone className="ic" strokeWidth={1.75} />Talk to a counsellor</Link>

        {message && (
          <p role={message.ok ? "status" : "alert"} aria-live={message.ok ? "polite" : "assertive"} className="preview-note is-on">
            {message.text}
            {!message.ok && message.text.includes("Log in first") && (
              <> {" "}<Link className="font-semibold underline" href={`/login?next=${encodeURIComponent(`/courses/${course.slug}`)}`}>Sign in again</Link></>
            )}
            {!message.ok && message.text.includes("Add your mobile number") && (
              <> {" "}<Link className="font-semibold underline" href="/dashboard/profile">Update your profile</Link></>
            )}
          </p>
        )}

        <ul className="enroll__list">
          {course.duration_weeks && <li><Check className="ic" strokeWidth={1.75} />{course.duration_weeks} weeks</li>}
          {course.language && <li><Check className="ic" strokeWidth={1.75} />Taught in {course.language}</li>}
          {course.allows_partial && <li><Check className="ic" strokeWidth={1.75} />Installment plans available</li>}
          <li><Check className="ic" strokeWidth={1.75} />Certificate on completion</li>
        </ul>
        {state === "guest" && (
          <p className="enroll__note">
            Sign in or create a free account to continue. A counsellor will then contact you to confirm your plan and enrollment.{" "}
            <Link href={`/login?next=${encodeURIComponent(`/courses/${course.slug}`)}`}>Already have an account?</Link>
          </p>
        )}
      </div>
    </div>
  );
}

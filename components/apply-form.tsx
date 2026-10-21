"use client";

import { useState } from "react";
import s from "@/components/desk/desk.module.css";

type FieldName = "name" | "email" | "clubName" | "what" | "cadence" | "who" | "people" | "needs" | "budget";

type FormState = Record<FieldName, string>;

const empty: FormState = {
  name: "",
  email: "",
  clubName: "",
  what: "",
  cadence: "",
  who: "",
  people: "",
  needs: "",
  budget: "",
};

const fields: {
  name: FieldName;
  label: string;
  type: "text" | "email" | "textarea";
  autoComplete?: string;
  placeholder?: string;
  /** Which column of the charter it sits in. */
  span?: "half" | "full";
}[] = [
  { name: "name", label: "Your name", type: "text", autoComplete: "name", span: "half" },
  { name: "email", label: "Email", type: "email", autoComplete: "email", span: "half" },
  { name: "clubName", label: "Proposed Club Name", type: "text", placeholder: "e.g. Sonoma Track Days, High-Speed Karting, Hardware Fab", span: "half" },
  { name: "cadence", label: "Proposed Cadence", type: "text", placeholder: "e.g. Monthly track day, Bi-weekly workshop", span: "half" },
  { name: "what", label: "What happens during a session?", type: "textarea", placeholder: "Describe the session format, driver/member experience, safety requirements, and schedule.", span: "full" },
  { name: "who", label: "Who is hosting / co-hosting?", type: "text", placeholder: "Your background and any co-leads", span: "half" },
  { name: "budget", label: "Estimated Monthly Budget", type: "text", placeholder: "e.g. $1,200/session for track fees & paddock hospitality", span: "half" },
  {
    name: "people",
    label: "Initial member roster (10 people ready to attend)",
    type: "textarea",
    placeholder: "Names and handles. The strongest charters have active founders ready from day one.",
    span: "full",
  },
  { name: "needs", label: "What support do you need from Founders, Inc.?", type: "textarea", placeholder: "Track rental booking, Fort Mason workshop access, safety gear subsidies, media team coverage.", span: "full" },
];

function validate(values: FormState): Partial<Record<FieldName, string>> {
  const errors: Partial<Record<FieldName, string>> = {};
  if (!values.name.trim()) errors.name = "Please provide your name.";
  if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) errors.email = "Please provide a valid email.";
  if (!values.clubName.trim()) errors.clubName = "Please name the club.";
  if (values.what.trim().length < 20) errors.what = "Describe what happens during a session (min 20 characters).";
  if (!values.cadence.trim()) errors.cadence = "Specify a recurring cadence.";
  if (!values.who.trim()) errors.who = "Let us know who will run it.";
  if (values.people.trim().length < 10) errors.people = "List real members ready for the first session.";
  if (!values.needs.trim()) errors.needs = "Specify what resources you need.";
  if (!values.budget.trim()) errors.budget = "Provide a rough budget estimate.";
  return errors;
}

/**
 * The charter itself: a printed form on real paper, sitting on the desk.
 * Same submission path, same validation and the same required fields as the
 * version it replaces — only the surface changed.
 */
export function ApplyForm({
  /** The name on the sticker the applicant just made — seeded, never forced. */
  stickerName,
  /** Scroll-offset id for the sticky header, when the form sits mid-page. */
  heading = "Pin your club to the wall.",
  kicker = "Official submission",
  intro = "Reviewed weekly by the campus team. Approved clubs get venue bookings, production support and a budget.",
  submitLabel = "Pin my club to the wall →",
}: {
  stickerName?: string;
  heading?: string;
  kicker?: string;
  intro?: string;
  submitLabel?: string;
}) {
  const [values, setValues] = useState<FormState>(() => ({
    ...empty,
    clubName: stickerName?.trim() ?? "",
  }));
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [sent, setSent] = useState(false);
  // Keep the plate and the proposal in step while the applicant is still typing
  // the sticker name — until they edit the club name field themselves. Derived
  // during render rather than synced from an effect, and the "edited" flag lives
  // in state, so nothing here reads a ref during render.
  const [clubNameEdited, setClubNameEdited] = useState(false);
  const sticker = stickerName?.trim() ?? "";
  const clubName = clubNameEdited || !sticker ? values.clubName : sticker;

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submission: FormState = { ...values, clubName };
    const nextErrors = validate(submission);
    setErrors(nextErrors);
    const first = fields.find((field) => nextErrors[field.name]);
    if (first) {
      document.getElementById(first.name)?.focus();
      return;
    }
    console.log("club application submitted", submission);
    setSent(true);
  }

  if (sent) {
    return (
      <div className={`${s.charterSheet} relative px-7 py-9 text-center sm:px-10 sm:py-12`}>
        <div aria-hidden className={s.holes}>
          <span className={s.hole} />
          <span className={s.hole} />
          <span className={s.hole} />
        </div>
        <div role="status" className="relative">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-2">Form CH-01 · received</p>
          <h3 className="mt-3 font-serif text-[2.4rem] leading-[0.9] sm:text-[3rem]">Your club is on the board.</h3>
          <p className="mx-auto mt-4 max-w-[46ch] text-sm leading-relaxed text-ink-2">
            The campus team reviews charters weekly. We will reach out to schedule an in-person
            walkthrough at Fort Mason Pier 2.
          </p>
          <span
            className={`${s.stampIn} mt-8 inline-block rotate-[-11deg] border-[3px] border-[#b1412c]/70 px-5 py-2 font-mono text-[13px] uppercase tracking-[0.2em] text-[#b1412c]/85`}
          >
            pending review
          </span>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      aria-labelledby="charter-heading"
      className={`${s.charterSheet} relative px-6 pb-9 pt-8 sm:px-10 sm:pb-11 sm:pt-10`}
    >
      <div aria-hidden className={s.holes}>
        <span className={s.hole} />
        <span className={s.hole} />
        <span className={s.hole} />
      </div>

      <header className="border-b border-ink/15 pb-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink-2">
            Founders, Inc. · Pier 2 · form CH-01
          </span>
          <span className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink-2">* required</span>
        </div>
        <span className="mt-4 block font-mono text-[10px] uppercase tracking-[0.16em] text-ink-2">{kicker}</span>
        <h2 id="charter-heading" className="mt-2 font-serif text-[2.35rem] leading-[0.88] sm:text-[3.1rem]">
          {heading}
        </h2>
        <p className="mt-3 max-w-[56ch] text-[13.5px] leading-relaxed text-ink-2">{intro}</p>
      </header>

      <div className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2">
        {fields.map((field) => {
          const error = errors[field.name];
          const shared = {
            id: field.name,
            name: field.name,
            value: field.name === "clubName" ? clubName : values[field.name],
            placeholder: field.placeholder,
            autoComplete: field.autoComplete,
            "aria-invalid": Boolean(error) || undefined,
            "aria-describedby": error ? `${field.name}-error` : undefined,
            onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
              const value = event.target.value;
              if (field.name === "clubName") setClubNameEdited(true);
              setValues((current) => ({ ...current, [field.name]: value }));
            },
            className:
              "mt-1.5 block w-full border-0 border-b border-dashed border-ink/35 bg-transparent px-0.5 pb-1.5 pt-1 font-sans text-[14.5px] leading-snug text-ink outline-none placeholder:text-ink/45 focus:border-solid focus:border-ink focus:ring-0",
          };
          return (
            <label
              key={field.name}
              htmlFor={field.name}
              className={`block ${field.span === "full" ? "sm:col-span-2" : ""}`}
            >
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.11em] text-ink-2">
                {field.label}
                <span aria-hidden className="ml-1 text-[#b1412c]/70">
                  *
                </span>
              </span>
              {field.type === "textarea" ? (
                <textarea {...shared} rows={field.name === "people" ? 4 : 3} className={`${shared.className} resize-y`} />
              ) : (
                <input {...shared} type={field.type} />
              )}
              {error ? (
                <span id={`${field.name}-error`} className="mt-1 block font-mono text-[10.5px] leading-snug text-[#a03220]">
                  {error}
                </span>
              ) : null}
            </label>
          );
        })}
      </div>

      <div className="mt-8 flex flex-col gap-3 border-t border-ink/15 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-[34ch] font-mono text-[9.5px] uppercase leading-relaxed tracking-[0.13em] text-ink-2">
          Reviewed weekly · about two weeks to a decision
        </p>
        <button type="submit" className="pill-btn w-full py-3 text-center text-[13px] sm:w-auto sm:px-7">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

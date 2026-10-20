"use client";

import { useEffect, useRef, useState } from "react";

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
}[] = [
  { name: "name", label: "Your name", type: "text", autoComplete: "name" },
  { name: "email", label: "Email", type: "email", autoComplete: "email" },
  { name: "clubName", label: "Proposed Club Name", type: "text", placeholder: "e.g. Sonoma Track Days, High-Speed Karting, Hardware Fab" },
  { name: "what", label: "What happens during a session?", type: "textarea", placeholder: "Describe the session format, driver/member experience, safety requirements, and schedule." },
  { name: "cadence", label: "Proposed Cadence", type: "text", placeholder: "e.g. Monthly track day, Bi-weekly workshop" },
  { name: "who", label: "Who is hosting / co-hosting?", type: "text", placeholder: "Your background and any co-leads" },
  {
    name: "people",
    label: "Initial member roster (10 people ready to attend)",
    type: "textarea",
    placeholder: "Names and handles. The strongest charters have active founders ready from day one.",
  },
  { name: "needs", label: "What support do you need from Founders, Inc.?", type: "textarea", placeholder: "Track rental booking, Fort Mason workshop access, safety gear subsidies, media team coverage." },
  { name: "budget", label: "Estimated Monthly Budget", type: "text", placeholder: "e.g. $1,200/session for track fees & paddock hospitality" },
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
  const touched = useRef<Partial<Record<FieldName, boolean>>>({});

  // Keep the plate and the proposal in step while the applicant is still typing
  // the sticker name — until they edit the club name field themselves.
  useEffect(() => {
    const next = stickerName?.trim() ?? "";
    if (!next || touched.current.clubName) return;
    setValues((current) => (current.clubName === next ? current : { ...current, clubName: next }));
  }, [stickerName]);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    const first = fields.find((field) => nextErrors[field.name]);
    if (first) {
      document.getElementById(first.name)?.focus();
      return;
    }
    console.log("club application submitted", values);
    setSent(true);
  }

  if (sent) {
    return (
      <div role="status" className="paper-card studio-thump p-8 text-center md:p-12">
        <span className="inline-flex items-center gap-2 rounded-full bg-[rgba(232,69,43,0.1)] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink">
          <span className="h-1.5 w-1.5 rounded-full bg-ink" />
          pinned to the wall
        </span>
        <h3 className="mt-4 font-serif text-4xl text-ink">Your club is on the board.</h3>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-2">
          The campus team reviews charters weekly. We will reach out to schedule an in-person
          walkthrough at Fort Mason Pier 2.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="paper-card flex flex-col gap-6 p-8 sm:p-10">
      <div className="flex items-center justify-between gap-4 border-b border-ink/12 pb-3">
        <div>
          <span className="label">{kicker}</span>
          <h2 className="mt-2 font-serif text-[2.4rem] leading-[0.9] sm:text-[3.1rem]">{heading}</h2>
        </div>
        <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-3">
          * required
        </span>
      </div>

      <p className="max-w-[56ch] text-sm leading-relaxed text-ink-2">{intro}</p>

      {fields.map((field) => {
        const error = errors[field.name];
        const shared = {
          id: field.name,
          name: field.name,
          value: values[field.name],
          placeholder: field.placeholder,
          autoComplete: field.autoComplete,
          "aria-invalid": Boolean(error) || undefined,
          "aria-describedby": error ? `${field.name}-error` : undefined,
          onChange: (
            event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
          ) => {
            const value = event.target.value;
            touched.current[field.name] = true;
            setValues((current) => ({ ...current, [field.name]: value }));
          },
          className:
            "mt-2 w-full rounded-[2px] bg-paper/70 px-4 py-3 text-sm text-ink outline-none placeholder:text-ink-3 focus:ring-2 focus:ring-black border-0 transition-all font-sans",
        };
        return (
          <label key={field.name} className="block" htmlFor={field.name}>
            <span className="font-mono text-[11px] font-medium uppercase tracking-wider text-ink-2">
              {field.label}
            </span>
            {field.type === "textarea" ? (
              <textarea {...shared} rows={3} />
            ) : (
              <input {...shared} type={field.type} />
            )}
            {error ? (
              <span id={`${field.name}-error`} className="mt-1.5 block font-mono text-xs text-red-700">
                {error}
              </span>
            ) : null}
          </label>
        );
      })}

      <div className="pt-2">
        <button type="submit" className="pill-btn w-full text-center text-xs py-3">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

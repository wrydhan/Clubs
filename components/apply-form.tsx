"use client";

import { useState } from "react";

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

export function ApplyForm() {
  const [values, setValues] = useState<FormState>(empty);
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [sent, setSent] = useState(false);

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
      <div role="status" className="finc-card p-8 md:p-12 text-center">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-950 mb-3">
          <span className="h-2 w-2 rounded-full bg-emerald-600" />
          Charter Received
        </span>
        <h3 className="font-serif text-4xl text-black">Proposal Submitted</h3>
        <p className="mt-3 max-w-md mx-auto text-sm text-black/60 leading-relaxed font-sans">
          The campus team reviews club proposals weekly. We will reach out to schedule an in-person walkthrough at Fort Mason Pier 2.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="finc-card p-8 sm:p-10 flex flex-col gap-6">
      <div className="flex items-center justify-between pb-2">
        <span className="font-mono text-xs uppercase tracking-wider text-black/40">Campus Charter Application</span>
        <span className="font-mono text-xs text-black/40">* Required</span>
      </div>

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
            setValues((current) => ({ ...current, [field.name]: value }));
          },
          className:
            "mt-2 w-full rounded-[8px] bg-white px-4 py-3 text-sm text-black outline-none placeholder:text-black/30 focus:ring-2 focus:ring-black border-0 transition-all font-sans",
        };
        return (
          <label key={field.name} className="block" htmlFor={field.name}>
            <span className="font-mono text-[11px] uppercase tracking-wider text-black/60 font-medium">
              {field.label}
            </span>
            {field.type === "textarea" ? (
              <textarea {...shared} rows={3} />
            ) : (
              <input {...shared} type={field.type} />
            )}
            {error ? (
              <span id={`${field.name}-error`} className="mt-1.5 block font-mono text-xs text-red-600">
                {error}
              </span>
            ) : null}
          </label>
        );
      })}

      <div className="pt-4">
        <button
          type="submit"
          className="pill-btn w-full text-center text-xs py-3"
        >
          Submit Club Proposal to Founders, Inc. →
        </button>
      </div>
    </form>
  );
}

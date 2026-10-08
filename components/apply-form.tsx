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
  { name: "clubName", label: "Proposed Club Name", type: "text", placeholder: "e.g. Track Days, Climbing, Film Club, Tennis" },
  { name: "what", label: "What happens during a session?", type: "textarea", placeholder: "Describe what happens when members show up, the format, and the experience." },
  { name: "cadence", label: "Proposed Cadence", type: "text", placeholder: "e.g. Every Tuesday 7pm, Bi-weekly, Monthly" },
  { name: "who", label: "Who is hosting / co-hosting?", type: "text", placeholder: "Your background and any co-leads" },
  {
    name: "people",
    label: "10 people who will actually attend the first session",
    type: "textarea",
    placeholder: "Names and handles. The strongest applications have real people ready to show up on day one.",
  },
  { name: "needs", label: "What support do you need from Founders, Inc.?", type: "textarea", placeholder: "Court bookings, Fort Mason workshop access, equipment budgets, media team coverage." },
  { name: "budget", label: "Estimated Monthly Budget", type: "text", placeholder: "e.g. $500/month for court rentals & refreshments" },
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
      <div role="status" className="border border-line bg-card p-8 md:p-10 rounded-sm shadow-sm text-center">
        <span className="font-mono text-xs uppercase tracking-widest text-emerald-600 font-semibold flex items-center justify-center gap-1.5 mb-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Submission Received
        </span>
        <h3 className="font-serif text-4xl text-ink">Application Submitted</h3>
        <p className="mt-3 max-w-md mx-auto text-sm text-ink-secondary leading-relaxed">
          Our team reviews club applications weekly. If there is a strong fit, we will reach out within a week to schedule a 20-minute chat.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-line/60 pb-3 font-mono text-xs text-muted">
        <span>Founders, Inc. Club Proposal</span>
        <span className="text-accent">* All fields required</span>
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
            "mt-1.5 w-full border border-line bg-card px-4 py-3 text-base text-ink outline-none placeholder:text-muted/60 focus:border-accent focus:ring-1 focus:ring-accent rounded-sm transition-colors",
        };
        return (
          <label key={field.name} className="block" htmlFor={field.name}>
            <span className="font-mono text-[11px] uppercase tracking-wider text-muted font-medium">
              {field.label}
            </span>
            {field.type === "textarea" ? (
              <textarea {...shared} rows={3} />
            ) : (
              <input {...shared} type={field.type} />
            )}
            {error ? (
              <span id={`${field.name}-error`} className="mt-1 block font-mono text-xs text-red-500">
                {error}
              </span>
            ) : null}
          </label>
        );
      })}

      <div className="pt-2">
        <button
          type="submit"
          className="flex h-12 w-full items-center justify-center bg-ink px-8 text-xs font-mono font-medium uppercase tracking-wider text-paper hover:bg-accent transition-colors rounded-sm shadow-sm"
        >
          Submit Proposal to Founders, Inc. →
        </button>
      </div>
    </form>
  );
}

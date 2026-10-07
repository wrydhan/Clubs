"use client";

import { useState } from "react";
import { btnPrimary } from "@/lib/styles";

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
  { name: "clubName", label: "Club name", type: "text", placeholder: "Cars, climbing, film…" },
  { name: "what", label: "What it is", type: "textarea", placeholder: "What happens when people show up." },
  { name: "cadence", label: "Cadence", type: "text", placeholder: "Thursdays, 7pm" },
  { name: "who", label: "Who's running it", type: "text" },
  {
    name: "people",
    label: "Ten people who will come",
    type: "textarea",
    placeholder: "Names for the first one. It only works if they're real.",
  },
  { name: "needs", label: "What you need from us", type: "textarea", placeholder: "Space, budget, both." },
  { name: "budget", label: "Rough budget", type: "text", placeholder: "$400 a month" },
];

function validate(values: FormState): Partial<Record<FieldName, string>> {
  const errors: Partial<Record<FieldName, string>> = {};
  if (!values.name.trim()) errors.name = "Add your name.";
  if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) errors.email = "Use a real email so we can write back.";
  if (!values.clubName.trim()) errors.clubName = "Name the club.";
  if (values.what.trim().length < 20) errors.what = "A sentence or two on what actually happens.";
  if (!values.cadence.trim()) errors.cadence = "Give a cadence. “Thursdays at 7” is enough.";
  if (!values.who.trim()) errors.who = "Who’s running it with you?";
  if (values.people.trim().length < 10) errors.people = "List the people who will actually show up.";
  if (!values.needs.trim()) errors.needs = "Tell us what you need from us.";
  if (!values.budget.trim()) errors.budget = "A rough number is fine.";
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
    console.log("club application", values);
    setSent(true);
  }

  if (sent) {
    return (
      <div role="status" className="border border-line bg-card px-5 py-10">
        <p className="font-serif text-4xl leading-none">Got it.</p>
        <p className="mt-3 max-w-sm text-muted">We&apos;ll write back within a week.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <p className="text-sm text-muted">All of this is required.</p>
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
            "mt-1 w-full border-b border-line bg-transparent py-3 text-lg outline-none placeholder:text-muted/70 focus:border-ink",
        };
        return (
          <label key={field.name} className="block" htmlFor={field.name}>
            <span className="text-[11px] uppercase tracking-[0.16em] text-muted">{field.label}</span>
            {field.type === "textarea" ? (
              <textarea {...shared} rows={4} />
            ) : (
              <input {...shared} type={field.type} />
            )}
            {error ? (
              <span id={`${field.name}-error`} className="mt-1 block text-sm text-accent">
                {error}
              </span>
            ) : null}
          </label>
        );
      })}
      <button type="submit" className={`${btnPrimary} mt-2 w-full sm:w-auto`}>
        Submit application
      </button>
    </form>
  );
}

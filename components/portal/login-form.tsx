"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signIn, type LoginState } from "@/app/clubs/portal/login/actions";

const initialState: LoginState = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="pill-btn w-full" disabled={pending} aria-busy={pending}>
      {pending ? "Checking…" : "Unlock the portal"}
    </button>
  );
}

export function PortalLoginForm({
  next,
  configured,
}: {
  next: string;
  configured: boolean;
}) {
  const [state, formAction] = useActionState(signIn, initialState);

  return (
    <form action={formAction} className="mt-8">
      <input type="hidden" name="next" value={next} />
      <label htmlFor="password" className="label block">
        Portal password
      </label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        autoFocus
        disabled={!configured}
        placeholder="••••••••••"
        className="paper-field mt-2"
        aria-describedby={state.error ? "login-error" : undefined}
        aria-invalid={state.error ? true : undefined}
      />

      {state.error ? (
        <p
          id="login-error"
          role="alert"
          className="mt-3 border-l-2 border-ink/60 bg-ink/5 px-3 py-2 text-[13px] leading-relaxed text-ink"
        >
          {state.error}
        </p>
      ) : null}

      <div className="mt-6">
        <SubmitButton />
      </div>
    </form>
  );
}

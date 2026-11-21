"use client";

import type { Expense, PlannedEvent } from "@/lib/portal/types";

export type PortalSnapshot = {
  expenses: Expense[];
  events: PlannedEvent[];
};

export async function requestSnapshot(
  url: string,
  init?: RequestInit,
): Promise<PortalSnapshot> {
  const response = await fetch(url, {
    ...init,
    headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
    cache: "no-store",
  });
  const body = (await response.json()) as {
    ok?: boolean;
    error?: string;
    expenses?: Expense[];
    events?: PlannedEvent[];
  };
  if (!response.ok || !body.ok) {
    throw new Error(body.error ?? `Request failed (${response.status})`);
  }
  return { expenses: body.expenses ?? [], events: body.events ?? [] };
}

/** dollars string from cents, for an input field */
export function centsToInput(cents: number | null): string {
  if (cents == null) return "";
  return (cents / 100).toFixed(2).replace(/\.00$/, "");
}

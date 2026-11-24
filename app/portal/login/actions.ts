"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  createSessionToken,
  isPortalConfigured,
  passwordMatches,
  PORTAL_COOKIE,
  PORTAL_LOGIN_PATH,
  PORTAL_PATH,
  safeNextPath,
  SESSION_TTL_SECONDS,
} from "@/lib/portal/session";

export type LoginState = { error: string | null };

const NOT_CONFIGURED =
  "The portal password is not set on this deployment. Add CLUBS_PORTAL_PASSWORD and redeploy.";

export async function signIn(_previous: LoginState, formData: FormData): Promise<LoginState> {
  if (!isPortalConfigured()) return { error: NOT_CONFIGURED };

  const password = String(formData.get("password") ?? "");
  if (!password) return { error: "Enter the portal password." };

  if (!(await passwordMatches(password))) {
    // A short pause blunts scripted guessing without a session table to throttle.
    await new Promise((resolve) => setTimeout(resolve, 600));
    return { error: "That password is not right." };
  }

  const token = await createSessionToken();
  if (!token) return { error: NOT_CONFIGURED };

  const jar = await cookies();
  jar.set(PORTAL_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: PORTAL_PATH,
    maxAge: SESSION_TTL_SECONDS,
  });

  redirect(safeNextPath(formData.get("next")));
}

export async function signOut(): Promise<void> {
  const jar = await cookies();
  jar.delete({ name: PORTAL_COOKIE, path: PORTAL_PATH });
  redirect(PORTAL_LOGIN_PATH);
}

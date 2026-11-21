import type { Metadata } from "next";
import Link from "next/link";
import { PortalLoginForm } from "@/components/portal/login-form";
import { isPortalConfigured, PORTAL_PATH, safeNextPath } from "@/lib/portal/session";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { PORTAL_COOKIE, verifySessionToken } from "@/lib/portal/session";

export const metadata: Metadata = {
  title: "Clubs portal — sign in",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function PortalLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const destination = safeNextPath(next ?? PORTAL_PATH);

  // Already signed in? Skip the form.
  const jar = await cookies();
  if (await verifySessionToken(jar.get(PORTAL_COOKIE)?.value)) redirect(destination);

  const configured = isPortalConfigured();

  return (
    <main className="mx-auto flex w-full max-w-[520px] flex-1 flex-col justify-center px-5 py-16 sm:px-8 sm:py-24">
      <div className="paper-card px-6 py-10 sm:px-10 sm:py-12">
        <span className="label">Founders, Inc. · Clubs</span>
        <h1 className="font-serif mt-3 text-[2.6rem] leading-[0.95] text-ink">The back office</h1>
        <p className="mt-4 max-w-[40ch] text-[14px] leading-relaxed text-ink-2">
          Members, funnel numbers, spend and the event plan for every club. One shared
          password, and it covers every page behind this door.
        </p>

        <PortalLoginForm next={destination} configured={configured} />

        {!configured ? (
          <p className="mt-6 border-l-2 border-ink/25 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.1em] leading-relaxed text-ink-3">
            Not configured: set CLUBS_PORTAL_PASSWORD in the deployment environment.
          </p>
        ) : null}
      </div>

      <Link
        href="/clubs"
        className="mt-8 self-start font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3 hover:text-ink"
      >
        ← Back to the wall
      </Link>
    </main>
  );
}

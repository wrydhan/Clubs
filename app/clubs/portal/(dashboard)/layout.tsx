import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { signOut } from "@/app/clubs/portal/login/actions";
import { portalSections } from "@/lib/portal/nav";
import { PORTAL_COOKIE, PORTAL_LOGIN_PATH, verifySessionToken } from "@/lib/portal/session";

/**
 * The protected shell. The Proxy already bounces signed-out requests, but the
 * layout verifies the session again on the server: if the proxy matcher is ever
 * mis-edited, or a page is rendered some other way, this still refuses to draw
 * anybody's numbers.
 */
export default async function PortalDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jar = await cookies();
  const signedIn = await verifySessionToken(jar.get(PORTAL_COOKIE)?.value);
  if (!signedIn) redirect(PORTAL_LOGIN_PATH);

  return (
    <div className="mx-auto w-full max-w-[1360px] px-5 pb-20 pt-8 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-ink/15 pb-5">
        <div>
          <span className="label">Founders, Inc. · Clubs</span>
          <h1 className="font-serif mt-2 text-[2.4rem] leading-none text-ink sm:text-[3rem]">
            The back office
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 bg-ink/8 px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-ink/70" />
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-2">
              Private · password held
            </span>
          </span>
          <form action={signOut}>
            <button type="submit" className="pill-btn-ghost">
              Sign out
            </button>
          </form>
        </div>
      </div>

      <nav aria-label="Portal sections" className="mt-5 flex flex-wrap gap-2">
        {portalSections.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className="inline-flex min-h-[36px] items-center bg-ink/8 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-2 transition-colors hover:bg-ink/15 hover:text-ink"
          >
            {section.label}
          </a>
        ))}
      </nav>

      <div className="mt-8 flex flex-col gap-8">{children}</div>

      <p className="mt-12 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-3">
        Session expires after 12 hours ·{" "}
        <Link href="/clubs" className="underline decoration-ink/30 underline-offset-2 hover:text-ink">
          public site
        </Link>
      </p>
    </div>
  );
}

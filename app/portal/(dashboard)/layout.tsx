import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { signOut } from "@/app/portal/login/actions";
import { PortalTabs } from "@/components/portal/dark/tabs";
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
    <div className="mx-auto w-full max-w-[1180px] px-4 pb-16 pt-6 sm:px-7">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-baseline gap-3">
          <Link href="/portal/funnel" className="text-[15px] font-semibold tracking-tight text-ink">
            Clubs
          </Link>
          <span className="rounded-full bg-white/8 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-soft">
            private
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/clubs"
            className="rounded-full px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-soft hover:bg-white/6 hover:text-ink"
          >
            Public site
          </Link>
          <form action={signOut}>
            <button type="submit" className="pill-btn-ghost">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <PortalTabs />

      <main className="mt-8 flex flex-col gap-6">{children}</main>
    </div>
  );
}

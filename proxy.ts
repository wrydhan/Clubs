import { NextResponse, type NextRequest } from "next/server";
import {
  machineTokenMatches,
  PORTAL_PATH,
  PORTAL_COOKIE,
  PORTAL_LOGIN_PATH,
  verifySessionToken,
} from "@/lib/portal/session";

/**
 * The gate for the whole Clubs info portal and every page under it.
 *
 * Next 16 renamed the middleware file convention to `proxy`; this runs before
 * any /clubs/portal route renders, so a new subpage is protected the moment it
 * is added — nobody has to remember to guard it. The token check is the same
 * HMAC verification the dashboard layout performs, so there is exactly one
 * definition of signed-in and no route can drift from it.
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // The login page has to stay reachable while signed out (it hosts the form
  // and the server action that posts to it).
  if (pathname === PORTAL_LOGIN_PATH || pathname.startsWith(`${PORTAL_LOGIN_PATH}/`)) {
    return NextResponse.next();
  }

  // Scheduled sync jobs carry a bearer token instead of a cookie. Only the API
  // prefix honours it, so a machine token can never open a page.
  if (pathname.startsWith(`${PORTAL_PATH}/api/`)) {
    if (await machineTokenMatches(request.headers.get("authorization"))) {
      return NextResponse.next();
    }
  }

  const token = request.cookies.get(PORTAL_COOKIE)?.value;
  if (await verifySessionToken(token)) return NextResponse.next();

  const login = request.nextUrl.clone();
  login.pathname = PORTAL_LOGIN_PATH;
  login.search = "";
  login.searchParams.set("next", `${pathname}${search}`);

  const response = NextResponse.redirect(login);
  // A stale or forged cookie should not survive the bounce back to the form.
  if (token) response.cookies.delete({ name: PORTAL_COOKIE, path: "/clubs/portal" });
  return response;
}

export const config = {
  matcher: ["/clubs/portal", "/clubs/portal/:path*"],
};

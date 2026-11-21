# Clubs info portal — auth and shell

The private back office lives at **`/clubs/portal`**. It tracks who has come to
a club (attended, signed up, reacted, commented, follows), the funnel behind
those numbers, and spend + the forward event plan.

Everything under `/clubs/portal` is behind one shared password. Signed out,
every URL — including subpages that do not exist yet — redirects to the login
page instead of rendering.

```
/clubs/portal          dashboard (protected)
/clubs/portal/login    the only public page
/clubs/portal/<any>    protected automatically
```

## How the gate works

| Piece | File | Job |
| --- | --- | --- |
| The gate | `proxy.ts` | Runs before every `/clubs/portal/*` request. No valid session → redirect to login with `?next=`. |
| The session | `lib/portal/session.ts` | Mints and verifies the cookie token. One definition, used by both the gate and the layout. |
| Login / logout | `app/clubs/portal/login/actions.ts` | Server actions: check the password, set the cookie, sign out. |
| Second check | `app/clubs/portal/(dashboard)/layout.tsx` | Verifies the session again on the server before drawing any numbers. |
| Machine access | `proxy.ts` + `machineTokenMatches` | Scheduled sync jobs may hit `/clubs/portal/api/*` with `Authorization: Bearer $CLUBS_SYNC_SECRET` instead of a cookie. Nothing else accepts it. |

- **One password, no accounts.** `CLUBS_PORTAL_PASSWORD` is read at request
  time on the server and never shipped to the browser.
- **Signed cookie, 12 hours.** The cookie holds `v1.<expiry>.<signature>`, an
  HMAC-SHA256 keyed from the password itself. Nothing is stored server-side, and
  the cookie is worthless without the password. `HttpOnly`, `SameSite=Lax`,
  `Secure` in production, path-scoped to `/clubs/portal`.
- **New subpages are protected by default.** The proxy matcher covers
  `/clubs/portal/:path*`, so adding a route needs no extra guard.
- **No indexing, no caching.** Portal routes are `force-dynamic` and carry
  `noindex`; `app/robots.ts` disallows `/clubs/portal`.
- **No open redirect.** Post-login `?next=` only accepts paths inside the portal.

## Setting the password

1. Generate something long and unguessable (a passphrase, not a word):
   `openssl rand -base64 24`
2. Vercel → the Clubs project → **Settings → Environment Variables** → add
   `CLUBS_PORTAL_PASSWORD` for **Production** (and Preview, if you want preview
   deploys to work) → redeploy.

Changing the value signs everyone out everywhere, immediately — there is no
session table to purge.

### Machine access (for the live-data sync)

A scheduled job — Luma/X pull, cron — cannot hold a login. Give it its own
secret, separate from the password:

```
CLUBS_SYNC_SECRET=<openssl rand -base64 32>
```

Then `curl -H "Authorization: Bearer $CLUBS_SYNC_SECRET" https://clubs.f.inc/clubs/portal/api/sync`
passes the gate. The bearer token is honoured **only** on the
`/clubs/portal/api/` prefix — it can never open a page — and if the variable is
unset, no machine token is accepted at all. Leaking one secret never grants the
other.

Without the variable the portal fails closed: the login page renders a "not
configured" notice and no password is accepted.

## Vercel's own protection (optional, on top)

Vercel's **Deployment Protection → Password Protection** (Settings → Deployment
Protection) can gate the whole deployment or a preview domain with a Vercel
password, with no code. It does not replace this: it protects the domain, not
one section of it, and it does not know which section is private. Use both if
you want the portal on a separate domain: point a second domain at the same
project with Vercel password protection on, and the app-level password stays as
the per-section gate.

Note: Vercel password protection is a paid-plan feature, and visitors see
Vercel's own login page before yours.

## Where the other tracks plug in

The shell deliberately ships empty slots, one file each, so three tracks can
work in parallel without touching the same code:

| Section | File | Owner |
| --- | --- | --- |
| Reach → signups, People | `components/portal/funnel-section.tsx` | funnel / people track |
| Spend, What's next | `components/portal/expenses-section.tsx` | expenses / planning track |
| Shared frame + placeholder | `components/portal/section-frame.tsx` | shell (do not fork it) |
| Nav labels | `lib/portal/nav.ts` | shell |

Replace a placeholder's body, keep the exported name, the `SectionFrame` outer
shell and the section `id` — the page and the nav keep working untouched.

Data must be loaded on the server (a function in `lib/portal/…`) and passed
down, never fetched from the browser: the password protects pages, not a public
JSON endpoint. If a section needs its own JSON route, put it under
`/clubs/portal/api/…` so the proxy covers it.

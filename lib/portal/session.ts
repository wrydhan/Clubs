/**
 * Clubs portal — the session half of the shared-password gate.
 *
 * The whole portal sits behind one password (`CLUBS_PORTAL_PASSWORD`, read at
 * request time, never committed). A correct password mints a signed, expiring
 * token that the browser holds in an HttpOnly cookie. The token is an
 * HMAC-SHA256 over its own expiry, keyed from that same password, so there is
 * no session table to run and the cookie is worthless without the password.
 *
 * Web Crypto only: the same module runs in the Proxy (edge) and in Node
 * server components / server actions, so there is one definition of "signed in".
 */

export const PORTAL_COOKIE = "fi_clubs_portal";
export const PORTAL_PATH = "/clubs/portal";
export const PORTAL_LOGIN_PATH = `${PORTAL_PATH}/login`;
export const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 hours

const TOKEN_VERSION = "v1";
const encoder = new TextEncoder();

/** The shared portal password, or null when the deployment is not configured. */
export function portalPassword(): string | null {
  const value = process.env.CLUBS_PORTAL_PASSWORD?.trim();
  return value ? value : null;
}

export function isPortalConfigured(): boolean {
  return portalPassword() !== null;
}

async function signingKey(password: string, usage: KeyUsage[]): Promise<CryptoKey> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    encoder.encode(`finc-clubs-portal:${TOKEN_VERSION}:${password}`),
  );
  return crypto.subtle.importKey("raw", digest, { name: "HMAC", hash: "SHA-256" }, false, usage);
}

function toBase64Url(bytes: ArrayBuffer): string {
  let binary = "";
  for (const byte of new Uint8Array(bytes)) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array | null {
  try {
    const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return bytes;
  } catch {
    return null;
  }
}

/**
 * Compare a submitted password with the configured one. Both sides are hashed
 * first so the comparison is over fixed-length digests, and the loop always
 * walks the full length — no early exit, no length leak.
 */
export async function passwordMatches(input: string): Promise<boolean> {
  const password = portalPassword();
  if (!password) return false;
  const [left, right] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(input)),
    crypto.subtle.digest("SHA-256", encoder.encode(password)),
  ]);
  const a = new Uint8Array(left);
  const b = new Uint8Array(right);
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a[i] ^ b[i];
  return diff === 0;
}

/** Mint a session token. Returns null when the deployment has no password set. */
export async function createSessionToken(now = Date.now()): Promise<string | null> {
  const password = portalPassword();
  if (!password) return null;
  const expiresAt = now + SESSION_TTL_SECONDS * 1000;
  const payload = `${TOKEN_VERSION}.${expiresAt}`;
  const key = await signingKey(password, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return `${payload}.${toBase64Url(signature)}`;
}

/** True only for a token this deployment signed, that has not yet expired. */
export async function verifySessionToken(token: string | undefined, now = Date.now()): Promise<boolean> {
  const password = portalPassword();
  if (!password || !token) return false;

  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [version, rawExpiry, rawSignature] = parts;
  if (version !== TOKEN_VERSION) return false;

  const expiresAt = Number(rawExpiry);
  if (!Number.isFinite(expiresAt) || expiresAt <= now) return false;

  const signature = fromBase64Url(rawSignature);
  if (!signature) return false;

  try {
    const key = await signingKey(password, ["verify"]);
    return await crypto.subtle.verify(
      "HMAC",
      key,
      signature as unknown as ArrayBuffer,
      encoder.encode(`${version}.${rawExpiry}`),
    );
  } catch {
    return false;
  }
}

/**
 * Only same-portal paths are valid post-login destinations. Anything else
 * (`//evil.com`, `https://…`, a public club page) falls back to the dashboard,
 * so the login form can never be used as an open redirect.
 */
export function safeNextPath(value: FormDataEntryValue | string | null | undefined): string {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw.startsWith(`${PORTAL_PATH}/`) && raw !== PORTAL_PATH) return PORTAL_PATH;
  if (raw.startsWith(`${PORTAL_PATH}//`)) return PORTAL_PATH;
  return raw;
}

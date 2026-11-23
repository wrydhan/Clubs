/**
 * Twitter/X reads `twitter:image`, which falls back to `og:image` anyway — this
 * file keeps both explicit so a future change to one never silently drops the
 * other. Same renderer, same 1200x630 card.
 *
 * `dynamic` is declared here rather than re-exported: Next parses route segment
 * config statically, so it rejects a re-exported field.
 */
export { alt, size, contentType } from "./opengraph-image";
export { default } from "./opengraph-image";

export const dynamic = "force-static";

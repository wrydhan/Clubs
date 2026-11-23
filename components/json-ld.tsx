/**
 * Renders structured data as a plain <script type="application/ld+json">.
 *
 * `<` is escaped so a stray angle bracket in an event description can never
 * close the script tag early. The block is inert as far as React is concerned:
 * crawlers read the text, browsers ignore it.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

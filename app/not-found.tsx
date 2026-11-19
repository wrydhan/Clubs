import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-[1360px] px-5 py-24 sm:px-8">
      <div className="max-w-xl">
        <span className="label">404 · page not found</span>
        <h1 className="mt-4 font-serif text-[2.8rem] leading-[0.9]">This one fell off the board.</h1>
        <p className="mt-4 text-sm leading-relaxed text-ink-2">
          That page has been retired. Everything lives on the calendar now.
        </p>
        <Link href="/" className="pill-btn mt-7 inline-flex">
          Back to the calendar
        </Link>
      </div>
    </main>
  );
}

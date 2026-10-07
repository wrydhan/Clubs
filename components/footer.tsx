import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-8 px-5 py-12 md:flex-row md:items-end md:justify-between md:px-8">
        <div>
          <p className="font-serif text-3xl leading-none">Clubs</p>
          <p className="mt-2 text-sm text-muted">Founders, Inc. · Fort Mason, San Francisco</p>
        </div>
        <nav className="flex flex-col gap-2 text-sm sm:flex-row sm:gap-6" aria-label="Footer">
          <Link href="/clubs/calendar" className="hover:underline">
            Calendar
          </Link>
          <Link href="/clubs/apply" className="hover:underline">
            Start a club
          </Link>
          <a href="https://f.inc" className="hover:underline" target="_blank" rel="noreferrer">
            f.inc
          </a>
          <a href="https://f.inc/campus" className="hover:underline" target="_blank" rel="noreferrer">
            Campus
          </a>
        </nav>
      </div>
    </footer>
  );
}

import Link from "next/link";
import { Scrap, Tape } from "@/components/collage/paper";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-[1360px] px-5 py-24 sm:px-8">
      <div className="max-w-xl">
        <Scrap tone="news" rotate={-1.4} className="relative px-7 py-9">
          <Tape className="-left-5 -top-3" rotate={-22} width={96} height={28} />
          <span className="label">404 · scrap not found</span>
          <h1 className="mt-4 font-serif text-[2.8rem] leading-[0.9]">This one fell off the board.</h1>
          <p className="mt-4 text-sm leading-relaxed text-ink-2">
            The club may have ended, or the link is off the pin.
          </p>
          <Link href="/clubs" className="pill-btn mt-7">
            Back to the wall
          </Link>
        </Scrap>
      </div>
    </main>
  );
}

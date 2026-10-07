import Link from "next/link";
import { btnPrimary } from "@/lib/styles";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-[1200px] px-5 py-24 md:px-8">
      <h1 className="font-serif text-5xl leading-none">That page isn&apos;t here.</h1>
      <p className="mt-4 max-w-sm text-muted">The club may have ended, or the link is off.</p>
      <Link href="/clubs" className={`${btnPrimary} mt-8`}>
        All clubs
      </Link>
    </main>
  );
}

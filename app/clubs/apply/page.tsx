import type { Metadata } from "next";
import Link from "next/link";
import { ApplyForm } from "@/components/apply-form";
import { ClubImage } from "@/components/club-image";
import { FaqList } from "@/components/faq";
import { expectations, goodApplication, perks, steps, timeline } from "@/lib/copy";
import { getClubs } from "@/lib/clubs";

export const metadata: Metadata = {
  title: "Start a Club in San Francisco",
  description:
    "Apply to run a Founders, Inc. club in San Francisco. We fund it, give you space at Fort Mason, and you host it.",
  alternates: { canonical: "/clubs/apply" },
};

export default function ApplyPage() {
  const running = getClubs().filter((club) => club.status === "active");

  return (
    <main>
      <header className="mx-auto max-w-[1200px] px-5 pb-12 pt-10 md:px-8 md:pt-16">
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted">Founders, Inc. · San Francisco</p>
        <h1 className="mt-3 max-w-[12ch] font-serif text-[3.2rem] leading-[0.92] md:text-7xl">
          Run the thing you wish existed.
        </h1>
        <p className="mt-5 max-w-lg text-base leading-relaxed text-muted">
          If you&apos;ve been the person holding a group chat together, this is how it becomes a club. We fund it.
          You still run it.
        </p>
      </header>

      <section className="border-t border-line">
        <div className="mx-auto max-w-[1200px] px-5 py-14 md:px-8">
          <h2 className="font-serif text-4xl leading-none">How it works</h2>
          <ol className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <li key={step.n}>
                <p className="font-serif text-5xl leading-none text-muted">{step.n}</p>
                <h3 className="mt-3 font-serif text-2xl">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-5 pb-14 md:px-8">
        <h2 className="font-serif text-4xl leading-none">What you get</h2>
        <dl className="mt-6 border-b border-line">
          {perks.map((perk) => (
            <div key={perk.label} className="grid gap-1 border-t border-line py-4 sm:grid-cols-[9rem_1fr] sm:gap-6">
              <dt>{perk.label}</dt>
              <dd className="text-sm leading-relaxed text-muted">{perk.detail}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto grid max-w-[1200px] gap-12 px-5 py-14 md:grid-cols-2 md:px-8">
          <div>
            <h2 className="font-serif text-4xl leading-none">What we expect</h2>
            <ul className="mt-6 flex flex-col gap-4">
              {expectations.map((item) => (
                <li key={item} className="border-t border-line pt-4 text-sm leading-relaxed">
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-serif text-4xl leading-none">A good application</h2>
            <ol className="mt-6 flex flex-col gap-5">
              {goodApplication.map((item, index) => (
                <li key={item.title}>
                  <p className="font-serif text-xl">
                    <span className="text-muted">{index + 1}. </span>
                    {item.title}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{item.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-5 pb-14 md:px-8">
        <h2 className="font-serif text-4xl leading-none">Timeline</h2>
        <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {timeline.map((item, index) => (
            <li key={item.title} className="border-t border-line pt-4">
              <p className="font-serif text-4xl leading-none text-muted">0{index + 1}</p>
              <h3 className="mt-3 font-serif text-2xl">{item.title}</h3>
              <p className="mt-1 text-sm text-muted">{item.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-[1200px] px-5 pb-4 md:px-8">
        <h2 className="mb-8 font-serif text-4xl leading-none">Questions</h2>
        <FaqList />
      </section>

      <section className="border-t border-line bg-card">
        <div className="mx-auto max-w-[720px] px-5 py-14 md:px-8">
          <h2 className="font-serif text-4xl leading-none">Apply</h2>
          <p className="mt-3 text-sm text-muted">We read these. Short and specific beats a manifesto.</p>
          <div className="mt-8">
            <ApplyForm />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-5 py-14 md:px-8">
        <h2 className="font-serif text-4xl leading-none">Already running</h2>
        <div className="mt-8 grid gap-8 md:grid-cols-3">
          {running.map((club) => (
            <Link key={club.slug} href={`/clubs/${club.slug}`} className="group block">
              <ClubImage
                src={club.heroImage}
                alt={club.name}
                label={club.name}
                tone={club.slug}
                className="aspect-[4/3] w-full"
                sizes="(max-width: 768px) 100vw, 30vw"
              />
              <h3 className="mt-3 font-serif text-2xl group-hover:underline">{club.name}</h3>
              <p className="mt-1 text-sm text-muted">{club.tagline}</p>
              <p className="mt-2 text-sm">{club.cadence}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { ApplyForm } from "@/components/apply-form";
import { ClubImage } from "@/components/club-image";
import { FaqList } from "@/components/faq";
import { expectations, goodApplication, perks, steps, timeline } from "@/lib/copy";
import { getClubs } from "@/lib/clubs";

export const metadata: Metadata = {
  title: "Start a Club — Founders, Inc. Fort Mason",
  description:
    "Apply to run a Founders, Inc. club in San Francisco. We provide budgets, space at Fort Mason, logistics, and media production. You host it.",
  alternates: { canonical: "/clubs/apply" },
};

export default function ApplyPage() {
  const running = getClubs().filter((club) => club.status === "active");

  return (
    <main className="min-h-screen">
      {/* Header Banner */}
      <header className="relative border-b border-line bg-paper px-6 py-16 md:px-10 md:py-24 finc-grid">
        <div className="mx-auto max-w-[1280px]">
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
            <span className="flex items-center gap-1.5 text-accent font-semibold">
              <span className="inline-block h-2 w-2 rounded-full bg-accent" />
              Founders, Inc. Clubs
            </span>
            <span>·</span>
            <span>Host Applications</span>
          </div>
          <div className="mt-6 max-w-3xl">
            <h1 className="font-serif text-[3.8rem] leading-[0.92] text-ink sm:text-6xl md:text-7xl tracking-tight">
              Run the thing you wish existed.
            </h1>
            <p className="mt-6 text-lg md:text-xl text-ink-secondary leading-relaxed font-sans">
              If you&apos;ve been the person holding a group chat together, this is how it becomes an institution. We fund it, provide venue access at Fort Mason, and document the sessions. You lead the craft.
            </p>
          </div>
        </div>
      </header>

      {/* How it Works Stepper */}
      <section className="border-b border-line bg-paper-subtle py-16 md:py-20 px-6 md:px-10">
        <div className="mx-auto max-w-[1280px]">
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-muted mb-8">
            <span>Process</span>
          </div>
          <h2 className="font-serif text-3xl md:text-4xl text-ink mb-12">How It Works</h2>
          <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <li key={step.n} className="border border-line bg-card p-6 rounded-sm shadow-sm flex flex-col justify-between">
                <div>
                  <span className="font-mono text-xs text-accent font-semibold tracking-widest">{step.n}</span>
                  <h3 className="mt-3 font-serif text-2xl text-ink">{step.title}</h3>
                  <p className="mt-3 text-sm text-ink-secondary leading-relaxed">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* What You Get / Perks */}
      <section className="border-b border-line py-16 md:py-20 px-6 md:px-10 bg-paper">
        <div className="mx-auto max-w-[1280px]">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted">Resources</span>
          <h2 className="mt-2 font-serif text-3xl md:text-4xl text-ink">What Founders, Inc. Provides</h2>
          <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {perks.map((perk) => (
              <div key={perk.label} className="border border-line bg-card p-6 rounded-sm">
                <dt className="font-mono text-xs font-semibold uppercase tracking-wider text-accent">
                  {perk.label}
                </dt>
                <dd className="mt-2 text-sm text-ink-secondary leading-relaxed font-sans">
                  {perk.detail}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Expectations and Criteria */}
      <section className="border-b border-line bg-paper-subtle py-16 md:py-20 px-6 md:px-10">
        <div className="mx-auto grid max-w-[1280px] gap-12 lg:grid-cols-2">
          <div className="border border-line bg-card p-8 rounded-sm shadow-sm">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted">Requirements</span>
            <h2 className="mt-2 font-serif text-3xl text-ink">What We Expect</h2>
            <ul className="mt-6 flex flex-col gap-4 font-sans text-sm text-ink-secondary">
              {expectations.map((item, idx) => (
                <li key={item} className="flex items-start gap-3 border-t border-line/60 pt-4">
                  <span className="font-mono text-xs text-muted font-medium">0{idx + 1}</span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="border border-line bg-card p-8 rounded-sm shadow-sm">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted">Submissions</span>
            <h2 className="mt-2 font-serif text-3xl text-ink">A Strong Application</h2>
            <ol className="mt-6 flex flex-col gap-4 font-sans text-sm text-ink-secondary">
              {goodApplication.map((item, index) => (
                <li key={item.title} className="border-t border-line/60 pt-4">
                  <p className="font-serif text-lg text-ink font-normal">
                    <span className="font-mono text-xs text-accent font-semibold mr-2">0{index + 1}</span>
                    {item.title}
                  </p>
                  <p className="mt-1 text-sm text-ink-secondary leading-relaxed pl-6">{item.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="border-b border-line py-16 md:py-20 px-6 md:px-10 bg-paper">
        <div className="mx-auto max-w-[1280px]">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted">Review Cadence</span>
          <h2 className="mt-2 font-serif text-3xl md:text-4xl text-ink">Timeline</h2>
          <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {timeline.map((item, index) => (
              <li key={item.title} className="border border-line bg-card p-6 rounded-sm">
                <span className="font-mono text-2xl text-accent font-serif">0{index + 1}</span>
                <h3 className="mt-3 font-serif text-xl text-ink">{item.title}</h3>
                <p className="mt-1 text-xs font-mono text-muted">{item.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="border-b border-line bg-paper-subtle py-16 md:py-20 px-6 md:px-10">
        <div className="mx-auto max-w-[1000px]">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted">Answers</span>
          <h2 className="mt-2 mb-8 font-serif text-3xl md:text-4xl text-ink">Frequently Asked Questions</h2>
          <div className="border border-line bg-card p-6 md:p-8 rounded-sm shadow-sm">
            <FaqList />
          </div>
        </div>
      </section>

      {/* Application Form Block */}
      <section id="form" className="py-20 px-6 md:px-10 bg-paper finc-grid border-b border-line">
        <div className="mx-auto max-w-[760px]">
          <div className="text-center mb-10">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-accent font-semibold">
              Get Started
            </span>
            <h2 className="mt-2 font-serif text-4xl md:text-5xl text-ink">Apply to Host a Club</h2>
            <p className="mt-3 text-sm text-ink-secondary">
              We review applications on a rolling weekly basis. Concise and specific applications get scheduled for a chat first.
            </p>
          </div>
          <div className="border border-line bg-card p-6 md:p-10 rounded-sm shadow-md">
            <ApplyForm />
          </div>
        </div>
      </section>

      {/* Existing Clubs */}
      <section className="py-16 md:py-20 px-6 md:px-10 bg-paper-subtle">
        <div className="mx-auto max-w-[1280px]">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted">Precedent</span>
          <h2 className="mt-2 font-serif text-3xl text-ink mb-8">Currently Running Clubs</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {running.map((club) => (
              <Link
                key={club.slug}
                href={`/clubs/${club.slug}`}
                className="group block border border-line bg-card p-5 rounded-sm hover:border-line-strong transition-all shadow-sm"
              >
                <div className="aspect-[16/10] overflow-hidden rounded-sm bg-paper-subtle">
                  <ClubImage
                    src={club.heroImage}
                    alt={club.name}
                    label={club.name}
                    tone={club.slug}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 30vw"
                  />
                </div>
                <h3 className="mt-4 font-serif text-2xl text-ink group-hover:text-accent transition-colors">
                  {club.name}
                </h3>
                <p className="mt-1 text-sm text-ink-secondary line-clamp-2">{club.tagline}</p>
                <div className="mt-4 border-t border-line/60 pt-3 font-mono text-xs text-muted flex items-center justify-between">
                  <span>{club.cadence}</span>
                  <span className="text-accent group-hover:translate-x-0.5 transition-transform">→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

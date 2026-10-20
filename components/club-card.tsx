import Link from "next/link";
import Image from "next/image";
import { Scrap, Tape } from "@/components/collage/paper";
import { formatMonthDay } from "@/lib/format";
import { getNextEvent, type Club } from "@/lib/clubs";

/** A club as a taped-up print on the wall (used where a full sticker sheet is too much). */
export function ClubCard({ club, now, index = 0 }: { club: Club; now: Date; index?: number }) {
  const next = getNextEvent(club.slug, now);

  return (
    <Scrap
      tone={index % 2 === 0 ? "cream" : "news"}
      rotate={index % 2 === 0 ? -1.2 : 1.1}
      className="group relative h-full px-5 py-6"
    >
      <Tape className="-left-4 -top-3" rotate={-26} width={92} height={28} />
      <div className="flex items-start justify-between gap-3">
        <span className="label">{club.theme?.tag ?? "Campus club"}</span>
        <span className="label tnum text-ink/40">{String(index + 1).padStart(2, "0")}</span>
      </div>

      <div className="relative mt-4 aspect-[16/10] w-full overflow-hidden bg-paperdeep">
        <Image
          src={club.heroImage}
          alt={club.name}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>

      <h3 className="mt-5 font-serif text-[2rem] leading-none">{club.name}</h3>
      <p className="mt-2 text-[13px] leading-relaxed text-ink/70">{club.description}</p>

      <div className="mt-5 flex items-end justify-between gap-4 border-t border-ink/12 pt-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink/55">
          {next ? formatMonthDay(next.datetime) : "Schedule TBA"}
        </span>
        <Link href={`/clubs/${club.slug}`} className="pill-btn text-[12px]">
          Open club →
        </Link>
      </div>
    </Scrap>
  );
}

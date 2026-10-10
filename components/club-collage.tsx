import { ClubImage } from "@/components/club-image";

export function ClubCollage({
  images,
  tone,
}: {
  images: { src: string; alt: string }[];
  tone: string;
}) {
  const tiles = images.slice(0, 6);

  return (
    <div className="grid aspect-[4/3] w-full grid-cols-2 md:aspect-[21/9] grid-rows-2 gap-1 md:grid-cols-3">
      {tiles.map((image, index) => (
        <ClubImage
          key={image.src}
          src={image.src}
          alt={image.alt}
          label={image.alt}
          tone={tone}
          priority={index < 2}
          sizes="(max-width: 768px) 50vw, 22vw"
          className={`h-full min-h-0 ${index >= 4 ? "hidden md:block" : ""}`}
        />
      ))}
    </div>
  );
}

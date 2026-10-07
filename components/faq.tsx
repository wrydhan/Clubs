import { faqs } from "@/lib/copy";

export function FaqList() {
  return (
    <div className="border-b border-line">
      {faqs.map((item) => (
        <details key={item.q} className="group border-t border-line">
          <summary className="flex cursor-pointer list-none items-baseline justify-between gap-6 py-4 font-serif text-[1.35rem] leading-tight md:text-2xl">
            {item.q}
            <span aria-hidden className="font-sans text-2xl leading-none text-muted group-open:rotate-45">
              +
            </span>
          </summary>
          <p className="max-w-2xl pb-5 text-[15px] leading-relaxed text-muted">{item.a}</p>
        </details>
      ))}
    </div>
  );
}

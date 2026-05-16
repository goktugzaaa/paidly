export function Marquee({ text }: { text: string }) {
  // Duplicate text so the linear loop never shows empty space
  return (
    <div className="overflow-hidden border-y border-slate-900/10 bg-white py-5">
      <div className="flex w-max animate-marquee whitespace-nowrap">
        {Array.from({ length: 4 }).map((_, i) => (
          <span
            key={i}
            className="mx-8 font-serif text-3xl italic text-slate-900 sm:text-4xl md:text-5xl"
          >
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}

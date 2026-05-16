import Link from "next/link";
import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg" | "xl";

const markPx: Record<Size, number> = { sm: 28, md: 34, lg: 48, xl: 96 };
const textSize: Record<Size, string> = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-4xl",
  xl: "text-6xl",
};

/**
 * Vellum mark — folded page corner motif (page / folio leaf).
 * Pure inline SVG; no external image asset.
 */
export function LogoMark({ size = "md", className }: { size?: Size; className?: string }) {
  const px = markPx[size];
  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 40 40"
      fill="none"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      {/* page body */}
      <path
        d="M6 4 H28 L34 10 V34 a2 2 0 0 1 -2 2 H6 a2 2 0 0 1 -2 -2 V6 a2 2 0 0 1 2 -2 z"
        fill="#0c1a3a"
      />
      {/* folded corner — cyan accent */}
      <path d="M28 4 V10 H34 z" fill="#22d3ee" />
      <path d="M28 4 L34 10" stroke="#0c1a3a" strokeWidth="0.6" />
      {/* serif italic F */}
      <text
        x="11"
        y="28"
        fontFamily="var(--font-serif), Georgia, serif"
        fontSize="20"
        fontStyle="italic"
        fontWeight="400"
        fill="#ffffff"
      >
        F
      </text>
    </svg>
  );
}

export function Brand({
  size = "md",
  href = "/",
  showText = true,
  className,
}: {
  size?: Size;
  href?: string | null;
  showText?: boolean;
  className?: string;
}) {
  const inner = (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark size={size} />
      {showText && (
        <span className={cn("font-serif italic tracking-tight text-slate-900", textSize[size])}>
          Vellum
        </span>
      )}
    </span>
  );
  if (!href) return inner;
  return <Link href={href}>{inner}</Link>;
}

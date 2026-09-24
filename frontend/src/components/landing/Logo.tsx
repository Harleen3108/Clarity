import Link from "next/link";

/** Two overlapping circles — orange (BM25) left, blue (Dense) right — beside "Clarity". */
export function LogoMark({
  size = 28,
  strokeWidth = 1.8,
}: {
  size?: number;
  strokeWidth?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      strokeWidth={strokeWidth}
      aria-hidden="true"
    >
      <circle cx="10.5" cy="14" r="7.5" stroke="#FF9F43" />
      <circle cx="17.5" cy="14" r="7.5" stroke="#6EA8FF" />
    </svg>
  );
}

export function Logo({
  markSize = 30,
  textSize = 22,
  href = "#top",
}: {
  markSize?: number;
  textSize?: number;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 no-underline"
      aria-label="Clarity home"
    >
      <LogoMark size={markSize} />
      <span
        className="font-display font-bold tracking-[-0.01em] text-text"
        style={{ fontSize: textSize }}
      >
        Clarity
      </span>
    </Link>
  );
}

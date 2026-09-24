import Link from "next/link";
import { Logo } from "./Logo";
import { APP_ROUTE } from "@/lib/routes";

const links = [
  { label: "What it does", href: "#about" },
  { label: "How to use", href: "#how-to-use" },
  { label: "Try it", href: "#try" },
];

export function LandingNav() {
  return (
    <header className="relative flex items-center justify-between px-16 py-7">
      <Logo markSize={30} textSize={22} />
      <nav className="flex items-center gap-8 text-[15px]">
        {links.map((l) => (
          <a
            key={l.href}
            href={l.href}
            className="text-text-2 no-underline transition-colors hover:text-text"
          >
            {l.label}
          </a>
        ))}
        <Link
          href={APP_ROUTE}
          className="rounded-[10px] bg-text px-5 py-3 font-medium text-bg no-underline"
        >
          Open Clarity
        </Link>
      </nav>
    </header>
  );
}

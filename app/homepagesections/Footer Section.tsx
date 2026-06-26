import Image from "next/image";
import Link from "next/link";

const LOGO_SRC = "/Logo/Thambalagama%20Logo%202.png";

const NAV_LINKS = [
  { href: "/", label: "Sanctuary" },
  { href: "/about", label: "Forest" },
  { href: "/experiences", label: "Experience" },
  { href: "/contact", label: "Gallery" },
] as const;

const FOOTER_LINK_TYPOGRAPHY =
  "font-secondary text-[30px] font-bold uppercase leading-[130%] tracking-[0.2px] transition-opacity hover:opacity-80";

const SOCIAL_LINKS = [
  { href: "#", label: "Instagram" },
  { href: "#", label: "Facebook" },
  { href: "#", label: "TikTok" },
] as const;

function ExternalLinkIcon() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      <path
        d="M14 5H19V10M19 5L10 14M19 14V19H5V5H10"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FooterSection() {
  return (
    <footer className="flex min-h-screen flex-col bg-deep-forest text-cream">
      <div className="flex flex-1 flex-col justify-center gap-12 px-[clamp(1.25rem,4vw,2rem)] py-[clamp(3rem,8vw,6rem)] lg:flex-row lg:items-center lg:justify-between">
        <Link href="/" className="shrink-0">
          <Image
            src={LOGO_SRC}
            alt="Thambalagama Estate"
            width={699}
            height={685}
            className="h-auto w-auto max-w-[clamp(10rem,22vw,18rem)]"
          />
        </Link>

        <nav
          aria-label="Footer navigation"
          className="w-full lg:max-w-[min(52rem,55vw)]"
        >
          {NAV_LINKS.map(({ href, label }) => (
            <div key={href} className="border-b border-cream/30">
              <Link
                href={href}
                className={`block py-[clamp(0.75rem,2vw,1.25rem)] ${FOOTER_LINK_TYPOGRAPHY}`}
              >
                {label}
              </Link>
            </div>
          ))}

          <div className="border-b border-cream/30">
            <Link
              href="/book"
              className={`flex items-center justify-between py-[clamp(0.75rem,2vw,1.25rem)] ${FOOTER_LINK_TYPOGRAPHY}`}
            >
              Check Availability
              <ExternalLinkIcon />
            </Link>
          </div>
        </nav>
      </div>

      <div className="flex flex-col gap-4 border-t border-cream/20 px-[clamp(1.25rem,4vw,2rem)] py-6 font-secondary text-[clamp(0.625rem,0.5vw+0.5rem,0.75rem)] font-medium uppercase tracking-[0.15em] text-cream/90 lg:flex-row lg:items-center lg:justify-between">
        <p>© 2026 Thambalagama Estate</p>

        <div className="flex flex-wrap gap-[clamp(1rem,3vw,2.5rem)]">
          {SOCIAL_LINKS.map(({ href, label }) => (
            <Link
              key={label}
              href={href}
              className="transition-opacity hover:opacity-80"
            >
              {label}
            </Link>
          ))}
        </div>

        <Link
          href="mailto:info@thambalagamaestate.com"
          className="transition-opacity hover:opacity-80"
        >
          Info@thambalagamaestate.com
        </Link>

        <p>Crafted by Hyke || Malinda & Sameera</p>
      </div>
    </footer>
  );
}

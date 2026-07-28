"use client";

import Image from "next/image";
import Link from "next/link";
import { useBooking } from "../components/booking/BookingProvider";
import { useTempPalette } from "../components/TempPaletteToggle";

const LOGO_LIGHT_SRC = "/Logo/Thambalagama%20Logo%203.png";
const LOGO_DARK_SRC = "/Logo/ThambalagamaLogo.png";

const NAV_LINKS = [
  { href: "/", label: "Sanctuary" },
  { href: "/forest", label: "Forest" },
  { href: "/experiences", label: "Experience" },
  { href: "/gallery", label: "Gallery" },
] as const;

const FOOTER_LINK_TYPOGRAPHY =
  "font-space-grotesk text-[clamp(24px,6.15vw,30px)] font-bold uppercase leading-[130%] tracking-[0.2px] transition-opacity duration-300 group-hover/nav:opacity-[36%] hover:opacity-100";

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
  const { open: openBooking } = useBooking();
  const { palette } = useTempPalette();
  const isDark = palette === "dark";

  return (
    <footer
      className={`flex min-h-screen flex-col ${
        isDark ? "bg-deep-forest text-cream" : "bg-cream text-deep-forest"
      }`}
    >
      <div className="flex flex-1 flex-col justify-center gap-12 px-5 py-12 md:px-8 md:py-24 lg:flex-row lg:items-center lg:justify-between">
        <Link href="/" className="shrink-0">
          <Image
            src={isDark ? LOGO_DARK_SRC : LOGO_LIGHT_SRC}
            alt="Thambalagama Estate"
            width={361}
            height={381}
            className="h-auto w-auto max-w-40 md:max-w-72"
          />
        </Link>

        <nav
          aria-label="Footer navigation"
          className="group/nav w-full lg:max-w-[min(52rem,55vw)]"
        >
          {NAV_LINKS.map(({ href, label }) => (
            <div
              key={href}
              className={`border-b ${
                isDark ? "border-cream/30" : "border-deep-forest/30"
              }`}
            >
              <Link
                href={href}
                className={`block py-2 md:py-3 ${FOOTER_LINK_TYPOGRAPHY}`}
              >
                {label}
              </Link>
            </div>
          ))}

          <div>
            <button
              type="button"
              onClick={openBooking}
              className={`flex w-full items-center justify-between py-2 text-left md:py-3 ${FOOTER_LINK_TYPOGRAPHY}`}
            >
              Check Availability
              <ExternalLinkIcon />
            </button>
          </div>
        </nav>
      </div>

      <div
        className={`flex flex-col items-center gap-4 px-5 py-6 text-center font-secondary text-xs font-medium uppercase tracking-[0.15em] md:px-8 lg:mb-[53px] lg:flex-row lg:items-center lg:justify-between lg:text-left ${
          isDark ? "text-cream/90" : "text-deep-forest/90"
        }`}
      >        <p>© 2026 Thambalagama Estate</p>

        <div className="flex flex-wrap justify-center gap-4 md:gap-10 lg:justify-start">
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

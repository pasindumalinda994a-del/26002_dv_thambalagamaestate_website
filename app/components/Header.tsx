"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useBooking } from "./booking/BookingProvider";
import { HeaderMenuDrawer } from "./HeaderMenuDrawer";

const LOGO_SRC = "/Logo/Thambalagama%20Logo%202.png";

const NAV_LINKS = [
  { href: "/", label: "Sanctuary" },
  { href: "/about", label: "Forest" },
  { href: "/experiences", label: "Experience" },
  { href: "/contact", label: "Gallery" },
] as const;

function MenuIcon({ open }: { open: boolean }) {
  return (
    <span className="relative flex h-5 w-7 items-center justify-center" aria-hidden>
      <span
        className={[
          "absolute block h-0.5 w-7 rounded-full bg-cream transition-transform duration-200",
          open ? "translate-y-0 rotate-45" : "-translate-y-[5px]",
        ].join(" ")}
      />
      <span
        className={[
          "absolute block h-0.5 w-7 rounded-full bg-cream transition-transform duration-200",
          open ? "translate-y-0 -rotate-45" : "translate-y-[5px]",
        ].join(" ")}
      />
    </span>
  );
}

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { open: openBooking } = useBooking();
  const closeMenu = () => setMenuOpen(false);

  const handleAvailability = () => {
    closeMenu();
    openBooking();
  };

  const headerBarClassName =
    "flex w-auto items-center justify-between bg-deep-forest px-5 py-3 md:w-fit md:justify-center md:gap-16 md:px-8";

  return (
    <>
      <header
        className={[
          "fixed top-[16px] left-[16px] right-[16px] z-[502] md:left-1/2 md:right-auto md:-translate-x-1/2",
          headerBarClassName,
        ].join(" ")}
      >
        <Link href="/" onClick={closeMenu} className="shrink-0">
          <Image
            src={LOGO_SRC}
            alt="Thambalagama Estate"
            width={699}
            height={685}
            className="h-auto w-auto max-h-8"
            priority
          />
        </Link>

        <button
          type="button"
          onClick={handleAvailability}
          className="hidden items-center gap-2 font-secondary text-[14px] font-medium uppercase tracking-[0.2px] text-cream transition-opacity hover:opacity-80 md:inline-flex"
        >
          Check Availability
          <span aria-hidden>→</span>
        </button>

        <button
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="main-navigation"
          onClick={() => setMenuOpen((open) => !open)}
          className="flex shrink-0 items-center justify-center p-1"
        >
          <MenuIcon open={menuOpen} />
        </button>
      </header>

      <HeaderMenuDrawer
        open={menuOpen}
        onClose={closeMenu}
        onCheckAvailability={handleAvailability}
        navLinks={NAV_LINKS}
      />
    </>
  );
}

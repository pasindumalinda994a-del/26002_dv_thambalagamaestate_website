"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, type ButtonVariant } from "./SolidButton";

const LOGO_SRC = "/Logo/Thambalagama%20Logo%202.png";

const NAV_LINKS = [
  { href: "/", label: "Sanctuary" },
  { href: "/about", label: "Forest" },
  { href: "/experiences", label: "Experience" },
  { href: "/contact", label: "Gallery" },
] as const;

type HeaderProps = {
  variant?: "default" | "hero";
};

function MobileMenuIcon({ open, onCream }: { open: boolean; onCream: boolean }) {
  const barColor = onCream ? "bg-forest-green" : "bg-cream";

  return (
    <span className="relative flex h-5 w-7 items-center justify-center" aria-hidden>
      <span
        className={[
          "absolute block h-0.5 w-7 rounded-full transition-[transform,background-color] duration-200",
          barColor,
          open ? "translate-y-0 rotate-45" : "-translate-y-[5px]",
        ].join(" ")}
      />
      <span
        className={[
          "absolute block h-0.5 w-7 rounded-full transition-[transform,background-color] duration-200",
          barColor,
          open ? "translate-y-0 -rotate-45" : "translate-y-[5px]",
        ].join(" ")}
      />
    </span>
  );
}

export function Header({ variant = "default" }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [onCreamBg, setOnCreamBg] = useState(false);
  const isHero = variant === "hero";

  useEffect(() => {
    if (!isHero) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const heroSection = document.querySelector<HTMLElement>('[aria-label="Hero"]');
    if (!heroSection) return;

    const trigger = ScrollTrigger.create({
      trigger: heroSection,
      start: "top top",
      end: "+=100%",
      onUpdate: (self) => {
        setOnCreamBg(self.progress > 0);
      },
      onLeave: () => setOnCreamBg(false),
      onEnterBack: () => setOnCreamBg(false),
    });

    return () => trigger.kill();
  }, [isHero]);

  const closeMenu = () => setMenuOpen(false);
  const buttonVariant: ButtonVariant = onCreamBg ? "onCream" : "onDark";
  const navTextClass =
    isHero && !onCreamBg ? "text-cream" : "text-forest-green";

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[500] flex w-full items-center justify-between bg-[#000000]/6 px-[clamp(1.25rem,4vw,2rem)] py-3 shadow-[inset_0_-1px_0_0] shadow-cream/24 backdrop-blur-[10px] md:hidden">
        <Link href="/" onClick={closeMenu}>
          <Image
            src={LOGO_SRC}
            alt="Thambalagama Estate"
            width={699}
            height={685}
            className="h-auto w-auto max-h-[clamp(1.75rem,4vw,2rem)]"
            priority
          />
        </Link>

        <button
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen((open) => !open)}
          className="flex items-center justify-center p-1"
        >
          <MobileMenuIcon open={menuOpen} onCream={onCreamBg} />
        </button>
      </header>

      {menuOpen ? (
        <div
          id="mobile-navigation"
          className="fixed inset-0 z-[501] flex flex-col bg-[#000000]/6 shadow-[inset_0_-1px_0_0] shadow-cream/24 backdrop-blur-[10px] md:hidden"
        >
          <div className="flex items-center justify-between px-[clamp(1.25rem,4vw,2rem)] py-3">
            <Link href="/" onClick={closeMenu}>
              <Image
                src={LOGO_SRC}
                alt="Thambalagama Estate"
                width={699}
                height={685}
                className="h-auto w-auto max-h-[clamp(1.75rem,4vw,2rem)]"
              />
            </Link>

            <button
              type="button"
              aria-label="Close menu"
              onClick={closeMenu}
              className="flex items-center justify-center p-1"
            >
              <MobileMenuIcon open onCream={onCreamBg} />
            </button>
          </div>

          <nav
            aria-label="Main navigation"
            className="flex flex-1 flex-col items-center justify-center gap-[clamp(1.5rem,4vw,2rem)] px-[clamp(1.25rem,4vw,2rem)] font-secondary text-base font-medium uppercase tracking-[0.2px] text-cream"
          >
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={closeMenu}
                className="transition-opacity hover:opacity-80"
              >
                {label}
              </Link>
            ))}

            <Button href="/book" variant={buttonVariant}>
              Check Availability
            </Button>
          </nav>
        </div>
      ) : null}

      <header className="fixed inset-x-0 top-0 z-[500] hidden w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-x-[clamp(1rem,2.5vw,2rem)] bg-[#000000]/6 px-[clamp(1.25rem,4vw,2rem)] py-3 shadow-[inset_0_-1px_0_0] shadow-cream/24 backdrop-blur-[10px] md:grid">
        <Link href="/" className="justify-self-start">
          <Image
            src={LOGO_SRC}
            alt="Thambalagama Estate"
            width={699}
            height={685}
            className="h-auto w-auto max-h-[clamp(1.75rem,4vw,2rem)]"
            priority
          />
        </Link>

        <nav
          aria-label="Main navigation"
          className={[
            "flex items-center justify-center gap-[clamp(1rem,2.5vw+0.5rem,4rem)] font-secondary text-[clamp(0.75rem,0.5vw+0.65rem,0.875rem)] font-medium uppercase tracking-[0.2px] transition-colors duration-300",
            navTextClass,
          ].join(" ")}
        >
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="transition-opacity hover:opacity-80"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="justify-self-end">
          <Button href="/book" variant={buttonVariant}>
            Check Availability
          </Button>
        </div>
      </header>
    </>
  );
}

"use client";

import gsap from "gsap";
import Image from "next/image";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import {
  AmbientAudioButton,
  AmbientAudioProvider,
} from "./AmbientAudioToggle";
import { useBooking } from "./booking/BookingProvider";
import { HeaderMenuDrawer } from "./HeaderMenuDrawer";
import { TransitionLink } from "./TransitionLink";

const LOGO_SRC = "/Logo/ThambalagamaLogo.png";
const COLLAPSED_WIDTH = 64;
const COLLAPSED_PAD_X = 8;
const MENU_BTN_WIDTH = 40; // size-10
const LINE_Y = 5; // centers ±5px → 6px gap between 4px-thick bars

const NAV_LINKS = [
  { href: "/bungalow", label: "Sanctuary" },
  { href: "/forest", label: "Forest" },
  { href: "/experiences", label: "Experience" },
  { href: "/gallery", label: "Gallery" },
] as const;

function isVisible(el: HTMLElement | null): el is HTMLElement {
  if (!el) return false;
  return window.getComputedStyle(el).display !== "none";
}

type HeaderProps = {
  audioSrc?: string;
};

export function Header({ audioSrc }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [drawerReady, setDrawerReady] = useState(false);
  const { open: openBooking } = useBooking();

  const headerRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const soundRef = useRef<HTMLButtonElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);
  const drawerPanelRef = useRef<HTMLElement>(null);

  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const openSnapshotRef = useRef<{
    width: number;
    paddingX: number;
    left: number;
  } | null>(null);

  const closeMenu = () => setMenuOpen(false);

  const handleDrawerReady = useCallback(() => {
    setDrawerReady(true);
  }, []);

  const handleAvailability = () => {
    closeMenu();
    openBooking();
  };

  useLayoutEffect(() => {
    const header = headerRef.current;
    const logo = logoRef.current;
    const sound = soundRef.current;
    const cta = ctaRef.current;
    const menuBtn = menuBtnRef.current;
    const line1 = line1Ref.current;
    const line2 = line2Ref.current;
    const panel = drawerPanelRef.current;
    if (!header || !menuBtn || !line1 || !line2 || !panel) return;

    tlRef.current?.kill();

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // Sound sits in the header on mobile only; fade it with logo when menu opens
    const fadeTargets = [logo, sound, cta].filter(isVisible);
    const items = gsap.utils.toArray<HTMLElement>(
      panel.querySelectorAll("[data-menu-item]"),
    );

    // Centers the collapsed header box (use with justifyContent: center)
    const collapsedLeft = () =>
      window.innerWidth / 2 - COLLAPSED_WIDTH / 2;

    // Centers the menu button while it stays flex-end during the shrink slide
    const collapsedLeftFlexEnd = () =>
      window.innerWidth / 2 -
      (COLLAPSED_WIDTH - COLLAPSED_PAD_X - MENU_BTN_WIDTH / 2);

    const clearHeaderProps = () => {
      gsap.set(header, {
        clearProps:
          "width,paddingLeft,paddingRight,left,right,xPercent,x,overflow,gap,justifyContent",
      });
      fadeTargets.forEach((el) => {
        gsap.set(el, {
          clearProps: "opacity,pointerEvents,position,width,minWidth,overflow",
        });
      });
    };

    const setBurgerOpen = () => {
      gsap.set([line1, line2], { transformOrigin: "50% 50%" });
      gsap.set(line1, { y: 0, rotate: 45 });
      gsap.set(line2, { y: 0, rotate: -45 });
    };

    const setBurgerClosed = () => {
      gsap.set([line1, line2], { transformOrigin: "50% 50%" });
      gsap.set(line1, { y: -LINE_Y, rotate: 0 });
      gsap.set(line2, { y: LINE_Y, rotate: 0 });
    };

    const setDrawerOpen = () => {
      gsap.set(panel, { opacity: 1, y: 0 });
      gsap.set(items, { opacity: 1, y: 0 });
    };

    const setDrawerClosed = () => {
      gsap.set(panel, { opacity: 0, y: 12 });
      gsap.set(items, { opacity: 0, y: 10 });
    };

    const setChromeHidden = () => {
      gsap.set(fadeTargets, {
        opacity: 0,
        pointerEvents: "none",
        position: "absolute",
        width: 0,
        minWidth: 0,
        overflow: "hidden",
      });
    };

    if (reduceMotion) {
      if (menuOpen) {
        setChromeHidden();
        gsap.set(header, {
          width: COLLAPSED_WIDTH,
          paddingLeft: COLLAPSED_PAD_X,
          paddingRight: COLLAPSED_PAD_X,
          left: collapsedLeft(),
          right: "auto",
          xPercent: 0,
          x: 0,
          overflow: "hidden",
          gap: 0,
          justifyContent: "center",
        });
        setBurgerOpen();
        setDrawerOpen();
      } else {
        setBurgerClosed();
        setDrawerClosed();
        clearHeaderProps();
        openSnapshotRef.current = null;
      }
      return;
    }

    if (menuOpen) {
      const rect = header.getBoundingClientRect();
      const styles = window.getComputedStyle(header);
      const paddingX = parseFloat(styles.paddingLeft) || 20;

      openSnapshotRef.current = {
        width: rect.width,
        paddingX,
        left: rect.left,
      };

      // Lock at current visual position (no jump). Clear CSS translate.
      gsap.set(header, {
        width: rect.width,
        left: rect.left,
        right: "auto",
        x: 0,
        xPercent: 0,
        overflow: "hidden",
      });
      gsap.set([line1, line2], { transformOrigin: "50% 50%" });
      setBurgerClosed();
      setDrawerClosed();

      const tl = gsap.timeline();
      tlRef.current = tl;

      // 1. Fade logo + CTA — keep burger on the right so it doesn't jump
      if (fadeTargets.length) {
        tl.to(fadeTargets, {
          opacity: 0,
          pointerEvents: "none",
          duration: 0.2,
          ease: "power2.out",
          stagger: 0.03,
        });
      }
      tl.set(header, { justifyContent: "flex-end", gap: 0 });
      if (fadeTargets.length) {
        tl.set(fadeTargets, {
          position: "absolute",
          width: 0,
          minWidth: 0,
          overflow: "hidden",
        });
      }

      // 2. Shrink width + slide burger from right → center, then settle centered
      const shrinkAt = fadeTargets.length ? "-=0.02" : 0;
      tl.to(
        header,
        {
          width: COLLAPSED_WIDTH,
          left: collapsedLeftFlexEnd(),
          paddingLeft: COLLAPSED_PAD_X,
          paddingRight: COLLAPSED_PAD_X,
          duration: 0.55,
          ease: "power2.inOut",
        },
        shrinkAt,
      );
      // Resting state: center icon in the box (works for any COLLAPSED_WIDTH)
      tl.set(header, {
        justifyContent: "center",
        left: collapsedLeft(),
      });

      // Lines travel to center, then rotate into X (overlaps width slide)
      tl.to(
        line1,
        { y: 0, duration: 0.28, ease: "power2.inOut" },
        "<",
      );
      tl.to(
        line2,
        { y: 0, duration: 0.28, ease: "power2.inOut" },
        "<",
      );
      tl.to(
        line1,
        { rotate: 45, duration: 0.28, ease: "power2.inOut" },
        "-=0.08",
      );
      tl.to(
        line2,
        { rotate: -45, duration: 0.28, ease: "power2.inOut" },
        "<",
      );

      // 3. Fade in drawer
      tl.to(
        panel,
        { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" },
        "-=0.12",
      );
      if (items.length) {
        tl.to(
          items,
          {
            opacity: 1,
            y: 0,
            duration: 0.35,
            ease: "power2.out",
            stagger: 0.045,
          },
          "-=0.25",
        );
      }

      return () => {
        tl.kill();
      };
    }

    // Close
    const snapshot = openSnapshotRef.current;
    if (!snapshot) {
      setBurgerClosed();
      setDrawerClosed();
      clearHeaderProps();
      return;
    }

    const { width: targetWidth, paddingX: targetPad, left: targetLeft } =
      snapshot;

    // Match open resting icon position, but use flex-end so reverse slide
    // rides the right edge (same visual spot as justify center + box left).
    gsap.set(header, {
      width: COLLAPSED_WIDTH,
      left: collapsedLeftFlexEnd(),
      right: "auto",
      xPercent: 0,
      x: 0,
      overflow: "hidden",
      paddingLeft: COLLAPSED_PAD_X,
      paddingRight: COLLAPSED_PAD_X,
      gap: 0,
      justifyContent: "flex-end",
    });
    setChromeHidden();
    setBurgerOpen();

    const closeTl = gsap.timeline({
      onComplete: () => {
        clearHeaderProps();
        openSnapshotRef.current = null;
      },
    });
    tlRef.current = closeTl;

    // 1. Fade drawer out (chrome stays out of flow — no burger jump)
    if (items.length) {
      closeTl.to(items, {
        opacity: 0,
        y: 8,
        duration: 0.18,
        ease: "power2.in",
        stagger: 0.02,
      });
    }
    closeTl.to(
      panel,
      { opacity: 0, y: 12, duration: 0.22, ease: "power2.in" },
      items.length ? "-=0.08" : 0,
    );

    // 2. Expand width + slide burger back to the right (chrome still absolute)
    closeTl.to(
      header,
      {
        width: targetWidth,
        left: targetLeft,
        paddingLeft: targetPad,
        paddingRight: targetPad,
        duration: 0.55,
        ease: "power2.inOut",
      },
      "-=0.05",
    );

    // Cross → burger: un-rotate then split (with the expand)
    closeTl.to(
      line1,
      { rotate: 0, duration: 0.25, ease: "power2.inOut" },
      "<",
    );
    closeTl.to(
      line2,
      { rotate: 0, duration: 0.25, ease: "power2.inOut" },
      "<",
    );
    closeTl.to(
      line1,
      { y: -LINE_Y, duration: 0.25, ease: "power2.inOut" },
      "-=0.08",
    );
    closeTl.to(
      line2,
      { y: LINE_Y, duration: 0.25, ease: "power2.inOut" },
      "<",
    );

    // 3. Only after expand: put logo/CTA back in flow, then fade them in
    const isMd = window.matchMedia("(min-width: 768px)").matches;
    closeTl.set(header, {
      justifyContent: isMd ? "center" : "space-between",
      gap: isMd ? 80 : 0, // md:gap-20
    });
    if (fadeTargets.length) {
      closeTl.set(fadeTargets, {
        position: "relative",
        width: "auto",
        minWidth: 0,
        overflow: "visible",
        opacity: 0,
      });
      closeTl.to(fadeTargets, {
        opacity: 1,
        pointerEvents: "auto",
        duration: 0.25,
        ease: "power2.out",
        stagger: 0.04,
      });
    }

    return () => {
      closeTl.kill();
    };
  }, [menuOpen, drawerReady]);

  return (
    <AmbientAudioProvider audioSrc={audioSrc}>
      <header
        ref={headerRef}
        className="fixed top-4 left-4 right-4 z-[502] flex w-auto items-center justify-between bg-deep-forest px-5 py-3 md:left-1/2 md:right-auto md:w-fit md:-translate-x-1/2 md:justify-center md:gap-20 md:px-8"
      >
        <AmbientAudioButton
          buttonRef={soundRef}
          className="relative z-10 flex size-10 shrink-0 items-center justify-center transition-opacity hover:opacity-80 md:hidden"
        />

        <TransitionLink
          ref={logoRef}
          href="/"
          onClick={closeMenu}
          className="shrink-0 overflow-hidden"
        >
          <Image
            src={LOGO_SRC}
            alt="Thambalagama Estate"
            width={361}
            height={381}
            className="h-auto w-auto max-h-8"
            priority
          />
        </TransitionLink>

        <button
          ref={ctaRef}
          type="button"
          onClick={handleAvailability}
          className="hidden shrink-0 items-center gap-2 overflow-hidden font-secondary text-[14px] font-medium uppercase tracking-[0.2px] text-cream transition-opacity hover:opacity-80 md:inline-flex"
        >
          Check Availability
          <span aria-hidden>→</span>
        </button>

        <button
          ref={menuBtnRef}
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="main-navigation"
          onClick={() => setMenuOpen((open) => !open)}
          className="relative z-10 flex size-10 shrink-0 items-center justify-center"
        >
          <span
            className="relative flex size-8 items-center justify-center"
            aria-hidden
          >
            <span
              ref={line1Ref}
              className="absolute block h-1 w-8 bg-cream"
              style={{ transform: `translateY(-${LINE_Y}px)` }}
            />
            <span
              ref={line2Ref}
              className="absolute block h-1 w-8 bg-cream"
              style={{ transform: `translateY(${LINE_Y}px)` }}
            />
          </span>
        </button>
      </header>

      {/* Desktop: keep outside header so fixed positioning isn’t trapped by transforms */}
      <AmbientAudioButton
        className="fixed top-4 right-4 z-[502] hidden size-10 items-center justify-center transition-opacity hover:opacity-80 md:flex"
      />

      <HeaderMenuDrawer
        open={menuOpen}
        onClose={closeMenu}
        onCheckAvailability={handleAvailability}
        navLinks={NAV_LINKS}
        animRefs={{ panel: drawerPanelRef }}
        onReady={handleDrawerReady}
      />
    </AmbientAudioProvider>
  );
}

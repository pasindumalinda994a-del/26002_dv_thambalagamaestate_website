"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { logoutAction } from "@/app/actions/auth";
import { NAV_ITEMS } from "./constants";
import {
  BOOKING_STATUSES,
  type BookingStatus,
} from "@/lib/bookings/types";

function MenuIcon({ open }: { open: boolean }) {
  return (
    <span className="relative flex h-5 w-6 items-center justify-center" aria-hidden>
      <span
        className={[
          "absolute block h-0.5 w-6 bg-forest-green transition-transform duration-200",
          open ? "translate-y-0 rotate-45" : "-translate-y-[5px]",
        ].join(" ")}
      />
      <span
        className={[
          "absolute block h-0.5 w-6 bg-forest-green transition-transform duration-200",
          open ? "translate-y-0 -rotate-45" : "translate-y-[5px]",
        ].join(" ")}
      />
    </span>
  );
}

function resolveActiveStatus(
  pathname: string,
  statusParam: string | null,
): BookingStatus | "all" | null {
  if (pathname !== "/admin") return null;
  if (!statusParam || statusParam === "all") return "all";
  if ((BOOKING_STATUSES as readonly string[]).includes(statusParam)) {
    return statusParam as BookingStatus;
  }
  return "all";
}

function navHref(value: BookingStatus | "all") {
  return value === "all" ? "/admin" : `/admin?status=${value}`;
}

type AdminSidebarProps = {
  counts: Record<BookingStatus | "all", number>;
  mobileOpen: boolean;
  onMobileClose: () => void;
  onMobileOpen: () => void;
  pageTitle: string;
};

function SidebarNav({
  counts,
  activeStatus,
  onNavigate,
}: {
  counts: Record<BookingStatus | "all", number>;
  activeStatus: BookingStatus | "all" | null;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
      <p className="mb-3 px-3 font-secondary text-[11px] font-medium uppercase tracking-[0.14em] text-forest-green/50">
        Bookings
      </p>
      {NAV_ITEMS.map((item) => {
        const isActive = activeStatus === item.value;
        return (
          <Link
            key={item.value}
            href={navHref(item.value)}
            onClick={onNavigate}
            className={[
              "flex items-center justify-between px-3 py-2.5 font-secondary text-[13px] font-medium transition-colors",
              isActive
                ? "bg-forest-green text-cream"
                : "text-forest-green hover:bg-cream/80",
            ].join(" ")}
          >
            <span>{item.label}</span>
            <span
              className={[
                "min-w-[1.5rem] text-right text-[12px] font-semibold tabular-nums",
                isActive ? "text-cream/80" : "text-forest-green/50",
              ].join(" ")}
            >
              {counts[item.value]}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminMobileHeader({
  pageTitle,
  mobileOpen,
  onMobileOpen,
}: Pick<AdminSidebarProps, "pageTitle" | "mobileOpen" | "onMobileOpen">) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-forest-green/15 bg-white px-4 py-3 lg:hidden">
      <button
        type="button"
        aria-label={mobileOpen ? "Close menu" : "Open menu"}
        aria-expanded={mobileOpen}
        aria-controls="admin-sidebar"
        onClick={onMobileOpen}
        className="flex items-center justify-center p-1"
      >
        <MenuIcon open={mobileOpen} />
      </button>
      <p className="min-w-0 flex-1 truncate text-center font-secondary text-[13px] font-semibold text-forest-green">
        {pageTitle}
      </p>
      <div className="w-7" aria-hidden />
    </header>
  );
}

export function AdminSidebar({
  counts,
  mobileOpen,
  onMobileClose,
  pageTitle,
}: Omit<AdminSidebarProps, "onMobileOpen">) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeStatus = resolveActiveStatus(
    pathname,
    searchParams.get("status"),
  );

  const handleNavigate = useCallback(() => {
    onMobileClose();
  }, [onMobileClose]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onMobileClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen, onMobileClose]);

  useEffect(() => {
    onMobileClose();
  }, [pathname, searchParams, onMobileClose]);

  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-forest-green/30 lg:hidden"
          onClick={onMobileClose}
        />
      ) : null}

      <aside
        id="admin-sidebar"
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-[240px] flex-col border-r border-forest-green/15 bg-white transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="border-b border-forest-green/15 px-5 py-5">
          <p className="font-secondary text-[11px] font-medium uppercase tracking-[0.2em] text-forest-green/50">
            Thambalagama Estate
          </p>
          <p className="mt-1 font-secondary text-[13px] font-semibold text-forest-green lg:hidden">
            {pageTitle}
          </p>
        </div>

        <SidebarNav
          counts={counts}
          activeStatus={activeStatus}
          onNavigate={handleNavigate}
        />

        <div className="mt-auto border-t border-forest-green/15 p-4">
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full border border-forest-green/25 px-4 py-2.5 font-secondary text-[11px] font-semibold uppercase tracking-[0.14em] text-forest-green transition-colors hover:bg-forest-green hover:text-cream"
            >
              Log out
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}

export function useAdminMobileNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const pageTitle = useMemo(() => {
    if (pathname === "/admin") return "Bookings";
    if (pathname.startsWith("/admin/bookings/")) return "Booking detail";
    return "Admin";
  }, [pathname]);

  const onMobileOpen = useCallback(() => {
    setMobileOpen((open) => !open);
  }, []);

  const onMobileClose = useCallback(() => {
    setMobileOpen(false);
  }, []);

  return {
    mobileOpen,
    pageTitle,
    onMobileOpen,
    onMobileClose,
  };
}

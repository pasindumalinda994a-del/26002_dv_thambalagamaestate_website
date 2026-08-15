"use client";

import { Suspense } from "react";
import type { AdminCounts } from "./booking-counts";
import {
  AdminMobileHeader,
  AdminSidebar,
  useAdminMobileNav,
} from "./AdminSidebar";

export function AdminLayoutClient({
  counts,
  children,
}: {
  counts: AdminCounts;
  children: React.ReactNode;
}) {
  const { mobileOpen, pageTitle, onMobileOpen, onMobileClose } =
    useAdminMobileNav();

  return (
    <div className="flex min-h-dvh bg-cream font-secondary text-forest-green">
      <Suspense fallback={null}>
        <AdminSidebar
          counts={counts}
          mobileOpen={mobileOpen}
          onMobileClose={onMobileClose}
          pageTitle={pageTitle}
        />
      </Suspense>

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminMobileHeader
          pageTitle={pageTitle}
          mobileOpen={mobileOpen}
          onMobileOpen={onMobileOpen}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

"use client";

import { Link, NavGroup } from "@payloadcms/ui";
import { usePathname } from "next/navigation";

const HREF = "/admin";

/** Native-styled nav group pinned above Estate / Account collections. */
export function DashboardNavLink() {
  const pathname = usePathname();
  const isActive =
    pathname === HREF ||
    pathname === `${HREF}/` ||
    pathname?.startsWith(`${HREF}?`);

  const label = (
    <>
      {isActive ? <div className="nav__link-indicator" /> : null}
      <span className="nav__link-label">Dashboard</span>
    </>
  );

  return (
    <div className="te-nav-dash">
      <NavGroup label="Overview" isOpen>
        {isActive ? (
          <div className="nav__link" id="nav-dashboard">
            {label}
          </div>
        ) : (
          <Link
            className="nav__link"
            href={HREF}
            id="nav-dashboard"
            prefetch={false}
          >
            {label}
          </Link>
        )}
      </NavGroup>
    </div>
  );
}

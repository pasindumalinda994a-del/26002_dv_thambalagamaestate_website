"use client";

import { Gutter, Link } from "@payloadcms/ui";
import { useCallback, useEffect, useMemo, useState } from "react";
import { expandStayNights } from "@/lib/bookings/dates";
import type { BookingStatus } from "@/lib/bookings/types";
import { BOOKING_STATUSES } from "@/lib/bookings/types";
import {
  isBookingStatus,
  STATUS_LABELS,
  statusClassName,
} from "./status-styles";

type InquiryDoc = {
  id: string | number;
  fullName?: string | null;
  email?: string | null;
  checkIn?: string | null;
  checkOut?: string | null;
  status?: string | null;
  createdAt?: string | null;
};

type Counts = Record<BookingStatus, number>;

const emptyCounts = (): Counts => ({
  new: 0,
  contacted: 0,
  confirmed: 0,
  declined: 0,
});

function filteredInquiriesHref(status?: BookingStatus): string {
  if (!status) return "/admin/collections/bookings";
  const params = new URLSearchParams();
  params.set("where[status][equals]", status);
  return `/admin/collections/bookings?${params.toString()}`;
}

export function EstateDashboard() {
  const [docs, setDocs] = useState<InquiryDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("limit", "200");
      params.set("depth", "0");
      params.set("sort", "-createdAt");
      params.set("select[fullName]", "true");
      params.set("select[email]", "true");
      params.set("select[checkIn]", "true");
      params.set("select[checkOut]", "true");
      params.set("select[status]", "true");
      params.set("select[createdAt]", "true");

      const res = await fetch(`/api/bookings?${params.toString()}`, {
        credentials: "include",
        headers: { Accept: "application/json" },
      });
      if (!res.ok) {
        throw new Error(`Could not load inquiries (${res.status})`);
      }
      const json = (await res.json()) as { docs?: InquiryDoc[] };
      setDocs(json.docs ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const counts = useMemo(() => {
    const next = emptyCounts();
    for (const doc of docs) {
      if (isBookingStatus(doc.status)) next[doc.status] += 1;
    }
    return next;
  }, [docs]);

  const blockedNights = useMemo(() => {
    const keys = new Set<string>();
    for (const doc of docs) {
      if (doc.status !== "confirmed" || !doc.checkIn || !doc.checkOut) continue;
      for (const night of expandStayNights(doc.checkIn, doc.checkOut)) {
        keys.add(night);
      }
    }
    return keys.size;
  }, [docs]);

  const recent = docs.slice(0, 8);
  const newCount = counts.new;

  return (
    <Gutter className="dashboard te-dash">
      <header className="te-dash__header">
        <div>
          <h1 className="te-dash__title">Estate dashboard</h1>
          <p className="te-dash__subtitle">
            Triage booking inquiries, check occupancy, and jump into gallery or
            team accounts.
          </p>
        </div>
        <button
          type="button"
          className="te-cal__nav-btn"
          onClick={() => void load()}
          disabled={loading}
        >
          Refresh
        </button>
      </header>

      {error ? <p className="te-cal__error">{error}</p> : null}

      <section className="te-dash__kpis" aria-label="Inquiry counts">
        {BOOKING_STATUSES.map((status) => (
          <Link
            key={status}
            className={`te-kpi te-kpi--${status}`}
            href={filteredInquiriesHref(status)}
            prefetch={false}
          >
            <span className="te-kpi__label">{STATUS_LABELS[status]}</span>
            <span className="te-kpi__value">
              {loading ? "—" : counts[status]}
            </span>
          </Link>
        ))}
      </section>

      <section className="te-dash__attention">
        <div>
          <h2 className="te-dash__section-title">Needs attention</h2>
          <p className="te-dash__section-copy">
            {loading
              ? "Loading new requests…"
              : newCount === 0
                ? "No new inquiries right now."
                : `${newCount} new inquir${newCount === 1 ? "y" : "ies"} waiting to be contacted.`}
          </p>
        </div>
        <Link
          className="te-dash__cta"
          href={filteredInquiriesHref("new")}
          prefetch={false}
        >
          Review new
        </Link>
      </section>

      <div className="te-dash__grid">
        <section className="te-dash__panel">
          <div className="te-dash__panel-head">
            <h2 className="te-dash__section-title">Recent inquiries</h2>
            <Link
              className="te-dash__text-link"
              href="/admin/collections/bookings"
              prefetch={false}
            >
              View all
            </Link>
          </div>
          {recent.length === 0 && !loading ? (
            <p className="te-dash__empty">No inquiries yet.</p>
          ) : (
            <ul className="te-dash__list">
              {recent.map((doc) => {
                const status = isBookingStatus(doc.status) ? doc.status : null;
                return (
                  <li key={String(doc.id)}>
                    <Link
                      className="te-dash__row"
                      href={`/admin/collections/bookings/${doc.id}`}
                      prefetch={false}
                    >
                      <div className="te-dash__row-main">
                        <span className="te-dash__row-name">
                          {doc.fullName || "Guest"}
                        </span>
                        <span className="te-dash__row-meta">
                          {(doc.checkIn || "—") + " → " + (doc.checkOut || "—")}
                          {doc.email ? ` · ${doc.email}` : ""}
                        </span>
                      </div>
                      {status ? (
                        <span className={statusClassName(status)}>
                          {STATUS_LABELS[status]}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="te-dash__panel">
          <h2 className="te-dash__section-title">Occupancy</h2>
          <p className="te-dash__big">
            {loading ? "—" : blockedNights}
            <span className="te-dash__big-unit">
              {" "}
              night{blockedNights === 1 ? "" : "s"} blocked
            </span>
          </p>
          <p className="te-dash__section-copy">
            Confirmed stays lock nights on the public booking calendar.
          </p>
          <Link
            className="te-dash__text-link"
            href="/admin/collections/bookings"
            prefetch={false}
          >
            Open occupancy calendar
          </Link>
        </section>
      </div>

      <section className="te-dash__actions" aria-label="Quick links">
        <Link
          className="te-action-card"
          href="/admin/collections/bookings"
          prefetch={false}
        >
          <span className="te-action-card__title">Inquiries</span>
          <span className="te-action-card__copy">
            Find, filter, and confirm booking requests.
          </span>
        </Link>
        <Link
          className="te-action-card"
          href="/admin/collections/gallery-images"
          prefetch={false}
        >
          <span className="te-action-card__title">Gallery</span>
          <span className="te-action-card__copy">
            Upload and reorder public gallery photos.
          </span>
        </Link>
        <Link
          className="te-action-card"
          href="/admin/collections/users"
          prefetch={false}
        >
          <span className="te-action-card__title">Users</span>
          <span className="te-action-card__copy">
            Manage who can sign in to this CMS.
          </span>
        </Link>
      </section>
    </Gutter>
  );
}

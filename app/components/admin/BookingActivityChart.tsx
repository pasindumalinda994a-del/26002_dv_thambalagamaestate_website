"use client";

import { useId, useMemo, useState } from "react";
import type { BookingStatus } from "@/lib/bookings/types";
import type { ChartDayBucket } from "./booking-chart";
import { CHART_STACK } from "./booking-chart";
import { STATUS_LABELS } from "./constants";
import { formatDate } from "./format";

const STATUS_FILL: Record<BookingStatus, string> = {
  new: "fill-olive",
  contacted: "fill-tan",
  confirmed: "fill-forest-green",
  declined: "fill-chestnut",
};

const STATUS_SWATCH: Record<BookingStatus, string> = {
  new: "bg-olive",
  contacted: "bg-tan",
  confirmed: "bg-forest-green",
  declined: "bg-chestnut",
};

function niceMax(value: number) {
  if (value <= 1) return 1;
  if (value <= 4) return value;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  return Math.ceil(value / magnitude) * magnitude;
}

function axisLabel(iso: string) {
  const [, m, d] = iso.split("-").map(Number);
  const date = new Date(2000, (m ?? 1) - 1, d ?? 1);
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function BookingActivityChart({ series }: { series: ChartDayBucket[] }) {
  const titleId = useId();
  const descId = useId();
  const [hover, setHover] = useState<number | null>(null);

  const hasData = series.some((day) => day.total > 0);
  const maxTotal = useMemo(
    () => niceMax(Math.max(...series.map((day) => day.total), 0)),
    [series],
  );

  if (!hasData) {
    return (
      <p className="border border-forest-green/10 bg-white px-4 py-8 text-center font-secondary text-[13px] text-forest-green/50">
        No booking requests in the last 30 days.
      </p>
    );
  }

  const width = 720;
  const height = 240;
  const padL = 32;
  const padR = 10;
  const padT = 16;
  const padB = 32;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;
  const step = innerW / series.length;
  const barWidth = Math.max(step * 0.62, 4);
  const ticks = [0, maxTotal / 2, maxTotal];
  const labelEvery = 7;
  const hovered = hover === null ? null : series[hover];

  return (
    <div className="border border-forest-green/15 bg-white p-4 sm:p-5">
      <div className="relative">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-auto w-full"
          role="img"
          aria-labelledby={titleId}
          aria-describedby={descId}
          onMouseLeave={() => setHover(null)}
        >
          <title id={titleId}>Booking requests over the last 30 days</title>
          <desc id={descId}>
            Stacked bars of new, contacted, confirmed, and declined requests by
            day.
          </desc>

          {ticks.map((tick) => {
            const y = padT + innerH - (tick / maxTotal) * innerH;
            const label = Number.isInteger(tick) ? String(tick) : tick.toFixed(1);
            return (
              <g key={tick}>
                <line
                  x1={padL}
                  x2={width - padR}
                  y1={y}
                  y2={y}
                  className="stroke-forest-green/10"
                  strokeWidth={1}
                />
                <text
                  x={padL - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-forest-green/45 font-secondary"
                  fontSize={11}
                >
                  {label}
                </text>
              </g>
            );
          })}

          {series.map((day, index) => {
            const x = padL + index * step + (step - barWidth) / 2;
            let y = padT + innerH;
            const isHovered = hover === index;

            return (
              <g
                key={day.date}
                onMouseEnter={() => setHover(index)}
                onFocus={() => setHover(index)}
                className="cursor-pointer"
              >
                <rect
                  x={padL + index * step}
                  y={padT}
                  width={step}
                  height={innerH}
                  className="fill-transparent"
                />
                {CHART_STACK.map((status) => {
                  const count = day[status];
                  if (count <= 0) return null;
                  const h = (count / maxTotal) * innerH;
                  y -= h;
                  return (
                    <rect
                      key={status}
                      x={x}
                      y={y}
                      width={barWidth}
                      height={h}
                      className={STATUS_FILL[status]}
                      opacity={hover === null || isHovered ? 1 : 0.35}
                    />
                  );
                })}
                {index % labelEvery === 0 || index === series.length - 1 ? (
                  <text
                    x={x + barWidth / 2}
                    y={height - 10}
                    textAnchor="middle"
                    className="fill-forest-green/50 font-secondary"
                    fontSize={11}
                  >
                    {axisLabel(day.date)}
                  </text>
                ) : null}
              </g>
            );
          })}
        </svg>

        {hovered ? (
          <div
            className="pointer-events-none absolute top-2 right-2 min-w-40 border border-forest-green/15 bg-cream px-3 py-2 font-secondary text-[12px] text-forest-green shadow-sm sm:right-3"
            role="status"
          >
            <p className="font-semibold">{formatDate(hovered.date)}</p>
            <ul className="mt-1.5 space-y-0.5">
              {CHART_STACK.map((status) => (
                <li
                  key={status}
                  className="flex items-center justify-between gap-4"
                >
                  <span className="text-forest-green/70">
                    {STATUS_LABELS[status]}
                  </span>
                  <span className="tabular-nums font-semibold">
                    {hovered[status]}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-1.5 flex justify-between border-t border-forest-green/10 pt-1.5 font-semibold">
              <span>Total</span>
              <span className="tabular-nums">{hovered.total}</span>
            </p>
          </div>
        ) : null}
      </div>

      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
        {CHART_STACK.map((status) => (
          <li
            key={status}
            className="flex items-center gap-2 font-secondary text-[11px] font-medium uppercase tracking-[0.12em] text-forest-green/70"
          >
            <span
              className={["h-2 w-2 shrink-0", STATUS_SWATCH[status]].join(" ")}
              aria-hidden
            />
            {STATUS_LABELS[status]}
          </li>
        ))}
      </ul>
    </div>
  );
}

"use client";

import type { DefaultCellComponentProps } from "payload";
import {
  isBookingStatus,
  STATUS_LABELS,
  statusClassName,
} from "./status-styles";

export function StatusCell({ cellData }: DefaultCellComponentProps) {
  if (!isBookingStatus(cellData)) {
    return <span className="te-status te-status--unknown">{String(cellData ?? "—")}</span>;
  }

  return (
    <span className={statusClassName(cellData)}>{STATUS_LABELS[cellData]}</span>
  );
}

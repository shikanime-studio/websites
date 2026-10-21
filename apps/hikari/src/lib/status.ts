import type { CommissionStatus } from "./hikari";

/** Astryx Badge variant per lifecycle stage. */
export const STATUS_BADGE_VARIANT = {
  requested: "gray",
  accepted: "blue",
  scheduled: "yellow",
  completed: "purple",
  delivered: "green",
} as const satisfies Record<CommissionStatus, string>;

export function statusVariant(status: CommissionStatus) {
  return STATUS_BADGE_VARIANT[status];
}

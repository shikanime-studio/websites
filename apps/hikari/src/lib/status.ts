import type { CommissionStatus } from "./hikari";

/** Astryx Badge variant per lifecycle stage, tuned to candy colours. */
export const STATUS_BADGE_VARIANT = {
  requested: "purple",
  accepted: "blue",
  scheduled: "yellow",
  completed: "orange",
  delivered: "green",
} as const satisfies Record<CommissionStatus, string>;

export function statusVariant(status: CommissionStatus) {
  return STATUS_BADGE_VARIANT[status];
}

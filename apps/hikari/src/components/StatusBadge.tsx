import type { CommissionStatus } from "../lib/hikari";
import { Badge } from "@astryxdesign/core/Badge";
import { useI18n } from "../i18n/useI18n";

const STATUS_VARIANTS = {
  requested: "neutral",
  accepted: "info",
  scheduled: "warning",
  completed: "cyan",
  delivered: "success",
} as const;

export function StatusBadge({ status }: { status: CommissionStatus }) {
  const { t } = useI18n();
  return (
    <Badge variant={STATUS_VARIANTS[status]} label={t(`status.${status}`)} />
  );
}

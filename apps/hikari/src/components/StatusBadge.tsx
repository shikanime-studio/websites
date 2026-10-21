import type { CommissionStatus } from "../lib/hikari";
import { Badge } from "@astryxdesign/core/Badge";
import { useI18n } from "../i18n/useI18n";
import { statusVariant } from "../lib/status";

export function StatusBadge({ status }: { status: CommissionStatus }) {
  const { t } = useI18n();
  return (
    <Badge label={t(`status.${status}`)} variant={statusVariant(status)} />
  );
}

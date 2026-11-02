import type { CommissionStatus } from "../lib/hikari";
import { Badge } from "@astryxdesign/core/Badge";
import { useTranslator } from "@astryxdesign/core/i18n";
import { statusVariant } from "../lib/status";

export function StatusBadge({ status }: { status: CommissionStatus }) {
  const t = useTranslator();
  return (
    <Badge label={t(`status.${status}`)} variant={statusVariant(status)} />
  );
}

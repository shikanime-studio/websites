import type { Commission } from "../lib/types";
import { Card } from "@astryxdesign/core/Card";
import { Link } from "@tanstack/react-router";
import { useI18n } from "../i18n/useI18n";
import { formatRelative, formatShootDate } from "../lib/format";
import { COMMISSION_STATUSES } from "../lib/hikari";
import { ArrowUpRight, CalendarIcon, MapPin } from "./icons";
import { StatusBadge } from "./StatusBadge";

export function CommissionCard({ commission }: { commission: Commission }) {
  const { t, lang } = useI18n();
  const currentIndex = COMMISSION_STATUSES.indexOf(commission.status);

  return (
    <Link
      className="group block h-full rounded-[var(--radius-container)] focus-visible:outline-none"
      params={{ id: String(commission.id) }}
      to="/commissions/$id"
    >
      <Card
        className="h-full transition-transform duration-300 group-hover:-translate-y-0.5 group-focus-visible:ring-2 group-focus-visible:ring-[var(--hk-accent)]"
        padding={5}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="hk-eyebrow text-ink-faint">
            #{String(commission.id).padStart(3, "0")}
          </span>
          <StatusBadge status={commission.status} />
        </div>

        <h3 className="hk-display text-ink mt-3 line-clamp-2 text-[18.5px] leading-[1.15]">
          {commission.title}
        </h3>
        <p className="text-ink-soft mt-1.5 line-clamp-1 text-[12.5px]">
          {commission.characterName || t("detail.characterTbd")}
        </p>

        <dl className="text-ink-soft mt-4 flex flex-col gap-1.5 text-[12px]">
          <div className="flex items-center gap-2">
            <CalendarIcon className="text-ink-faint" size={14} />
            <span>
              {commission.shootingDate
                ? formatShootDate(commission.shootingDate, lang)
                : t("home.dateTbd")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="text-ink-faint" size={14} />
            <span className="line-clamp-1">
              {commission.locationName || t("detail.locationTbd")}
            </span>
          </div>
        </dl>

        <div aria-hidden="true" className="mt-5 flex items-center gap-1">
          {COMMISSION_STATUSES.map((status, index) => (
            <span
              className="h-1 flex-1 rounded-full transition-colors"
              key={status}
              style={{
                background:
                  index === currentIndex
                    ? "var(--hk-signal)"
                    : index < currentIndex
                      ? "var(--hk-accent)"
                      : "var(--hk-line)",
              }}
            />
          ))}
        </div>

        <div className="border-hairline text-ink-faint mt-4 flex items-center justify-between border-t pt-3 text-[11px]">
          <span>
            {t("home.updated", {
              date: formatRelative(commission.updatedAt, lang),
            })}
          </span>
          <ArrowUpRight
            className="text-ink-faint transition-colors group-hover:text-ink"
            size={14}
          />
        </div>
      </Card>
    </Link>
  );
}

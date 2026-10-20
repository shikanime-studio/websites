import type { Commission } from "../lib/types";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { StatusBadge } from "../components/StatusBadge";
import { useSession } from "../hooks/useSession";
import { useI18n } from "../i18n/useI18n";
import { COMMISSION_STATUSES } from "../lib/hikari";

export const Route = createFileRoute("/")({
  component: DashboardPage,
});

async function fetchCommissions(): Promise<Commission[]> {
  const res = await fetch("/api/commissions");
  if (!res.ok) {
    return [];
  }
  return (await res.json()) as Commission[];
}

function DashboardPage() {
  const session = useSession();
  const { t } = useI18n();

  if (session.isLoading) {
    return (
      <div className="text-secondary/60 py-20 text-center">
        {t("home.loading")}
      </div>
    );
  }
  if (!session.data) {
    return (
      <section className="flex flex-col items-center gap-6 py-20 text-center">
        <h1 className="text-secondary text-5xl leading-[1.05] font-black tracking-tight sm:text-6xl">
          {t("home.hero")}
        </h1>
        <p className="text-secondary/80 max-w-xl text-lg leading-relaxed font-semibold">
          {t("home.heroBody")}
        </p>
        <p className="text-secondary/60 text-sm">{t("home.signInHint")}</p>
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-8 py-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-secondary text-3xl font-black tracking-tight">
            {t("home.title")}
          </h1>
          <p className="text-secondary/60 text-sm">{t("home.subtitle")}</p>
        </div>
        <Link
          to="/commissions/new"
          className="bg-accent text-secondary inline-flex items-center rounded-full px-4 py-2 text-sm font-bold transition-opacity hover:opacity-80"
        >
          {t("nav.newCommission")}
        </Link>
      </header>
      <CommissionsBoard />
    </div>
  );
}

function CommissionsBoard() {
  const { t } = useI18n();
  const { data: commissions, isLoading } = useQuery({
    queryKey: ["commissions"],
    queryFn: fetchCommissions,
  });

  if (isLoading) {
    return (
      <div className="text-secondary/60 py-10 text-center">
        {t("home.loading")}
      </div>
    );
  }

  if (!commissions || commissions.length === 0) {
    return (
      <EmptyState
        title={t("home.emptyTitle")}
        description={t("home.emptyBody")}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {COMMISSION_STATUSES.map((status) => {
        const items = commissions.filter((c) => c.status === status);
        return (
          <section
            key={status}
            className="bg-surface border-border flex flex-col gap-3 rounded-2xl border p-4"
          >
            <h2 className="text-secondary/70 flex items-center justify-between text-xs font-bold tracking-widest uppercase">
              {t(`status.${status}`)}
              <span className="bg-body text-secondary/60 rounded-full px-2 py-0.5 text-xs font-bold">
                {items.length}
              </span>
            </h2>
            {items.length === 0 ? (
              <p className="text-secondary/40 py-4 text-center text-xs">
                {t("home.nothingHere")}
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {items.map((commission) => (
                  <li key={commission.id}>
                    <Link
                      to="/commissions/$id"
                      params={{ id: String(commission.id) }}
                      className="bg-body border-border hover:border-accent/50 block rounded-xl border p-3 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-secondary font-semibold">
                          {commission.title}
                        </span>
                        <StatusBadge status={commission.status} />
                      </div>
                      <p className="text-secondary/60 mt-1 text-xs">
                        {commission.shootingDate ?? t("home.dateTbd")}
                        {commission.locationName
                          ? ` · ${commission.locationName}`
                          : ""}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}

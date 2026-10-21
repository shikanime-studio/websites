import type {CommissionStatus} from "../lib/hikari";
import { Banner } from "@astryxdesign/core/Banner";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { TextInput } from "@astryxdesign/core/TextInput";
import { useAtomRefresh, useAtomValue } from "@effect/atom-react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { getOrElse, isFailure, isInitial } from "effect/reactivity/AsyncResult";
import { useState } from "react";
import { CommissionCard } from "../components/CommissionCard";
import { Camera, HikariMark, Plus } from "../components/icons";
import { LandingPage } from "../components/landing/LandingPage";

import { useI18n } from "../i18n/useI18n";
import { commissionsAtom, sessionAtom } from "../lib/atoms";
import { COMMISSION_STATUSES  } from "../lib/hikari";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const sessionResult = useAtomValue(sessionAtom);
  const { t } = useI18n();

  if (isInitial(sessionResult)) {
    return (
      <div className="hk-shell flex min-h-[62vh] flex-col items-center justify-center gap-3">
        <span className="hk-live-dot" style={{ opacity: 0.9 }}>
          <HikariMark />
        </span>
        <span className="hk-eyebrow">{t("home.loading")}</span>
      </div>
    );
  }

  if (!getOrElse(sessionResult, () => null)) {
    return <LandingPage />;
  }

  return <CommissionsDashboard />;
}

type Filter = "all" | CommissionStatus;

function CommissionsDashboard() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const result = useAtomValue(commissionsAtom);
  const refetch = useAtomRefresh(commissionsAtom);
  const commissions = getOrElse(result, () => []);
  const normalizedQuery = query.trim().toLowerCase();
  const filtered = commissions.filter((commission) => {
    const matchesStatus = filter === "all" || commission.status === filter;
    if (!matchesStatus) {
      return false;
    }
    if (normalizedQuery.length === 0) {
      return true;
    }
    return [commission.title, commission.characterName, commission.locationName]
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery);
  });

  const counts = COMMISSION_STATUSES.reduce<Record<CommissionStatus, number>>(
    (accumulator, status) => {
      accumulator[status] = commissions.filter(
        (commission) => commission.status === status,
      ).length;
      return accumulator;
    },
    {
      requested: 0,
      accepted: 0,
      scheduled: 0,
      completed: 0,
      delivered: 0,
    },
  );

  function goToNewCommission() {
    navigate({ to: "/commissions/new" }).catch(() => {});
  }

  return (
    <div className="hk-shell py-10 md:py-14">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <h1 className="hk-display text-[clamp(2rem,4vw,2.85rem)]">
            {t("home.title")}
          </h1>
          <p className="text-ink-soft mt-2 text-[14px]">
            {t("home.subtitle")}
          </p>
        </div>
        <Button
          icon={<Plus />}
          label={t("nav.newCommission")}
          onClick={goToNewCommission}
          variant="primary"
        />
      </header>

      <div className="-mx-5 mt-8 flex items-center gap-2 overflow-x-auto px-5 py-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
        <Button
          className="shrink-0"
          label={`${t("home.filterAll")} · ${String(commissions.length)}`}
          onClick={() => {
            setFilter("all");
          }}
          size="sm"
          variant={filter === "all" ? "primary" : "secondary"}
        />
        {COMMISSION_STATUSES.map((status) => (
          <Button
            className="shrink-0"
            key={status}
            label={`${t(`status.${status}`)} · ${String(counts[status])}`}
            onClick={() => {
              setFilter(filter === status ? "all" : status);
            }}
            size="sm"
            variant={filter === status ? "primary" : "secondary"}
          />
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="w-full sm:max-w-xs">
          <TextInput
            isLabelHidden
            label={t("home.search")}
            onChange={(value) => {
              setQuery(value);
            }}
            placeholder={t("home.search")}
            value={query}
          />
        </div>
        <p className="text-ink-faint text-[12px]">
          {t("home.showing", { count: String(filtered.length) })}
        </p>
      </div>

      {isFailure(result) ? (
        <div className="mt-6">
          <Banner
            description={t("home.errorBody")}
            endContent={
              <Button
                className="hk-btn-outline"
                label={t("home.retry")}
                onClick={refetch}
                size="sm"
                variant="secondary"
              />
            }
            status="error"
            title={t("home.errorTitle")}
          />
        </div>
      ) : null}

      {isInitial(result) ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <Card className="h-[248px] animate-pulse" key={index} padding={5}>
              <span className="sr-only">{t("home.loading")}</span>
            </Card>
          ))}
        </div>
      ) : null}

      {!isInitial(result) && !isFailure(result) && commissions.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            actions={
              <Button
                icon={<Plus />}
                label={t("home.newCommissionCta")}
                onClick={goToNewCommission}
                variant="primary"
              />
            }
            description={t("home.emptyBody")}
            headingLevel={2}
            icon={
              <span
                className="flex size-14 items-center justify-center rounded-full"
                style={{ background: "var(--hk-accent-soft)", color: "var(--hk-accent-ink)" }}
              >
                <Camera size={24} />
              </span>
            }
            title={t("home.emptyTitle")}
          />
        </div>
      ) : null}

      {!isInitial(result) &&
      !isFailure(result) &&
      commissions.length > 0 &&
      filtered.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            actions={
              <Button
                className="hk-btn-outline"
                label={t("home.clearSearch")}
                onClick={() => {
                  setQuery("");
                  setFilter("all");
                }}
                variant="secondary"
              />
            }
            description={t("home.searchEmpty")}
            headingLevel={2}
            title={t("home.noResultsTitle")}
          />
        </div>
      ) : null}

      {!isInitial(result) && !isFailure(result) && filtered.length > 0 ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((commission) => (
            <CommissionCard commission={commission} key={commission.id} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

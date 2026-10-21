import type { Commission, PhotoListItem } from "../../lib/types";
import { Banner } from "@astryxdesign/core/Banner";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { FileInput } from "@astryxdesign/core/FileInput";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  CalendarIcon,
  Camera,
  Check,
  MapPin,
  Sparkle,
} from "../../components/icons";
import { SignInButton } from "../../components/SignInButton";
import { StatusBadge } from "../../components/StatusBadge";
import { useSession } from "../../hooks/useSession";
import { useI18n } from "../../i18n/useI18n";
import { formatShootDate, formatTimestamp } from "../../lib/format";
import {
  calendarEventUrl,
  COMMISSION_STATUSES,
  mapEmbedUrl,
  mapLinkUrl,
  nextStatuses,
} from "../../lib/hikari";

export const Route = createFileRoute("/commissions/$id")({
  component: CommissionDetailPage,
});

type CommissionDetail = Commission & { photos: PhotoListItem[] };

async function fetchCommission(id: string): Promise<CommissionDetail> {
  const res = await fetch(`/api/commissions/${id}`);
  if (!res.ok) {
    throw new Error(`Commission request failed: ${String(res.status)}`);
  }
  return (await res.json()) as CommissionDetail;
}

function CommissionDetailPage() {
  const { id } = Route.useParams();
  const session = useSession();
  const { t } = useI18n();
  const {
    data: commission,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["commission", id],
    queryFn: () => fetchCommission(id),
    enabled: Boolean(session.data),
    retry: 1,
  });

  if (!session.data) {
    return (
      <div className="hk-shell py-16">
        <EmptyState
          actions={<SignInButton size="sm" />}
          description=""
          icon={<Camera />}
          title={t("detail.signInToView")}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="hk-shell py-12">
        <Card className="h-40 animate-pulse" padding={0}>
          <span className="sr-only">{t("home.loading")}</span>
        </Card>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <Card className="h-72 animate-pulse" padding={0} />
          <Card className="h-72 animate-pulse" padding={0} />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="hk-shell py-16">
        <EmptyState
          actions={
            <Button
              label={t("home.retry")}
              onClick={() => {
                refetch().catch(() => {});
              }}
              variant="secondary"
            />
          }
          description={t("detail.errorBody")}
          headingLevel={1}
          title={t("detail.errorTitle")}
        />
      </div>
    );
  }

  if (!commission) {
    return (
      <div className="hk-shell py-16">
        <EmptyState
          actions={
            <Button
              href="/"
              icon={<ArrowLeft />}
              label={t("detail.allCommissions")}
              variant="secondary"
            />
          }
          description={t("detail.notFoundBody")}
          headingLevel={1}
          title={t("detail.notFound")}
        />
      </div>
    );
  }

  return <CommissionDetailView commission={commission} />;
}

function CommissionDetailView({ commission }: { commission: CommissionDetail }) {
  const queryClient = useQueryClient();
  const { t, lang } = useI18n();
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function changeStatus(next: string) {
    setBusy(true);
    setActionError(null);
    try {
      const res = await fetch(`/api/commissions/${String(commission.id)}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        const payload = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        setActionError(payload?.error ?? t("detail.statusChangeFailed"));
        return;
      }
      await queryClient.invalidateQueries({
        queryKey: ["commission", String(commission.id)],
      });
      await queryClient.invalidateQueries({ queryKey: ["commissions"] });
    } finally {
      setBusy(false);
    }
  }

  async function uploadPhotos(input: File | File[] | null) {
    const files = input ? (Array.isArray(input) ? input : [input]) : [];
    if (files.length === 0) {
      return;
    }
    setBusy(true);
    setActionError(null);
    try {
      for (const file of files) {
        const form = new FormData();
        form.append("file", file);
        const res = await fetch(
          `/api/commissions/${String(commission.id)}/photos`,
          { method: "POST", body: form },
        );
        if (!res.ok) {
          const payload = (await res.json().catch(() => null)) as {
            error?: string;
          } | null;
          setActionError(payload?.error ?? t("detail.uploadFailed"));
          return;
        }
      }
      await queryClient.invalidateQueries({
        queryKey: ["commission", String(commission.id)],
      });
      await queryClient.invalidateQueries({ queryKey: ["commissions"] });
    } finally {
      setBusy(false);
    }
  }

  const calendarUrl = commission.shootingDate
    ? calendarEventUrl({
        title: commission.title,
        shootingDate: commission.shootingDate,
        locationName: commission.locationName,
        details: commission.characterName,
      })
    : null;

  const currentStatusIndex = COMMISSION_STATUSES.indexOf(commission.status);
  const followingStatuses = nextStatuses(commission.status);

  return (
    <div className="hk-shell py-8 md:py-12">
      <Link
        className="text-ink-soft hover:text-ink inline-flex items-center gap-1.5 text-[12.5px] font-medium transition-colors"
        to="/"
      >
        <ArrowLeft size={14} />
        {t("detail.allCommissions")}
      </Link>

      <header className="mt-5 flex flex-wrap items-start justify-between gap-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="hk-display text-[clamp(1.9rem,4vw,2.7rem)]">
              {commission.title}
            </h1>
            <StatusBadge status={commission.status} />
          </div>
          <div className="text-ink-soft mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12.5px]">
            <span className="flex items-center gap-1.5">
              <Sparkle className="text-ink-faint" size={14} />
              {commission.characterName || t("detail.characterTbd")}
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarIcon className="text-ink-faint" size={14} />
              {commission.shootingDate
                ? formatShootDate(commission.shootingDate, lang, "long")
                : t("detail.dateTbd")}
            </span>
            {commission.locationName ? (
              <span className="flex items-center gap-1.5">
                <MapPin className="text-ink-faint" size={14} />
                {commission.locationName}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 lg:ml-auto">
          {commission.locationQuery ? (
            <Button
              href={mapLinkUrl(commission.locationQuery)}
              icon={<MapPin />}
              label={t("detail.openMaps")}
              className="hk-btn-outline"
              rel="noopener noreferrer"
              size="sm"
              target="_blank"
              variant="secondary"
            />
          ) : null}
          {calendarUrl ? (
            <Button
              href={calendarUrl}
              icon={<CalendarIcon />}
              label={t("detail.addToCalendar")}
              className="hk-btn-outline"
              rel="noopener noreferrer"
              size="sm"
              target="_blank"
              variant="secondary"
            />
          ) : null}
        </div>
      </header>

      <div className="mt-8 grid gap-5 lg:grid-cols-[1.55fr_1fr] lg:items-start">
        <div className="flex flex-col gap-5">
          {commission.description ? (
            <Card padding={6}>
              <p className="hk-eyebrow">{t("detail.brief")}</p>
              <p className="text-ink mt-3 text-[13.5px] leading-[1.7] whitespace-pre-wrap">
                {commission.description}
              </p>
            </Card>
          ) : null}

          <Card padding={6}>
            <div className="flex items-center justify-between gap-3">
              <p className="hk-eyebrow">
                {t("detail.photos")} · {commission.photos.length}
              </p>
            </div>

            {commission.deliveryReadyAt ? (
              <p
                className="mt-4 flex items-center gap-2 rounded-xl px-3 py-2 text-[12.5px] font-medium"
                style={{
                  background: "var(--hk-success-soft)",
                  color: "var(--hk-success)",
                }}
              >
                <Check size={14} />
                {t("detail.deliveryReady")}
              </p>
            ) : null}

            {commission.photos.length === 0 ? (
              <p
                className="text-ink-soft mt-4 rounded-xl border border-dashed px-4 py-8 text-center text-[12.5px]"
                style={{ borderColor: "var(--hk-line-strong)" }}
              >
                {t("detail.noPhotos")}
              </p>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {commission.photos.map((photo) => (
                  <figure
                    className="bg-paper-muted border-hairline overflow-hidden rounded-xl border"
                    key={photo.id}
                  >
                    <img
                      alt={t("detail.photoAlt", { id: String(photo.id) })}
                      className="aspect-square w-full object-cover"
                      loading="lazy"
                      src={`/api/commissions/${String(commission.id)}/photos/${String(photo.id)}`}
                    />
                    <figcaption className="text-ink-faint px-2 py-1.5 text-[10.5px]">
                      {formatTimestamp(photo.createdAt, lang)}
                    </figcaption>
                  </figure>
                ))}
              </div>
            )}

            <div className="mt-5">
              <FileInput
                accept="image/jpeg,image/png,image/webp,image/avif"
                changeAction={uploadPhotos}
                description={t("detail.uploadHint")}
                isDisabled={busy}
                isLoading={busy}
                isMultiple
                label={t("detail.uploadCta")}
                mode="dropzone"
                onChange={() => {}}
                value={null}
              />
            </div>

            {actionError ? (
              <div className="mt-4">
                <Banner status="error" title={actionError} />
              </div>
            ) : null}
          </Card>
        </div>

        <aside className="flex flex-col gap-5 lg:sticky lg:top-24">
          <Card padding={6}>
            <div className="flex items-center justify-between">
              <p className="hk-eyebrow">{t("detail.progress")}</p>
              <span className="text-ink-faint text-[11px] font-medium">
                {currentStatusIndex + 1}/5
              </span>
            </div>

            <ol className="mt-4">
              {COMMISSION_STATUSES.map((status, index) => {
                const done = index < currentStatusIndex;
                const current = index === currentStatusIndex;
                return (
                  <li className="flex gap-3" key={status}>
                    <div className="flex flex-col items-center">
                      <span
                        className="flex size-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold"
                        style={{
                          borderColor:
                            done || current
                              ? "transparent"
                              : "var(--hk-line-strong)",
                          background: done
                            ? "var(--hk-accent)"
                            : current
                              ? "var(--hk-signal)"
                              : "transparent",
                          color: done
                            ? "#241c18"
                            : current
                              ? "#241c18"
                              : "var(--hk-ink-faint)",
                        }}
                      >
                        {done ? (
                          <Check size={11} />
                        ) : current ? (
                          <span className="size-1.5 rounded-full bg-current" />
                        ) : (
                          index + 1
                        )}
                      </span>
                      {index < COMMISSION_STATUSES.length - 1 ? (
                        <span
                          className="my-1 w-px flex-1"
                          style={{
                            background: done
                              ? "var(--hk-accent)"
                              : "var(--hk-line)",
                            minHeight: 18,
                          }}
                        />
                      ) : null}
                    </div>
                    <div
                      className={
                        index === COMMISSION_STATUSES.length - 1 ? "pb-0" : "pb-3"
                      }
                    >
                      <p
                        className={`text-[12.5px] ${
                          current
                            ? "text-ink font-semibold"
                            : done
                              ? "text-ink-soft"
                              : "text-ink-faint"
                        }`}
                      >
                        {t(`status.${status}`)}
                      </p>
                      {current ? (
                        <p className="text-ink-faint mt-0.5 text-[11px] leading-snug">
                          {t(`landing.stage.${status}Body`)}
                        </p>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ol>

            <div className="border-hairline mt-5 border-t pt-4">
              <p className="hk-eyebrow">{t("detail.nextStep")}</p>
              {followingStatuses.length === 0 ? (
                <p className="text-ink-soft mt-2 text-[12.5px]">
                  {t("status.final")}
                </p>
              ) : (
                <div className="mt-2.5 flex flex-col gap-2">
                  {followingStatuses.map((next, index) => (
                    <Button
                      isLoading={busy}
                      key={next}
                      label={t("status.moveToNext", {
                        status: t(`status.${next}`),
                      })}
                      onClick={() => {
                        changeStatus(next).catch(() => {});
                      }}
                      size="sm"
                      variant={index === 0 ? "primary" : "secondary"}
                      width="100%"
                    />
                  ))}
                </div>
              )}
            </div>
          </Card>

          {commission.locationQuery ? (
            <Card className="overflow-hidden p-0" padding={0}>
              <div className="px-6 pt-6 pb-3">
                <p className="hk-eyebrow">{t("detail.location")}</p>
                <p className="text-ink mt-2 text-[13px] font-semibold">
                  {commission.locationName}
                </p>
              </div>
              <iframe
                className="border-hairline h-52 w-full border-t"
                loading="lazy"
                src={mapEmbedUrl(commission.locationQuery)}
                title={t("detail.location")}
              />
            </Card>
          ) : null}

          <Card padding={6}>
            <p className="hk-eyebrow">{t("detail.calendar")}</p>
            {commission.shootingDate ? (
              <p className="text-ink mt-2 text-[13px] font-medium">
                {formatShootDate(commission.shootingDate, lang, "long")}
              </p>
            ) : (
              <p className="text-ink-soft mt-2 text-[12.5px]">
                {t("detail.dateTbd")}
              </p>
            )}
          </Card>
        </aside>
      </div>
    </div>
  );
}

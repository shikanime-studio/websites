import type { CommissionDetail } from "../../lib/types";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { FileInput } from "@astryxdesign/core/FileInput";
import { useLocale, useTranslator } from "@astryxdesign/core/i18n";
import { useToast } from "@astryxdesign/core/Toast";
import { useAtomRefresh, useAtomSuspense, useAtomValue } from "@effect/atom-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Cause, Effect, Exit } from "effect";
import { getOrElse, isFailure } from "effect/reactivity/AsyncResult";
import { Suspense, useState } from "react";
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
import {
  ApiError,
  changeCommissionStatus,
  uploadCommissionPhoto,
} from "../../lib/api";
import { commissionAtom, commissionsAtom, sessionAtom } from "../../lib/atoms";
import { SITE } from "../../lib/config";
import { formatShootDate, formatTimestamp } from "../../lib/format";
import {

  COMMISSION_STATUSES,
  mapEmbedUrl,
  mapLinkUrl,
  nextStatuses,
} from "../../lib/hikari";
import { parseInvitees, shareCalendarUrl } from "../../lib/sharing";

export const Route = createFileRoute("/commissions/$id")({
  component: CommissionDetailPage,
});


function CommissionDetailPage() {
  const { id } = Route.useParams();
  const session = getOrElse(useAtomValue(sessionAtom), () => null);
  const t = useTranslator();


  if (!session) {
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

  return (
    <Suspense fallback={<DetailSkeleton t={t} />}>
      <CommissionDetailView id={id} t={t} />
    </Suspense>
  );
}

function DetailSkeleton({ t }: { t: (key: any) => string }) {
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

function CommissionDetailView({
  id,
  t,
}: {
  id: string;
  t: (key: any) => string;
}) {
  const refresh = useAtomRefresh(commissionAtom(id));
  const result = useAtomSuspense(commissionAtom(id), { includeFailure: true });
  if (isFailure(result)) {
    return (
      <div className="hk-shell py-16">
        <EmptyState
          actions={
            <Button
              label={t("home.retry")}
              onClick={refresh}
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

  const commission = result.value;

  return <CommissionDetailBody commission={commission} />;
}

function CommissionDetailBody({ commission }: { commission: CommissionDetail }) {
  const refreshCommission = useAtomRefresh(commissionAtom(String(commission.id)));
  const refreshCommissions = useAtomRefresh(commissionsAtom);
  const t = useTranslator();
  const lang = useLocale();
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  async function changeStatus(next: string) {
    setBusy(true);
    const exit = await Effect.runPromiseExit(
      changeCommissionStatus(commission.id, next).pipe(
        Effect.ensuring(Effect.sync(() => setBusy(false))),
      ),
    );
    if (Exit.isFailure(exit)) {
      const error = Cause.squash(exit.cause);
      toast({
        body: error instanceof ApiError
          ? error.message
          : t("detail.statusChangeFailed"),
        type: "error",
      });
      return;
    }
    toast({ body: t("detail.statusUpdated"), type: "info" });
    refreshCommission();
    refreshCommissions();
  }

  async function uploadPhotos(input: File | File[] | null) {
    const files = input ? (Array.isArray(input) ? input : [input]) : [];
    if (files.length === 0) {
      return;
    }
    setBusy(true);
    const program = Effect.gen(function* () {
      for (const file of files) {
        yield* uploadCommissionPhoto(commission.id, file);
      }
      yield* Effect.sync(() => {
        refreshCommission();
        refreshCommissions();
      });
    }).pipe(Effect.ensuring(Effect.sync(() => setBusy(false))));

    const exit = await Effect.runPromiseExit(program);
    if (Exit.isFailure(exit)) {
      const error = Cause.squash(exit.cause);
      toast({
        body: error instanceof ApiError ? error.message : t("detail.uploadFailed"),
        type: "error",
      });
      return;
    }
    toast({ body: t("detail.uploaded"), type: "info" });
  }

  const invitees = parseInvitees(commission.invitees ?? "[]");
  const shareUrl = `${SITE}/s/${commission.shareToken}`;
  const calendarUrl = commission.shootingDate
    ? shareCalendarUrl({
        title: commission.title,
        details: commission.description || commission.characterName,
        location: commission.locationName || commission.locationQuery,
        shootingDate: commission.shootingDate,
        timeZone: commission.timezone ?? "Europe/Paris",
        invitees,
        url: shareUrl,
      })
    : null;
  const [copied, setCopied] = useState(false);

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
            <p className="hk-eyebrow">Share with the shoot</p>
            <p className="text-ink-soft mt-2 text-[12px] leading-snug">
              A private recap with the date, place, crew and every preview as
              it lands. No account needed.
            </p>
            <div className="mt-3 flex flex-col gap-2">
              <input
                className="border-hairline text-ink-soft w-full rounded-lg border bg-transparent px-3 py-2 text-[11.5px]"
                readOnly
                value={shareUrl}
              />
              <div className="flex gap-2">
                <Button
                  label={copied ? "Copied" : "Copy link"}
                  onClick={() => {
                    void navigator.clipboard.writeText(shareUrl).then(() => {
                      setCopied(true);
                    });
                  }}
                  size="sm"
                  variant="secondary"
                />
                <Button
                  href={shareUrl}
                  label="Open recap"
                  rel="noopener noreferrer"
                  size="sm"
                  target="_blank"
                  variant="ghost"
                />
              </div>
            </div>
            {invitees.length > 0 ? (
              <ul className="mt-4 flex flex-col gap-1.5">
                {invitees.map((invitee) => (
                  <li
                    className="text-ink-soft flex items-center gap-2 text-[11.5px]"
                    key={invitee.email}
                  >
                    <span className="bg-ink-faint/20 inline-block size-1.5 rounded-full" />
                    {invitee.name ? `${invitee.name} · ` : ""}
                    {invitee.email}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-ink-faint mt-3 text-[11px]">
                No helpers or models invited yet.
              </p>
            )}
          </Card>

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

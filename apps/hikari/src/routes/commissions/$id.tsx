import type { Commission, PhotoListItem } from "../../lib/types";
import { Button } from "@astryxdesign/core/Button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { StatusBadge } from "../../components/StatusBadge";
import { useSession } from "../../hooks/useSession";
import { useI18n } from "../../i18n/useI18n";
import {
  calendarEventUrl,
  mapEmbedUrl,
  mapLinkUrl,
  nextStatuses,
} from "../../lib/hikari";

export const Route = createFileRoute("/commissions/$id")({
  component: CommissionDetailPage,
});

type CommissionDetail = Commission & { photos: PhotoListItem[] };

async function fetchCommission(id: string): Promise<CommissionDetail | null> {
  const res = await fetch(`/api/commissions/${id}`);
  if (!res.ok) {
    return null;
  }
  return (await res.json()) as CommissionDetail;
}

function CommissionDetailPage() {
  const { id } = Route.useParams();
  const session = useSession();
  const { t } = useI18n();
  const { data: commission, isLoading } = useQuery({
    queryKey: ["commission", id],
    queryFn: () => fetchCommission(id),
    enabled: Boolean(session.data),
  });

  if (!session.data) {
    return (
      <p className="text-secondary/60 py-20 text-center">
        {t("detail.signInToView")}
      </p>
    );
  }
  if (isLoading) {
    return (
      <div className="text-secondary/60 py-20 text-center">
        {t("home.loading")}
      </div>
    );
  }
  if (!commission) {
    return (
      <p className="text-secondary/60 py-20 text-center">
        {t("detail.notFound")}
      </p>
    );
  }

  return <CommissionDetailView commission={commission} />;
}

const LOCALE_MAP = {
  en: "en-GB",
  fr: "fr-FR",
  ja: "ja-JP",
} as const;

function CommissionDetailView({
  commission,
}: {
  commission: CommissionDetail;
}) {
  const queryClient = useQueryClient();
  const { t, lang } = useI18n();
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  async function uploadPhotos(files: FileList) {
    setBusy(true);
    setActionError(null);
    try {
      for (const file of Array.from(files)) {
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

  return (
    <div className="flex flex-col gap-8 py-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <h1 className="text-secondary text-3xl font-black tracking-tight">
              {commission.title}
            </h1>
            <StatusBadge status={commission.status} />
          </div>
          <p className="text-secondary/60 text-sm">
            {commission.characterName || t("detail.characterTbd")}
            {commission.shootingDate ? ` · ${commission.shootingDate}` : ""}
          </p>
        </div>
        <Link
          to="/"
          className="text-secondary/70 hover:text-secondary text-sm font-medium"
        >
          {t("detail.allCommissions")}
        </Link>
      </header>

      {commission.description ? (
        <section className="bg-surface border-border rounded-2xl border p-4">
          <h2 className="text-secondary/70 mb-2 text-xs font-bold tracking-widest uppercase">
            {t("detail.brief")}
          </h2>
          <p className="text-secondary text-sm whitespace-pre-wrap">
            {commission.description}
          </p>
        </section>
      ) : null}

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="bg-surface border-border flex flex-col gap-3 rounded-2xl border p-4">
          <h2 className="text-secondary/70 text-xs font-bold tracking-widest uppercase">
            {t("detail.location")}
          </h2>
          {commission.locationQuery ? (
            <>
              <p className="text-secondary text-sm font-semibold">
                {commission.locationName}
              </p>
              <iframe
                title={t("detail.location")}
                src={mapEmbedUrl(commission.locationQuery)}
                className="border-border h-56 w-full rounded-xl border"
                loading="lazy"
              />
              <a
                className="text-secondary font-semibold underline"
                href={mapLinkUrl(commission.locationQuery)}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("detail.openMaps")} ↗
              </a>
            </>
          ) : (
            <p className="text-secondary/60 text-sm">
              {t("detail.locationTbd")}
            </p>
          )}
        </div>
        <div className="bg-surface border-border flex flex-col gap-3 rounded-2xl border p-4">
          <h2 className="text-secondary/70 text-xs font-bold tracking-widest uppercase">
            {t("detail.calendar")}
          </h2>
          {commission.shootingDate ? (
            <>
              <p className="text-secondary text-sm">
                {new Date(commission.shootingDate).toLocaleString(
                  LOCALE_MAP[lang],
                  {
                    dateStyle: "full",
                    timeStyle: commission.shootingDate.includes("T")
                      ? "short"
                      : undefined,
                  },
                )}
              </p>
              <a
                className="text-secondary font-semibold underline"
                href={calendarUrl ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("detail.addToCalendar")} ↗
              </a>
            </>
          ) : (
            <p className="text-secondary/60 text-sm">{t("detail.dateTbd")}</p>
          )}
        </div>
      </section>

      <section className="bg-surface border-border flex flex-col gap-3 rounded-2xl border p-4">
        <h2 className="text-secondary/70 text-xs font-bold tracking-widest uppercase">
          {t("detail.status")}
        </h2>
        <div className="flex flex-wrap gap-2">
          {nextStatuses(commission.status).map((next) => (
            <Button
              key={next}
              variant="secondary"
              size="sm"
              label={t("status.moveToNext", { status: t(`status.${next}`) })}
              isDisabled={busy}
              onClick={() => {
                changeStatus(next).catch(() => {});
              }}
            />
          ))}
          {nextStatuses(commission.status).length === 0 ? (
            <p className="text-secondary/60 text-sm">{t("status.final")}</p>
          ) : null}
        </div>
        {actionError ? (
          <p role="alert" className="text-error text-sm">
            {actionError}
          </p>
        ) : null}
      </section>

      <section className="bg-surface border-border flex flex-col gap-3 rounded-2xl border p-4">
        <h2 className="text-secondary/70 text-xs font-bold tracking-widest uppercase">
          {t("detail.photos")} ({commission.photos.length})
        </h2>
        {commission.deliveryReadyAt ? (
          <p className="text-sm font-semibold text-(--color-success)">
            {t("detail.deliveryReady")}
          </p>
        ) : null}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {commission.photos.map((photo) => (
            <figure
              key={photo.id}
              className="bg-body border-border flex flex-col gap-1 rounded-xl border p-2"
            >
              <img
                src={`/api/commissions/${String(commission.id)}/photos/${String(photo.id)}`}
                alt={t("detail.photoAlt", { id: String(photo.id) })}
                className="border-border h-20 w-full rounded-lg border object-cover"
                loading="lazy"
              />
              <figcaption className="text-secondary/60 text-xs">
                {new Date(photo.createdAt).toLocaleDateString(LOCALE_MAP[lang])}
              </figcaption>
            </figure>
          ))}
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            className="file-input file-input-bordered w-full max-w-sm"
            disabled={busy}
            onChange={(e) => {
              const files = e.target.files;
              if (files && files.length > 0) {
                uploadPhotos(files).catch(() => {});
              }
            }}
          />
          <p className="text-secondary/50 mt-1 text-xs">
            {t("detail.uploadHint")}
          </p>
        </div>
      </section>
    </div>
  );
}

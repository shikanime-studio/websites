import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { useAtomValue } from "@effect/atom-react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { isFailure, isInitial } from "effect/reactivity/AsyncResult";
import { useEffect, useRef, useState } from "react";
import {
  CalendarIcon,
  Camera,
  Check,
  Clock,
  Images,
  MapPin,
  Users,
} from "../../components/icons";
import { sessionAtom } from "../../lib/atoms";
import { authClient } from "../../lib/auth-client";
import { SITE } from "../../lib/config";
import { getSharedCommission, joinSharedCommission } from "../../lib/server";
import {
  formatShootingDate,
  progressStages,
  shareCalendarUrl,
  shootingInstant,
} from "../../lib/sharing";

export const Route = createFileRoute("/s/$token")({
  loader: async ({ params }) => {
    const recap = await getSharedCommission({ data: params.token });
    if (!recap) {
      throw notFound();
    }
    return recap;
  },
  component: SharedShootPage,
});

const STAGE_STYLES: Record<string, string> = {
  done: "bg-[var(--hk-accent)] text-[var(--hk-on-accent)]",
  current: "bg-[var(--hk-ink)] text-white",
  upcoming: "bg-[var(--hk-surface-muted)] text-[var(--hk-ink-faint)]",
};

function SharedShootPage() {
  const recap = Route.useLoaderData();
  const invitees = recap.invitees;
  const stages = progressStages({
    status: recap.status,
    shootingDate: recap.shootingDate,
    shootingInstant: recap.shootingDate
      ? shootingInstant(recap.shootingDate, recap.timezone)
      : null,
    photoCount: recap.photos.length,
  });
  const shareUrl = `${SITE}/s/${recap.shareToken}`;
  const mapQuery =
    recap.locationLat !== null && recap.locationLng !== null
      ? `${String(recap.locationLat)},${String(recap.locationLng)}`
      : recap.locationQuery;
  const calendarUrl = recap.shootingDate
    ? shareCalendarUrl({
        title: recap.title,
        details: recap.description || recap.characterName,
        location: recap.locationName || recap.locationQuery,
        shootingDate: recap.shootingDate,
        timeZone: recap.timezone,
        invitees,
        url: shareUrl,
      })
    : null;

  return (
    <div className="studio-shell max-w-3xl py-10 md:py-14">
      <header className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <span className="hk-eyebrow">Shooting recap</span>
          <Link className="text-ink-soft text-[12px] hover:underline" to="/">
            hikari.shikanime.studio
          </Link>
        </div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="hk-display text-[clamp(2rem,5vw,3rem)]">
              {recap.title}
            </h1>
            <p className="text-ink-soft mt-2 text-[13px]">
              A shoot with {recap.photographerName} · prepared for{" "}
              {recap.clientName}
            </p>
          </div>
          <StatusPill status={recap.status} />
        </div>
        <div className="text-ink-soft flex flex-wrap items-center gap-x-5 gap-y-2 text-[12.5px]">
          <span className="flex items-center gap-1.5">
            <CalendarIcon size={14} />
            {formatShootingDate(recap.shootingDate, recap.timezone)}
          </span>
          {recap.locationName ? (
            <span className="flex items-center gap-1.5">
              <MapPin size={14} />
              {recap.locationQuery ? (
                <a
                  className="hover:underline"
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {recap.locationName}
                </a>
              ) : (
                recap.locationName
              )}
            </span>
          ) : null}
          {recap.characterName ? (
            <span className="flex items-center gap-1.5">
              <Camera size={14} />
              {recap.characterName}
            </span>
          ) : null}
        </div>
      </header>

      <div className="mt-8 grid gap-5 lg:grid-cols-[1.35fr_1fr] lg:items-start">
        <Card padding={6}>
          <div className="flex items-center justify-between gap-3">
            <p className="hk-eyebrow">Progress</p>
            <span className="text-ink-faint text-[11px]">
              {stages.filter((stage) => stage.state === "done").length} of{" "}
              {stages.length}
            </span>
          </div>
          <ol className="mt-5 flex flex-col">
            {stages.map((stage, index) => (
              <li key={stage.key} className="flex gap-3.5">
                <div className="flex flex-col items-center">
                  <span
                    className={`flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${STAGE_STYLES[stage.state]}`}
                  >
                    {stage.state === "done" ? <Check size={12} /> : index + 1}
                  </span>
                  {index < stages.length - 1 ? (
                    <span
                      className="my-1 w-px grow"
                      style={{ background: "var(--hk-hairline, #e7e0d6)" }}
                    />
                  ) : null}
                </div>
                <div className="pb-5">
                  <p
                    className={
                      stage.state === "upcoming"
                        ? "text-ink-faint text-[13px] font-semibold"
                        : "text-ink text-[13px] font-semibold"
                    }
                  >
                    {stage.label}
                  </p>
                  <p className="text-ink-soft mt-0.5 text-[12px] leading-snug">
                    {stage.detail}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </Card>

        <div className="flex flex-col gap-5">
          <Card padding={6}>
            <p className="hk-eyebrow">When and where</p>
            <p className="text-ink mt-3 flex items-center gap-2 text-[13px] font-medium">
              <Clock size={14} />
              {formatShootingDate(recap.shootingDate, recap.timezone)}
            </p>
            <p className="text-ink-soft mt-2 flex items-start gap-2 text-[12.5px]">
              <MapPin className="mt-0.5" size={14} />
              {recap.locationName || "Location to be confirmed"}
            </p>
            {calendarUrl ? (
              <div className="mt-4 flex flex-col gap-2">
                <Button
                  className="hk-btn-outline"
                  href={calendarUrl}
                  icon={<CalendarIcon />}
                  label="Add to Google Calendar"
                  rel="noopener noreferrer"
                  size="sm"
                  target="_blank"
                  variant="secondary"
                  width="100%"
                />
                <Button
                  className="hk-btn-outline"
                  href={`/api/share/${recap.shareToken}/calendar`}
                  icon={<CalendarIcon />}
                  label="Download .ics"
                  size="sm"
                  variant="ghost"
                  width="100%"
                />
              </div>
            ) : null}
          </Card>

          <LocationSharingCard recap={recap} />

          <Card padding={6}>
            <p className="hk-eyebrow">People</p>
            <ul className="mt-3 flex flex-col gap-2.5">
              <PersonRow
                email=""
                label={`${recap.photographerName} · photographer`}
              />
              <PersonRow email="" label={`${recap.clientName} · client`} />
              {recap.attendees.map((attendee) => (
                <PersonRow
                  email={attendee.email}
                  key={String(attendee.id)}
                  label={`${attendee.name} · joined`}
                />
              ))}
              {invitees
                .filter(
                  (invitee) =>
                    !recap.attendees.some(
                      (attendee) => attendee.email === invitee.email,
                    ),
                )
                .map((invitee) => (
                  <PersonRow
                    email={invitee.email}
                    key={invitee.email}
                    label={invitee.name || invitee.email}
                  />
                ))}
            </ul>
            {invitees.length === 0 && recap.attendees.length === 0 ? (
              <p className="text-ink-faint mt-3 flex items-center gap-1.5 text-[11.5px]">
                <Users size={13} /> No helpers or models invited yet.
              </p>
            ) : null}
            <JoinControls recap={recap} />
          </Card>
        </div>
      </div>

      <section className="mt-8">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="hk-eyebrow">Gallery</p>
            <p className="text-ink-soft mt-1 text-[12.5px]">
              Previews appear here as the selection is processed.
            </p>
          </div>
          <span className="text-ink-faint flex items-center gap-1.5 text-[11.5px]">
            <Images size={13} /> {recap.photos.length} photos
          </span>
        </div>
        {recap.photos.length === 0 ? (
          <Card className="mt-4" padding={8}>
            <div className="flex flex-col items-center gap-2 text-center">
              <Camera className="text-ink-faint" size={22} />
              <p className="text-ink text-[13px] font-semibold">
                The gallery is still empty
              </p>
              <p className="text-ink-soft max-w-sm text-[12px]">
                Uploads land here automatically and stay private to anyone
                without this link.
              </p>
            </div>
          </Card>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {recap.photos.map((photo) => (
              <a
                className="group block overflow-hidden rounded-xl"
                href={`/api/share/${recap.shareToken}/photos/${String(photo.id)}`}
                key={photo.id}
                rel="noopener noreferrer"
                target="_blank"
              >
                <img
                  alt={`Shoot preview ${String(photo.id)}`}
                  className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  loading="lazy"
                  src={`/api/share/${recap.shareToken}/photos/${String(photo.id)}`}
                />
              </a>
            ))}
          </div>
        )}
      </section>

      <footer className="text-ink-faint mt-10 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--hk-hairline,#e7e0d6)] pt-5 text-[11.5px]">
        <span>Shared with a private link. No account needed to read it.</span>
        <span>Hikari · Shikanime Studio</span>
      </footer>
    </div>
  );
}

function PersonRow({ label, email }: { label: string; email: string }) {
  return (
    <li className="flex items-center gap-2.5">
      <span
        className="text-ink-soft flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
        style={{ background: "var(--hk-surface-muted)" }}
      >
        {label.slice(0, 1).toUpperCase()}
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="text-ink truncate text-[12.5px] font-medium">
          {label}
        </span>
        {email && label !== email ? (
          <span className="text-ink-faint truncate text-[11px]">{email}</span>
        ) : null}
      </span>
    </li>
  );
}

function StatusPill({ status }: { status: string }) {
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span className="hk-eyebrow rounded-full border border-[var(--hk-hairline,#e7e0d6)] px-3 py-1.5 text-[10px]">
      {label}
    </span>
  );
}

function JoinControls({
  recap,
}: {
  recap: Awaited<ReturnType<typeof getSharedCommission>> & {};
}) {
  const session = useAtomValue(sessionAtom);
  const user = isInitial(session) || isFailure(session) ? null : session.value;
  const joined = user
    ? recap.attendees.some((attendee) => attendee.email === user.email)
    : false;
  const [joining, setJoining] = useState(false);
  const [failed, setFailed] = useState(false);

  if (joined) {
    return (
      <p className="text-ink-soft mt-4 flex items-center gap-1.5 text-[12px]">
        <Check size={13} /> You are on the crew list.
      </p>
    );
  }
  if (!user) {
    return (
      <div className="mt-4 flex flex-col gap-2">
        <p className="text-ink-soft text-[12px]">
          Invited to this shoot? Sign in to join the crew list.
        </p>
        <Button
          clickAction={() => {
            void authClient.signIn.social({
              provider: "accounts",
              callbackURL: `/s/${recap.shareToken}`,
            });
          }}
          label="Sign in to join"
          size="sm"
          variant="secondary"
        />
      </div>
    );
  }
  return (
    <div className="mt-4 flex flex-col gap-2">
      <Button
        isDisabled={joining}
        label={joining ? "Joining…" : failed ? "Try again" : "Join the shoot"}
        onClick={() => {
          setJoining(true);
          setFailed(false);
          joinSharedCommission({ data: recap.shareToken })
            .then(() => {
              window.location.reload();
            })
            .catch(() => {
              setJoining(false);
              setFailed(true);
            });
        }}
        size="sm"
        variant="primary"
      />
      {failed ? (
        <p className="text-ink-faint text-[11px]">
          Could not join. Try again in a moment.
        </p>
      ) : null}
    </div>
  );
}

interface SharedLocation {
  name: string;
  lat: number;
  lng: number;
  accuracy: number | null;
  updatedAt: string;
}

function timeAgo(iso: string): string {
  const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  return `${Math.floor(seconds / 3600)} h ago`;
}

/** On-shoot location sharing: opt-in, visible to everyone with the link. */
function LocationSharingCard({
  recap,
}: {
  recap: Awaited<ReturnType<typeof getSharedCommission>> & {};
}) {
  const session = useAtomValue(sessionAtom);
  const user = isInitial(session) || isFailure(session)
    ? null
    : session.value;
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locations, setLocations] = useState<SharedLocation[] | null>(null);
  const watchRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      fetch(`/api/share/${recap.shareToken}/location`)
        .then(async (response) =>
          response.ok ? ((await response.json()) as { locations: SharedLocation[] }) : { locations: [] },
        )
        .then((body) => {
          if (!cancelled) setLocations(body.locations);
        })
        .catch(() => {});
    };
    load();
    const timer = setInterval(load, 30_000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [recap.shareToken]);

  useEffect(
    () => () => {
      if (watchRef.current !== null) {
        navigator.geolocation.clearWatch(watchRef.current);
      }
    },
    [],
  );

  function start() {
    if (!("geolocation" in navigator)) {
      setError("This browser cannot share a location.");
      return;
    }
    setError(null);
    watchRef.current = navigator.geolocation.watchPosition(
      (position) => {
        void fetch(`/api/share/${recap.shareToken}/location`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
          }),
        })
          .then((response) => {
            if (!response.ok) throw new Error(String(response.status));
          })
          .catch(() => {
            setError("Could not upload the position.");
          });
      },
      () => {
        setError("Location permission denied.");
        setSharing(false);
      },
      { enableHighAccuracy: true, maximumAge: 15_000 },
    );
    setSharing(true);
  }

  function stop() {
    if (watchRef.current !== null) {
      navigator.geolocation.clearWatch(watchRef.current);
      watchRef.current = null;
    }
    setSharing(false);
    void fetch(`/api/share/${recap.shareToken}/location`, {
      method: "DELETE",
    });
    setLocations(
      (current) =>
        current?.filter(
          (item) => !user || item.name !== (user?.name ?? ""),
        ) ?? [],
    );
  }

  return (
    <Card padding={6}>
      <div className="flex items-center justify-between gap-3">
        <p className="hk-eyebrow">Location sharing</p>
        {sharing ? (
          <span className="text-ink-soft flex items-center gap-1.5 text-[11px]">
            <span
              className="size-1.5 animate-pulse rounded-full"
              style={{ background: "var(--hk-signal, #e85f17)" }}
            />
            Live
          </span>
        ) : null}
      </div>

      {recap.attendees.some(
        (attendee) => user && attendee.email === user.email,
      ) ? (
        <div className="mt-3 flex flex-col gap-2">
          <Button
            isDisabled={sharing}
            label={sharing ? "Sharing…" : "Share my location"}
            onClick={() => {
              start();
            }}
            size="sm"
            variant={sharing ? "ghost" : "secondary"}
          />
          {sharing ? (
            <Button
              label="Stop sharing"
              onClick={() => {
                stop();
              }}
              size="sm"
              variant="ghost"
            />
          ) : null}
          {error ? (
            <p className="text-ink-faint text-[11px]">{error}</p>
          ) : null}
        </div>
      ) : user ? null : (
        <p className="text-ink-soft mt-3 text-[11.5px]">
          Crew members can share a live position here on shoot day, after
          joining.
        </p>
      )}

      {locations && locations.length > 0 ? (
        <ul className="mt-4 flex flex-col gap-2">
          {locations.map((item) => (
            <li className="flex items-center gap-2.5" key={item.name}>
              <MapPin size={13} className="text-secondary shrink-0" />
              <span className="text-ink min-w-0 flex-1 truncate text-[12.5px]">
                {item.name}
                <span className="text-ink-faint"> · {timeAgo(item.updatedAt)}</span>
              </span>
              <a
                className="text-ink-soft hover:text-ink text-[11px] underline"
                href={`https://www.google.com/maps?q=${item.lat},${item.lng}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                map
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-ink-faint mt-3 text-[11px]">
          No one is sharing a position yet.
        </p>
      )}
    </Card>
  );
}

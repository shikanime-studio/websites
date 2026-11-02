import type { CastDraft } from "../../components/CastEditor";
import type { LocationValue } from "../../components/LocationField";
import type { CharacterEntry } from "../../lib/cast";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { DateTimeInput } from "@astryxdesign/core/DateTimeInput";
import { useTranslator } from "@astryxdesign/core/i18n";
import { TextArea } from "@astryxdesign/core/TextArea";
import { TextInput } from "@astryxdesign/core/TextInput";
import { useToast } from "@astryxdesign/core/Toast";
import { useAtomRefresh, useAtomValue } from "@effect/atom-react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Cause, Effect, Exit } from "effect";
import { isFailure, isInitial } from "effect/reactivity/AsyncResult";
import { useEffect, useState } from "react";
import { CastEditor } from "../../components/CastEditor";
import { CharacterPicker } from "../../components/CharacterPicker";
import { ArrowLeft, Bell, CalendarIcon, Camera, Images } from "../../components/icons";
import { LocationField } from "../../components/LocationField";
import { ApiError, createCommission } from "../../lib/api";
import { commissionsAtom, flagsAtom } from "../../lib/atoms";
import { normalizeCast, normalizeCharacters } from "../../lib/cast";
import { parseInviteeInput } from "../../lib/sharing";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/;

export const Route = createFileRoute("/commissions/new")({
  component: NewCommissionPage,
});

function NewCommissionPage() {
  const navigate = useNavigate();
  const refreshCommissions = useAtomRefresh(commissionsAtom);
  const toast = useToast();
  const t = useTranslator();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [photographerEmail, setPhotographerEmail] = useState("");
  const [characterName, setCharacterName] = useState("");
  const [characters, setCharacters] = useState<CharacterEntry[]>([]);
  const [cast, setCast] = useState<CastDraft[]>([]);
  const [shootingDate, setShootingDate] = useState("");
  const [location, setLocation] = useState<LocationValue>({ text: "", place: null });
  const [inviteesRaw, setInviteesRaw] = useState("");
  // The timezone is assumed, never shown: the studio default on the server,
  // the device zone as soon as we are in the browser. SSR and hydration stay
  // in agreement because the swap happens after the first paint.
  const [timezone, setTimezone] = useState("Europe/Paris");
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (detected) setTimezone(detected);
    });
    return () => {
      cancelAnimationFrame(frame);
    };
  }, []);
  // Flags arrive after the first paint; the fallbacks keep SSR and hydration
  // identical until the binding answers.
  const flags = useAtomValue(flagsAtom);
  const placePin =
    isInitial(flags) || isFailure(flags) ? true : flags.value.placePin;
  const [attempted, setAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const hasEmail = photographerEmail.trim().length > 0;
  const isEmailValid = !hasEmail || EMAIL_PATTERN.test(photographerEmail);
  const titleError =
    attempted && title.trim().length === 0 ? t("form.fieldRequired") : undefined;
  const emailError =
    attempted && !isEmailValid ? t("form.fieldRequired") : undefined;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setAttempted(true);
    if (title.trim().length === 0 || !isEmailValid) {
      return;
    }
    if (location.text.trim().length > 0 && !location.place) {
      toast({
        body: "Pick a location from the suggestions so the map and calendar are accurate.",
        type: "error",
      });
      return;
    }
    const parsedInvitees = parseInviteeInput(inviteesRaw);
    if (parsedInvitees.invalid.length > 0) {
      toast({
        body: `Check these invites: ${parsedInvitees.invalid.join(", ")}.`,
        type: "error",
      });
      return;
    }
    setSubmitting(true);
    const program = Effect.gen(function* () {
      const commission = yield* createCommission({
        title,
        description,
        ...(hasEmail ? { photographerEmail } : {}),
        characterName,
        characters: normalizeCharacters(characters),
        cast: normalizeCast(cast),
        shootingDate: shootingDate ? shootingDate.slice(0, 16) : undefined,
        locationName: location.place?.label ?? "",
        locationQuery: location.place?.label ?? "",
        locationLat: location.place?.lat ?? undefined,
        locationLng: location.place?.lon ?? undefined,
        timezone,
        invitees: parsedInvitees.invitees,
      });
      yield* Effect.sync(() => {
        refreshCommissions();
      });
      yield* Effect.tryPromise({
        try: () =>
          navigate({
            to: "/commissions/$id",
            params: { id: String(commission.id) },
          }),
        catch: () => new ApiError({ message: t("form.createFailed") }),
      });
    }).pipe(Effect.ensuring(Effect.sync(() => setSubmitting(false))));

    const exit = await Effect.runPromiseExit(program);
    if (Exit.isFailure(exit)) {
      const error = Cause.squash(exit.cause);
      toast({
        body: error instanceof ApiError ? error.message : t("form.createFailed"),
        type: "error",
      });
    }
  }

  return (
    <div className="studio-shell py-8 md:py-12">
      <Link
        className="text-ink-soft hover:text-ink inline-flex items-center gap-1.5 text-[12.5px] font-medium transition-colors"
        to="/"
      >
        <ArrowLeft size={14} />
        {t("detail.allCommissions")}
      </Link>

      <header className="mt-5 max-w-2xl">
        <p className="hk-eyebrow">{t("landing.eyebrow")}</p>
        <h1 className="hk-display mt-3 text-[clamp(1.9rem,4vw,2.7rem)]">
          {t("form.title")}
        </h1>
        <p className="text-ink-soft mt-3 text-[13.5px] leading-relaxed">
          {t("form.intro")}
        </p>
      </header>

      <div className="mt-8 grid gap-5 lg:grid-cols-[1.55fr_1fr] lg:items-start">
        <Card className="p-0" padding={0}>
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <fieldset className="border-0 p-0">
              <legend className="hk-eyebrow mb-4">
                {t("form.sectionShoot")}
              </legend>

              <div className="flex flex-col gap-5">
                <TextInput
                  isRequired
                  label={t("form.fieldTitle")}
                  size="lg"
                  onChange={(value) => {
                    setTitle(value);
                  }}
                  placeholder={t("form.fieldTitlePlaceholder")}
                  {...(titleError
                    ? { status: { type: "error" as const, message: titleError } }
                    : {})}
                  value={title}
                />
                <TextInput
                  description="Optional. Leave it blank to run the shoot yourself and invite the photographer by link later."
                  isOptional
                  label={t("form.fieldPhotographer")}
                  size="lg"
                  onChange={(value) => {
                    setPhotographerEmail(value);
                  }}
                  placeholder="photographer@example.com"
                  {...(emailError
                    ? { status: { type: "error" as const, message: emailError } }
                    : {})}
                  type="email"
                  value={photographerEmail}
                />

                <div className="grid gap-5 sm:grid-cols-2">
                  <DateTimeInput
                    hourFormat="24h"
                    // A time field left as free text reads as broken. The
                    // quarter-hour list is the desktop picker; touch devices
                    // get the wheels sheet either way.
                    timeIncrement={15}
                    timeOptionInterval={15}
                    isOptional
                    label={t("form.fieldDate")}
                    size="lg"
                    onChange={(value) => {
                      setShootingDate(value ?? "");
                    }}
                    placeholder={t("form.fieldDate")}
                    value={shootingDate as never}
                  />
                  <LocationField
                    interactivePin={placePin}
                    value={location}
                    onChange={setLocation}
                  />
                </div>

                <TextArea
                  description="Only used for the calendar invitations. Access is granted by link, not by these addresses."
                  isOptional
                  label="Calendar guests"
                  onChange={setInviteesRaw}
                  placeholder={"Aiko <aiko@example.com>\nstudio@example.com"}
                  rows={3}
                  value={inviteesRaw}
                />
              </div>
            </fieldset>

            <div className="border-border mt-8 border-t pt-6">
              <fieldset className="border-0 p-0">
                <legend className="hk-eyebrow mb-4">
                  {t("form.sectionBrief")}
                </legend>
                <div className="flex flex-col gap-5">
                  <CharacterPicker
                    onChange={(next) => {
                      setCharacters(next);
                      // Legacy summary column caps at 120 characters; the
                      // structured list below is the real value.
                      setCharacterName(
                        next
                          .map((entry) =>
                            entry.series
                              ? `${entry.name} — ${entry.series}`
                              : entry.name)
                          .join(", ")
                          .slice(0, 120),
                      );
                    }}
                    value={characters}
                  />

                  <div className="flex flex-col gap-2">
                    <p className="hk-eyebrow">Cast</p>
                    <p className="text-secondary text-[12px] leading-relaxed">
                      A group shoot can have several photographers and
                      cosplayers. People without an account can still be listed
                      by name; invites add the ones who join.
                    </p>
                    <CastEditor onChange={setCast} value={cast} />
                  </div>

                  <TextArea
                    isOptional
                    label={t("form.fieldNotes")}
                    size="lg"
                    onChange={(value) => {
                      setDescription(value);
                    }}
                    placeholder={t("form.fieldNotesPlaceholder")}
                    rows={5}
                    value={description}
                  />
                </div>
              </fieldset>
            </div>

            <div className="border-hairline mt-8 flex flex-col-reverse gap-2 border-t pt-5 sm:flex-row sm:justify-end">
              <Button
                label={t("form.cancel")}
                onClick={() => {
                  history.back();
                }}
                variant="ghost"
              />
              <Button
                isLoading={submitting}
                label={submitting ? t("form.sending") : t("form.submit")}
                type="submit"
                variant="primary"
              />
            </div>
          </form>
        </Card>

        <Card className="lg:sticky lg:top-24" padding={6}>
          <p className="hk-eyebrow">{t("form.asideTitle")}</p>
          <ol className="mt-5 flex flex-col gap-4">
            <AsideStep
              icon={<Bell size={15} />}
              index="01"
              text={t("form.aside1")}
            />
            <AsideStep
              icon={<CalendarIcon size={15} />}
              index="02"
              text={t("form.aside2")}
            />
            <AsideStep
              icon={<Images size={15} />}
              index="03"
              text={t("form.aside3")}
            />
          </ol>
          <p className="text-ink-faint border-hairline mt-5 border-t pt-4 text-[11.5px] leading-relaxed">
            {t("form.asideNote")}
          </p>
          <Card className="mt-5 flex items-center gap-2.5" padding={3} variant="muted">
            <Camera className="text-ink-soft" size={15} />
            <p className="text-ink-soft text-[11.5px] leading-snug">
              {t("landing.feature4Body")}
            </p>
          </Card>
        </Card>
      </div>
    </div>
  );
}

function AsideStep({
  index,
  icon,
  text,
}: {
  index: string;
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <li className="flex items-start gap-3">
      <span
        className="text-ink-soft flex size-8 shrink-0 items-center justify-center rounded-full"
        style={{ background: "var(--hk-surface-muted)" }}
      >
        {icon}
      </span>
      <div>
        <span className="hk-eyebrow text-ink-faint text-[9.5px]">{index}</span>
        <p className="text-ink mt-0.5 text-[12.5px] leading-snug">{text}</p>
      </div>
    </li>
  );
}

import { Banner } from "@astryxdesign/core/Banner";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { DateTimeInput } from "@astryxdesign/core/DateTimeInput";
import { TextArea } from "@astryxdesign/core/TextArea";
import { TextInput } from "@astryxdesign/core/TextInput";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Bell, CalendarIcon, Camera, Images } from "../../components/icons";
import { useI18n } from "../../i18n/useI18n";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/;

export const Route = createFileRoute("/commissions/new")({
  component: NewCommissionPage,
});

function NewCommissionPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [photographerEmail, setPhotographerEmail] = useState("");
  const [characterName, setCharacterName] = useState("");
  const [shootingDate, setShootingDate] = useState("");
  const [locationName, setLocationName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [attempted, setAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isEmailValid = EMAIL_PATTERN.test(photographerEmail);
  const titleError =
    attempted && title.trim().length === 0 ? t("form.fieldRequired") : undefined;
  const emailError =
    attempted && !isEmailValid ? t("form.fieldRequired") : undefined;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setAttempted(true);
    setError(null);
    if (title.trim().length === 0 || !isEmailValid) {
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/commissions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          photographerEmail,
          characterName,
          shootingDate: shootingDate ? shootingDate.slice(0, 16) : undefined,
          locationName,
          locationQuery: locationName,
        }),
      });
      if (!res.ok) {
        const payload = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        setError(payload?.error ?? t("form.createFailed"));
        return;
      }
      const commission = (await res.json()) as { id: number };
      await queryClient.invalidateQueries({ queryKey: ["commissions"] });
      await navigate({
        to: "/commissions/$id",
        params: { id: String(commission.id) },
      });
    } catch {
      setError(t("form.createFailed"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="hk-shell py-8 md:py-12">
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
                  description={t("form.fieldPhotographerHint")}
                  isRequired
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
                    isOptional
                    label={t("form.fieldDate")}
                    size="lg"
                    onChange={(value) => {
                      setShootingDate(value ?? "");
                    }}
                    placeholder={t("form.fieldDate")}
                    value={shootingDate as never}
                  />
                  <TextInput
                    isOptional
                    label={t("form.fieldLocation")}
                    size="lg"
                    onChange={(value) => {
                      setLocationName(value);
                    }}
                    placeholder={t("form.fieldLocationPlaceholder")}
                    value={locationName}
                  />
                </div>
              </div>
            </fieldset>

            <div className="border-hairline mt-8 border-t pt-6">
              <fieldset className="border-0 p-0">
                <legend className="hk-eyebrow mb-4">
                  {t("form.sectionBrief")}
                </legend>
                <div className="flex flex-col gap-5">
                  <TextInput
                    isOptional
                    label={t("form.fieldCharacter")}
                    size="lg"
                    onChange={(value) => {
                      setCharacterName(value);
                    }}
                    placeholder={t("form.fieldCharacterPlaceholder")}
                    value={characterName}
                  />
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

            {error ? (
              <div className="mt-6">
                <Banner status="error" title={error} />
              </div>
            ) : null}

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

import { Button } from "@astryxdesign/core/Button";
import { TextArea } from "@astryxdesign/core/TextArea";
import { TextInput } from "@astryxdesign/core/TextInput";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useI18n } from "../../i18n/useI18n";

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
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
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
          shootingDate: shootingDate || undefined,
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
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 py-8">
      <header>
        <h1 className="text-secondary text-3xl font-black tracking-tight">
          {t("form.title")}
        </h1>
        <p className="text-secondary/60 text-sm">{t("form.intro")}</p>
      </header>

      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        <TextInput
          label={t("form.fieldTitle")}
          value={title}
          onChange={setTitle}
          placeholder={t("form.fieldTitlePlaceholder")}
          isRequired
        />
        <TextInput
          label={t("form.fieldPhotographer")}
          type="email"
          value={photographerEmail}
          onChange={setPhotographerEmail}
          placeholder="photographer@example.com"
          isRequired
        />
        <TextInput
          label={t("form.fieldCharacter")}
          value={characterName}
          onChange={setCharacterName}
          placeholder={t("form.fieldCharacterPlaceholder")}
          isOptional
        />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="shooting-date"
              className="text-secondary/70 mb-1 block text-sm font-semibold"
            >
              {t("form.fieldDate")}{" "}
              <span className="font-normal">({t("form.optional")})</span>
            </label>
            <input
              id="shooting-date"
              className="bg-body border-border text-secondary focus:border-accent w-full rounded-lg border px-3 py-2 text-sm outline-none"
              type="datetime-local"
              value={shootingDate}
              onChange={(e) => setShootingDate(e.target.value)}
            />
          </div>
          <TextInput
            label={t("form.fieldLocation")}
            value={locationName}
            onChange={setLocationName}
            placeholder={t("form.fieldLocationPlaceholder")}
            isOptional
          />
        </div>
        <TextArea
          label={t("form.fieldNotes")}
          value={description}
          onChange={setDescription}
          placeholder={t("form.fieldNotesPlaceholder")}
          isOptional
        />

        {error ? (
          <p role="alert" className="text-error text-sm">
            {error}
          </p>
        ) : null}

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            label={t("form.cancel")}
            onClick={() => history.back()}
          />
          <Button
            type="submit"
            variant="primary"
            label={t("form.submit")}
            isDisabled={submitting}
          />
        </div>
      </form>
    </div>
  );
}

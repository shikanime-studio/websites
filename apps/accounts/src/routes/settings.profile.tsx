import { Avatar } from "@astryxdesign/core/Avatar";
import { Badge } from "@astryxdesign/core/Badge";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { Heading } from "@astryxdesign/core/Heading";
import { useTranslator } from "@astryxdesign/core/i18n";
import { Text } from "@astryxdesign/core/Text";
import { TextInput } from "@astryxdesign/core/TextInput";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useSession } from "../hooks/useSession";
import { authClient } from "../lib/auth-client";

export const Route = createFileRoute("/settings/profile")({
  component: ProfileSettingsPage,
});

function ProfileSettingsPage() {
  const t = useTranslator();
  const { data: session } = useSession();
  const userName = session?.user?.name ?? "";
  const [name, setName] = useState(userName);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );

  async function handleSave() {
    if (!name.trim() || name === session?.user?.name) {
      return;
    }
    setStatus("saving");
    const { error } = await authClient.updateUser({ name: name.trim() });
    setStatus(error ? "error" : "saved");
  }

  const verified = session?.user?.emailVerified ?? false;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Heading level={1}>{t("accounts.center.profileTitle")}</Heading>
        <Text color="secondary">
          {t("accounts.center.profileDesc")}
        </Text>
      </div>

      <Card padding={5}>
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <Avatar
              name={session?.user?.name ?? session?.user?.email ?? "User"}
              src={session?.user?.image ?? ""}
              size="xl"
            />
            <div className="flex flex-col gap-1">
              <Text weight="semibold">{session?.user?.name}</Text>
              <div className="flex items-center gap-2">
                <Text color="secondary" size="sm">
                  {session?.user?.email}
                </Text>
                <Badge
                  variant={verified ? "success" : "warning"}
                  label={
                    verified
                      ? t("accounts.center.emailVerified")
                      : t("accounts.center.emailUnverified")
                  }
                />
              </div>
            </div>
          </div>

          <TextInput
            label={t("accounts.center.displayName")}
            description={t("accounts.center.displayNameDesc")}
            value={name}
            onChange={setName}
            onEnter={handleSave}
          />

          {status === "error"
            ? (
              <Text color="accent" size="sm" role="alert">
                {t("accounts.center.saveError")}
              </Text>
            )
            : null}

          <div className="flex items-center gap-3">
            <Button
              label={
                status === "saving"
                  ? t("accounts.center.saving")
                  : t("accounts.center.save")
              }
              variant="primary"
              isDisabled={
                status === "saving" || !name.trim()
                  || name === session?.user?.name
              }
              onClick={handleSave}
            />
            {status === "saved"
              ? (
                <Text color="secondary" size="sm">
                  {t("accounts.center.saved")}
                </Text>
              )
              : null}
          </div>
        </div>
      </Card>
    </div>
  );
}

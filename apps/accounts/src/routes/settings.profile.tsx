import { Avatar } from "@astryxdesign/core/Avatar";
import { Badge } from "@astryxdesign/core/Badge";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { Divider } from "@astryxdesign/core/Divider";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { TextInput } from "@astryxdesign/core/TextInput";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Mail } from "lucide-react";
import { useState } from "react";
import { useSession } from "../hooks/useSession";
import { authClient } from "../lib/auth-client";

export const Route = createFileRoute("/settings/profile")({
  component: ProfileSettingsPage,
});

function ProfileSettingsPage() {
  const { data: session } = useSession();
  const userName = session?.user?.name ?? "";
  const [draft, setDraft] = useState<string | null>(null);
  const name = draft ?? userName;
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );

  async function handleSave() {
    if (!name.trim() || name === userName) {
      return;
    }
    setStatus("saving");
    const { error } = await authClient.updateUser({ name: name.trim() });
    setStatus(error ? "error" : "saved");
  }

  const verified = session?.user?.emailVerified ?? false;
  const unchanged = !name.trim() || name === userName;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Link
          to="/settings"
          className="text-secondary hover:text-foreground flex w-fit items-center gap-1.5 text-sm font-medium transition-colors"
        >
          <ArrowLeft size={16} aria-hidden />
          Accounts Center
        </Link>
        <div className="flex flex-col gap-2">
          <Heading level={1} type="display-2" className="font-display">
            Personal details
          </Heading>
          <Text color="secondary">
            This is how you appear across Shikanime Studio applications.
          </Text>
        </div>
      </div>

      <Card padding={0} className="overflow-hidden">
        <div className="flex items-center gap-4 px-5 py-5">
          <Avatar
            name={session?.user?.name ?? session?.user?.email ?? "User"}
            src={session?.user?.image ?? ""}
            size="lg"
          />
          <div className="flex min-w-0 flex-col gap-1">
            <Text size="lg" weight="semibold">
              {session?.user?.name ?? "Your account"}
            </Text>
            <Text size="sm" color="secondary">
              {session?.user?.email ?? ""}
            </Text>
          </div>
        </div>
        <Divider />
        <div className="flex flex-col gap-1 px-5 py-4">
          <Text size="sm" weight="semibold">
            Profile picture
          </Text>
          <Text size="sm" color="secondary">
            Your Google profile picture is used automatically.
          </Text>
        </div>
      </Card>

      <Card padding={5}>
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <Text weight="semibold">Name</Text>
            <Text size="sm" color="secondary">
              Shown to applications you sign in to.
            </Text>
          </div>
          <TextInput
            label="Display name"
            value={name}
            onChange={setDraft}
            onEnter={handleSave}
          />
          {status === "error"
            ? (
              <Text color="accent" size="sm" weight="semibold" role="alert">
                Could not save. Try again.
              </Text>
            )
            : null}
          <div className="flex items-center justify-end gap-3">
            {status === "saved"
              ? (
                <Text size="sm" color="secondary">
                  Saved
                </Text>
              )
              : null}
            <Button
              label={status === "saving" ? "Saving…" : "Save"}
              variant="primary"
              isDisabled={status === "saving" || unchanged}
              onClick={handleSave}
            />
          </div>
        </div>
      </Card>

      <Card padding={0} className="overflow-hidden">
        <div className="flex items-start gap-4 px-5 py-4">
          <span className="bg-accent/10 text-accent mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full">
            <Mail size={16} aria-hidden />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <Text weight="medium">Email</Text>
              <Badge
                variant={verified ? "info" : "warning"}
                label={verified ? "Verified" : "Not verified"}
              />
            </div>
            <Text size="sm" color="secondary">
              {session?.user?.email ?? ""}
            </Text>
            <Text size="sm" color="secondary">
              Used to sign in. Contact support to change it.
            </Text>
          </div>
        </div>
      </Card>
    </div>
  );
}

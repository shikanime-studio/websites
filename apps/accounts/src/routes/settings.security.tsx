import { Badge } from "@astryxdesign/core/Badge";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { Divider } from "@astryxdesign/core/Divider";
import { Text } from "@astryxdesign/core/Text";
import { useAtomRefresh, useAtomValue } from "@effect/atom-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { getOrElse, isInitial  } from "effect/reactivity/AsyncResult";
import {
  ArrowLeft,
  KeyRound,
  MonitorSmartphone,
  SquareArrowOutUpRight,
} from "lucide-react";
import { useState } from "react";
import { accountsAtom,
  authorizedClientsAtom,
  sessionAtom,
  sessionsAtom } from "../lib/atoms";
import { authClient } from "../lib/auth-client";
import { revokeClientAccess } from "../lib/oauth-clients";

const PROVIDER_LABELS: Record<string, string> = {
  google: "Google",
  credential: "Email …word",
};

const BROWSERS: Array<[RegExp, string]> = [
  [/Edg\/[\d.]+/, "Edge"],
  [/OPR\/[\d.]+/, "Opera"],
  [/Firefox\/[\d.]+/, "Firefox"],
  [/Chrome\/[\d.]+/, "Chrome"],
  [/Safari\/[\d.]+/, "Safari"],
];

const SYSTEMS: Array<[RegExp, string]> = [
  [/Windows NT/, "Windows"],
  [/Android/, "Android"],
  [/iPhone|iPad/, "iOS"],
  [/Mac OS X/, "macOS"],
  [/Linux/, "Linux"],
];

export const Route = createFileRoute("/settings/security")({
  component: SecuritySettingsPage,
});

function SecuritySettingsPage() {
  const session = getOrElse(useAtomValue(sessionAtom), () => null);
  const currentSessionId = session?.session?.id ?? null;
  const sessionsResult = useAtomValue(sessionsAtom);
  const accountsResult = useAtomValue(accountsAtom);
  const clientsResult = useAtomValue(authorizedClientsAtom);
  const refreshSessions = useAtomRefresh(sessionsAtom);
  const refreshClients = useAtomRefresh(authorizedClientsAtom);
  const sessions = { data: getOrElse(sessionsResult, () => []), isLoading: isInitial(sessionsResult) };
  const accounts = { data: getOrElse(accountsResult, () => []) };
  const clients = { data: getOrElse(clientsResult, () => []), isLoading: isInitial(clientsResult) };
  const [signingOut, setSigningOut] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);

  async function signOutOthers() {
    setSigningOut(true);
    try {
      await authClient.revokeOtherSessions();
      refreshSessions();
    } finally {
      setSigningOut(false);
    }
  }

  async function revokeClient(clientId: string) {
    setRevoking(clientId);
    try {
      await revokeClientAccess({ data: clientId });
      refreshClients();
    } finally {
      setRevoking(null);
    }
  }

  function describeSessionDevice(userAgent: string | null | undefined): string {
    const ua = userAgent ?? "";
    const browser = BROWSERS.find(([pattern]) => pattern.test(ua))?.[1];
    const system = SYSTEMS.find(([pattern]) => pattern.test(ua))?.[1];
    if (browser && system) {
      return `${browser} on ${system}`;
    }
    return "Unknown device";
  }

  const otherSessions = (sessions.data ?? []).filter(
    (item) => item.id !== currentSessionId,
  );
  const authorizedClients = clients.data ?? [];

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
          <h1 className="font-display text-[26px] leading-tight font-semibold">
            Password and security
          </h1>
          <Text size="sm" color="secondary">
            Review the devices and apps that can reach your account.
          </Text>
        </div>
      </div>

      <Card padding={0} className="overflow-hidden">
        <div className="flex items-start gap-4 px-5 py-5">
          <span className="bg-accent/10 text-accent mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full">
            <MonitorSmartphone size={18} aria-hidden />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-col gap-1">
                <Text weight="semibold">Where you're signed in</Text>
                <Text size="sm" color="secondary">
                  Devices with an active session on your account.
                </Text>
              </div>
              {otherSessions.length > 0
                ? (
                  <Button
                    label="Sign out other devices"
                    variant="secondary"
                    size="sm"
                    isDisabled={signingOut}
                    onClick={() => { void signOutOthers(); }}
                  />
                )
                : null}
            </div>

            <Divider />

            <ul className="flex flex-col">
              <li className="flex items-center justify-between gap-4 py-3">
                <div className="flex flex-col gap-0.5">
                  <Text size="sm" weight="medium">
                    This device
                  </Text>
                  <Text size="sm" color="secondary">
                    Current session
                  </Text>
                </div>
                <Badge variant="neutral" label="Active now" />
              </li>
              {otherSessions.map((item) => (
                <li
                  key={item.id}
                  className="border-border flex items-center justify-between gap-4 border-t py-3"
                >
                  <div className="flex flex-col gap-0.5">
                    <Text size="sm" weight="medium">
                      {describeSessionDevice(item.userAgent)}
                    </Text>
                    <Text size="sm" color="secondary">
                      Signed in{" "}
                      {new Date(item.createdAt).toLocaleDateString("en")}
                      {item.ipAddress ? ` · ${item.ipAddress}` : ""}
                    </Text>
                  </div>
                </li>
              ))}
            </ul>

          </div>
        </div>
      </Card>

      <Card padding={0} className="overflow-hidden">
        <div className="flex items-start gap-4 px-5 py-5">
          <span className="bg-accent/10 text-accent mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full">
            <SquareArrowOutUpRight size={18} aria-hidden />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <div className="flex flex-col gap-1">
              <Text weight="semibold">Apps and websites</Text>
              <Text size="sm" color="secondary">
                Apps you've allowed to use your Shikanime Studio account.
              </Text>
            </div>

            {clients.isLoading ? null : authorizedClients.length === 0
              ? (
                <div className="bg-body flex flex-col gap-1 rounded-xl px-4 py-3">
                  <Text size="sm" weight="medium">
                    No apps yet
                  </Text>
                  <Text size="sm" color="secondary">
                    When an application asks for access, it will appear here.
                  </Text>
                </div>
              )
              : (
                <ul className="flex flex-col">
                  {authorizedClients.map((client, index) => (
                    <li
                      key={client.clientId}
                      className={
                        index === 0
                          ? "flex flex-col gap-3 py-3"
                          : "border-border flex flex-col gap-3 border-t py-3"
                      }
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex min-w-0 flex-col gap-1">
                          <Text size="sm" weight="medium">
                            {client.name ?? client.clientId}
                          </Text>
                          <Text size="sm" color="secondary">
                            Authorized{" "}
                            {client.authorizedAt
                              ? new Date(client.authorizedAt)
                                .toLocaleDateString("en")
                              : ""}
                          </Text>
                        </div>
                        <Button
                          label="Remove access"
                          variant="secondary"
                          size="sm"
                          isDisabled={revoking === client.clientId}
                          onClick={() => { void revokeClient(client.clientId); }}
                        />
                      </div>
                      {client.scopes.length > 0
                        ? (
                          <div className="flex flex-wrap gap-2">
                            {client.scopes.map((scope) => (
                              <Badge
                                key={scope}
                                variant="neutral"
                                label={scope}
                              />
                            ))}
                          </div>
                        )
                        : null}
                    </li>
                  ))}
                </ul>
              )}
          </div>
        </div>
      </Card>

      <Card padding={0} className="overflow-hidden">
        <div className="flex items-start gap-4 px-5 py-5">
          <span className="bg-accent/10 text-accent mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full">
            <KeyRound size={18} aria-hidden />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <Text weight="semibold">How you sign in</Text>
            <Text size="sm" color="secondary">
              Sign-in checks are handled by the provider below.
            </Text>
            <div className="flex flex-wrap gap-2">
              {(accounts.data ?? []).length === 0
                ? <Badge variant="neutral" label="Google" />
                : (accounts.data ?? []).map((item) => (
                  <Badge
                    key={item.id}
                    variant="neutral"
                    label={PROVIDER_LABELS[item.providerId] ?? item.providerId}
                  />
                ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

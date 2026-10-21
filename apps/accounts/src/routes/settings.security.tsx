import { Badge } from "@astryxdesign/core/Badge";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { Heading } from "@astryxdesign/core/Heading";
import { useTranslator } from "@astryxdesign/core/i18n";
import { Text } from "@astryxdesign/core/Text";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { and, eq } from "drizzle-orm";
import { useSession } from "../hooks/useSession";
import { createAuth } from "../lib/auth";
import { authClient } from "../lib/auth-client";
import { createD1Database } from "../lib/db";
import {
  oauthAccessTokens,
  oauthClients,
  oauthConsents,
  oauthRefreshTokens,
} from "../schema";

interface AuthorizedClient {
  clientId: string;
  name: string | null;
  scopes: string[];
  authorizedAt: string | null;
}

const listAuthorizedClients = createServerFn().handler(
  async (): Promise<AuthorizedClient[]> => {
    const request = getRequest();
    const db = createD1Database();
    const auth = createAuth(db);
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return [];
    }
    const rows = await db
      .select({
        clientId: oauthConsents.clientId,
        name: oauthClients.name,
        scopes: oauthConsents.scopes,
        authorizedAt: oauthConsents.createdAt,
      })
      .from(oauthConsents)
      .innerJoin(
        oauthClients,
        eq(oauthClients.clientId, oauthConsents.clientId),
      )
      .where(eq(oauthConsents.userId, session.user.id));
    return rows.map((row) => ({
      clientId: row.clientId,
      name: row.name,
      scopes: row.scopes ?? [],
      authorizedAt: row.authorizedAt
        ? row.authorizedAt.toISOString()
        : null,
    }));
  },
);

const revokeClientAccess = createServerFn()
  .validator((input: unknown): string => {
    if (typeof input !== "string" || input.length === 0) {
      throw new Error("clientId is required");
    }
    return input;
  })
  .handler(async ({ data }) => {
    const clientId = data;
    const request = getRequest();
    const db = createD1Database();
    const auth = createAuth(db);
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      throw new Error("Unauthorized");
    }
    const userId = session.user.id;
    await db
      .delete(oauthAccessTokens)
      .where(
        and(
          eq(oauthAccessTokens.userId, userId),
          eq(oauthAccessTokens.clientId, clientId),
        ),
      );
    await db
      .delete(oauthRefreshTokens)
      .where(
        and(
          eq(oauthRefreshTokens.userId, userId),
          eq(oauthRefreshTokens.clientId, clientId),
        ),
      );
    await db
      .delete(oauthConsents)
      .where(
        and(
          eq(oauthConsents.userId, userId),
          eq(oauthConsents.clientId, clientId),
        ),
      );
  });

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
  const t = useTranslator();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const currentSessionId = session?.session?.id ?? null;

  const sessions = useQuery({
    queryKey: ["auth", "sessions"],
    queryFn: async () => {
      const { data } = await authClient.listSessions();
      return data ?? [];
    },
    retry: false,
  });

  const accounts = useQuery({
    queryKey: ["auth", "accounts"],
    queryFn: async () => {
      const { data } = await authClient.listAccounts();
      return data ?? [];
    },
    retry: false,
  });

  const clients = useQuery({
    queryKey: ["auth", "clients"],
    queryFn: () => listAuthorizedClients(),
    retry: false,
  });

  const signOutOthers = useMutation({
    mutationFn: async () => {
      const { error } = await authClient.revokeOtherSessions();
      if (error) {
        throw new Error(error.message ?? "Failed to sign out devices");
      }
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["auth"] }),
  });

  const revokeClient = useMutation({
    mutationFn: (clientId: string) => revokeClientAccess({ data: clientId }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["auth", "clients"] }),
  });

  function describeSessionDevice(userAgent: string | null | undefined): string {
    const ua = userAgent ?? "";
    const browser = BROWSERS.find(([pattern]) => pattern.test(ua))?.[1];
    const system = SYSTEMS.find(([pattern]) => pattern.test(ua))?.[1];
    if (browser && system) {
      return t("accounts.center.deviceOn", { browser, system });
    }
    return t("accounts.center.unknownDevice");
  }

  const otherSessions = (sessions.data ?? []).filter(
    (item) => item.id !== currentSessionId,
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Heading level={1}>{t("accounts.center.securityTitle")}</Heading>
        <Text color="secondary">{t("accounts.center.securityDesc")}</Text>
      </div>

      <Card padding={5}>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <Text weight="semibold">
                {t("accounts.center.sessionsTitle")}
              </Text>
              <Text color="secondary" size="sm">
                {t("accounts.center.sessionsDesc")}
              </Text>
            </div>
            {otherSessions.length > 0
              ? (
                <Button
                  label={t("accounts.center.signOutOthers")}
                  variant="secondary"
                  isDisabled={signOutOthers.isPending}
                  onClick={() => signOutOthers.mutate()}
                />
              )
              : null}
          </div>

          {currentSessionId
            ? (
              <Text color="secondary" size="sm">
                {t("accounts.center.thisDevice")}
                {" — "}
                {t("accounts.center.currentSession")}
              </Text>
            )
            : null}

          {sessions.isLoading
            ? null
            : otherSessions.length === 0
            ? (
              <Text color="secondary" size="sm">
                {t("accounts.center.noOtherSessions")}
              </Text>
            )
            : (
              <ul className="flex flex-col">
                {otherSessions.map((item) => (
                  <li
                    key={item.id}
                    className="border-border flex flex-col gap-1 border-b py-3 last:border-b-0"
                  >
                    <Text size="sm" weight="medium">
                      {describeSessionDevice(item.userAgent)}
                    </Text>
                    <Text color="secondary" size="sm">
                      {t("accounts.center.signedIn")}
                      {" "}
                      {new Date(item.createdAt).toLocaleDateString("en")}
                      {item.ipAddress ? ` · ${item.ipAddress}` : ""}
                    </Text>
                  </li>
                ))}
              </ul>
            )}
        </div>
      </Card>

      <Card padding={5}>
        <div className="flex flex-col gap-2">
          <Text weight="semibold">{t("accounts.center.provider")}</Text>
          <Text color="secondary" size="sm">
            {t("accounts.center.providerDesc")}
          </Text>
          <div className="flex flex-wrap gap-2">
            {(accounts.data ?? []).map((item) => (
              <Badge key={item.id} variant="info" label={item.providerId} />
            ))}
          </div>
        </div>
      </Card>

      <Card padding={5}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <Text weight="semibold">{t("accounts.center.appsTitle")}</Text>
            <Text color="secondary" size="sm">
              {t("accounts.center.appsDesc")}
            </Text>
          </div>
          {clients.isLoading
            ? null
            : (clients.data ?? []).length === 0
            ? (
              <Text color="secondary" size="sm">
                {t("accounts.center.noApps")}
              </Text>
            )
            : (
              <ul className="flex flex-col gap-4">
                {(clients.data ?? []).map((client) => (
                  <li
                    key={client.clientId}
                    className="border-border flex flex-col gap-2 border-b pb-4 last:border-b-0 last:pb-0"
                  >
                    <div className="flex flex-col gap-1">
                      <Text size="sm" weight="medium">
                        {client.name ?? client.clientId}
                      </Text>
                      <div className="flex flex-wrap items-center gap-2">
                        <Text color="secondary" size="sm">
                          {t("accounts.center.authorized")}
                          {" "}
                          {client.authorizedAt
                            ? new Date(client.authorizedAt).toLocaleDateString(
                                "en",
                              )
                            : ""}
                        </Text>
                        {client.scopes.map((scope) => (
                          <Badge
                            key={scope}
                            variant="neutral"
                            label={scope}
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <Button
                        label={t("accounts.center.revoke")}
                        variant="secondary"
                        isDisabled={revokeClient.isPending}
                        onClick={() => revokeClient.mutate(client.clientId)}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
        </div>
      </Card>
    </div>
  );
}

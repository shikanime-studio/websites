import { Avatar } from "@astryxdesign/core/Avatar";
import { Badge } from "@astryxdesign/core/Badge";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { Divider } from "@astryxdesign/core/Divider";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { useSession } from "../hooks/useSession";

interface ConsentSearch {
  client_id?: string;
  scope?: string;
  oauth_query?: string;
}

function parseConsentSearch(search: Record<string, unknown>): ConsentSearch {
  // Bracket access is required here: the incoming shape is an index-signature
  // record, so dot access trips tsc's TS4111.
  const client_id = search["client_id"];
  const scope = search["scope"];
  const oauth_query = search["oauth_query"];
  const parsed: ConsentSearch = {};
  if (typeof client_id === "string") {
    parsed.client_id = client_id;
  }
  if (typeof scope === "string") {
    parsed.scope = scope;
  }
  if (typeof oauth_query === "string") {
    parsed.oauth_query = oauth_query;
  }
  return parsed;
}

export const Route = createFileRoute("/consent")({
  component: ConsentPage,
  validateSearch: parseConsentSearch,
});

function ConsentPage() {
  const { client_id: clientId, scope, oauth_query: oauthQuery } = useSearch({
    from: "/consent",
  });
  const { data: session } = useSession();
  const [error, setError] = useState<string | null>(null);

  const consent = useMutation({
    mutationFn: async (accept: boolean) => {
      const res = await fetch("/api/auth/oauth2/consent", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          accept,
          oauth_query: oauthQuery,
        }),
      });
      if (!res.ok) {
        throw new Error(`Consent failed (${res.status})`);
      }
      const body = (await res.json()) as { redirect_uri?: string };
      if (!body.redirect_uri) {
        throw new Error("Missing redirect target");
      }
      return body.redirect_uri;
    },
    onSuccess: (redirectUri) => {
      window.location.assign(redirectUri);
    },
    onError: (err: Error) => setError(err.message),
  });

  const scopes = (scope ?? "").split(" ").filter(Boolean);

  if (!session?.user) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col px-4 py-24">
        <Card padding={5}>
          <div className="flex flex-col items-center gap-4 text-center">
            <Heading level={1}>Sign in required</Heading>
            <Text color="secondary">
              Sign in before approving access.
            </Text>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col px-4 py-24">
      <Card padding={5}>
        <div className="flex flex-col items-center gap-5 text-center">
          <div className="flex items-center gap-3">
            <Avatar
              name={session.user.name ?? session.user.email ?? "User"}
              src={session.user.image ?? ""}
              size="md"
            />
            <span className="text-secondary/50 text-lg">→</span>
            <div className="border-border bg-surface text-secondary flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-black">
              {(clientId ?? "?").slice(0, 2).toUpperCase()}
            </div>
          </div>
          <Heading level={1}>Authorize access</Heading>
          <Text color="secondary">
            <span className="text-secondary font-bold">
              {clientId ?? "An application"}
            </span>
            {" "}
            wants to access your Shikanime Studio account.
          </Text>
          {scopes.length > 0
            ? (
              <div className="flex w-full flex-col items-start gap-2">
                <Text size="sm" weight="semibold">
                  This will allow the application to:
                </Text>
                <div className="flex flex-wrap gap-2">
                  {scopes.map((s) => (
                    <Badge key={s} variant="info" label={s} />
                  ))}
                </div>
              </div>
            )
            : null}
          {error
            ? (
              <Text color="accent" size="sm" weight="semibold" role="alert">
                {error}
              </Text>
            )
            : null}
          <Divider className="w-full" />
          <div className="flex w-full gap-3">
            <Button
              className="flex-1"
              label="Allow"
              variant="primary"
              isDisabled={consent.isPending}
              onClick={() => consent.mutate(true)}
            />
            <Button
              className="flex-1"
              label="Deny"
              variant="secondary"
              isDisabled={consent.isPending}
              onClick={() => consent.mutate(false)}
            />
          </div>
        </div>
      </Card>
      <Text color="secondary" size="sm" className="mt-6 text-center">
        You can revoke access at any time from your account settings.
      </Text>
    </div>
  );
}

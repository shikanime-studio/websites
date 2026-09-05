import { Banner } from "@astryxdesign/core/Banner";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { Heading } from "@astryxdesign/core/Heading";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { authClient } from "../lib/auth-client";

export const Route = createFileRoute("/consent")({
  component: Consent,
});

function readAuthorizationQuery() {
  const search = typeof window === "undefined" ? "" : window.location.search;
  const params = new URLSearchParams(search);
  const scope = params.get("scope");
  return {
    clientId: params.get("client_id"),
    scopes: scope ? scope.split(" ").filter(Boolean) : [],
  };
}

function Consent() {
  const [{ clientId, scopes }] = useState(readAuthorizationQuery);
  const [resolvedName, setResolvedName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(clientId !== null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(
    clientId === null
      ? "Missing client_id in the authorization request."
      : null,
  );

  const clientName = resolvedName ?? clientId;

  useEffect(() => {
    if (clientId === null) {
      return;
    }

    authClient.oauth2
      .publicClient({ query: { client_id: clientId } })
      .then((res) => {
        if (res.data) {
          setResolvedName(res.data.client_name ?? res.data.client_id);
        }
      })
      .catch(() => {
        // Fall back to showing the raw client_id.
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [clientId]);

  const submitConsent = (accept: boolean) => {
    setIsSubmitting(true);
    setError(null);
    authClient.oauth2
      .consent({ accept })
      .then((res) => {
        if (res.error) {
          setError(res.error.message ?? "Unable to complete the request.");
          setIsSubmitting(false);
          return;
        }
        if (res.data?.url) {
          window.location.href = res.data.url;
          return;
        }
        setIsSubmitting(false);
      })
      .catch(() => {
        setError("Unable to complete the request.");
        setIsSubmitting(false);
      });
  };

  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="flex flex-col gap-6 p-6">
          <div className="text-center">
            <Heading level={1}>Authorize access</Heading>
            <p className="mt-2 text-sm opacity-70">
              {isLoading ? (
                "Loading application details…"
              ) : (
                <>
                  <span className="font-semibold">
                    {clientName ?? "An application"}
                  </span>{" "}
                  wants to access your Shikanime Studio account.
                </>
              )}
            </p>
          </div>

          {scopes.length > 0 && (
            <div>
              <h2 className="mb-2 text-sm font-semibold opacity-80">
                This will allow it to:
              </h2>
              <ul className="list-inside list-disc space-y-1 text-sm opacity-80">
                {scopes.map((scope) => (
                  <li key={scope}>{scope}</li>
                ))}
              </ul>
            </div>
          )}

          {error && <Banner status="error" title={error} />}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              label="DENY"
              isDisabled={isSubmitting}
              onClick={() => {
                submitConsent(false);
              }}
            />
            <Button
              type="button"
              variant="primary"
              label={isSubmitting ? "WORKING" : "ALLOW"}
              isLoading={isSubmitting}
              onClick={() => {
                submitConsent(true);
              }}
            />
          </div>
        </div>
      </Card>
    </main>
  );
}

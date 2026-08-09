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
    clientId === null ? "Missing client_id in the authorization request." : null,
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
    <main className="flex min-h-dvh flex-col items-center justify-center p-4">
      <div className="card bg-base-100 w-full max-w-md shadow-xl">
        <div className="card-body gap-6">
          <div className="text-center">
            <h1 className="card-title justify-center text-xl font-bold">
              Authorize access
            </h1>
            <p className="mt-2 text-sm opacity-70">
              {isLoading
                ? "Loading application details…"
                : (
                    <>
                      <span className="font-semibold">
                        {clientName ?? "An application"}
                      </span>
                      {" "}
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
                {scopes.map(scope => (
                  <li key={scope}>{scope}</li>
                ))}
              </ul>
            </div>
          )}

          {error && (
            <div role="alert" className="alert alert-error text-sm">
              <span>{error}</span>
            </div>
          )}

          <div className="card-actions justify-end gap-2">
            <button
              type="button"
              className="btn btn-ghost rounded-full"
              onClick={() => {
                submitConsent(false);
              }}
              disabled={isSubmitting}
            >
              DENY
            </button>
            <button
              type="button"
              className="btn btn-primary rounded-full font-bold"
              onClick={() => {
                submitConsent(true);
              }}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? (
                    <>
                      <span className="loading loading-spinner loading-xs"></span>
                      WORKING
                    </>
                  )
                : (
                    "ALLOW"
                  )}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

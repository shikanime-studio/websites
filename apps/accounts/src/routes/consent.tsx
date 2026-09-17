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
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 px-4 py-24">
        <h1 className="text-secondary text-2xl font-black tracking-tight">
          Sign in required
        </h1>
        <p className="text-secondary/80 text-center text-base font-semibold">
          Sign in before approving access.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-24">
      <h1 className="text-secondary text-3xl font-black tracking-tight">
        Authorize application
      </h1>
      <p className="text-secondary/80 text-base font-semibold">
        <span className="text-secondary font-black">
          {clientId ?? "An application"}
        </span>{" "}
        wants to access your Shikanime Studio account.
      </p>
      {scopes.length > 0
        ? (
          <div className="border-border bg-body flex flex-col gap-2 rounded-2xl border-2 p-4">
            <p className="text-secondary text-sm font-black">
              It will be able to:
            </p>
            <ul className="text-secondary/80 list-disc pl-5 text-sm font-semibold">
              {scopes.map((s) => <li key={s}>{s}</li>)}
            </ul>
          </div>
        )
        : null}
      {error
        ? (
          <p className="text-accent text-sm font-bold" role="alert">
            {error}
          </p>
        )
        : null}
      <div className="flex gap-3">
        <button
          type="button"
          className="bg-accent text-on-accent inline-flex h-12 flex-1 items-center justify-center rounded-full px-8 text-base font-black"
          disabled={consent.isPending}
          onClick={() => consent.mutate(true)}
        >
          Allow
        </button>
        <button
          type="button"
          className="border-border text-secondary inline-flex h-12 flex-1 items-center justify-center rounded-full border-2 px-8 text-base font-black transition-colors hover:bg-surface"
          disabled={consent.isPending}
          onClick={() => consent.mutate(false)}
        >
          Deny
        </button>
      </div>
    </div>
  );
}

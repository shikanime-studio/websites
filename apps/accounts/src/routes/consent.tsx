import { Avatar } from "@astryxdesign/core/Avatar";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { Divider } from "@astryxdesign/core/Divider";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { useAtomValue } from "@effect/atom-react";
import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { Cause, Effect, Exit } from "effect";
import { getOrElse } from "effect/reactivity/AsyncResult";
import { AppWindow, Check } from "lucide-react";
import { useState } from "react";
import { sessionAtom } from "../lib/atoms";
import { describeScope } from "../lib/scopes";

const LEADING_QUESTION = /^\?/;

interface ConsentSearch {
  client_id?: string;
  scope?: string;
}

function parseConsentSearch(search: Record<string, unknown>): ConsentSearch {
  // Bracket access is required here: the incoming shape is an index-signature
  // record, so dot access trips tsc's TS4111.
  const client_id = search["client_id"];
  const scope = search["scope"];
  const parsed: ConsentSearch = {};
  if (typeof client_id === "string") {
    parsed.client_id = client_id;
  }
  if (typeof scope === "string") {
    parsed.scope = scope;
  }
  return parsed;
}

export const Route = createFileRoute("/consent")({
  component: ConsentPage,
  validateSearch: parseConsentSearch,
});

function ConsentPage() {
  const { client_id: clientId, scope } = useSearch({
    from: "/consent",
  });
  const session = getOrElse(useAtomValue(sessionAtom), () => null);
  const [error, setError] = useState<string | null>(null);

  const [pending, setPending] = useState(false);

  async function decide(accept: boolean) {
    setPending(true);
    setError(null);

    const program = Effect.gen(function* () {
      // The consent page's own query string is the signed authorization
      // request; the provider verifies its signature before recording the
      // decision, so forward it verbatim.
      const oauthQuery = window.location.search.replace(LEADING_QUESTION, "");
      if (!oauthQuery) {
        return yield* Effect.fail(new Error("Missing authorization request"));
      }
      const res = yield* Effect.tryPromise({
        try: () =>
          fetch("/api/auth/oauth2/consent", {
            method: "POST",
            headers: { "content-type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ accept, oauth_query: oauthQuery }),
          }),
        catch: () => new Error("Consent request failed"),
      });
      if (!res.ok) {
        return yield* Effect.fail(new Error(`Consent failed (${res.status})`));
      }
      const body = yield* Effect.tryPromise({
        try: () =>
          res.json() as Promise<{ redirect?: boolean; url?: string }>,
        catch: () => new Error("Invalid consent response"),
      });
      if (body.redirect !== true || typeof body.url !== "string") {
        return yield* Effect.fail(new Error("Missing redirect target"));
      }
      const target = new URL(body.url, window.location.origin);
      if (target.protocol !== "https:" && target.protocol !== "http:") {
        return yield* Effect.fail(new Error("Unsafe redirect target"));
      }
      window.location.assign(target.toString());
    });

    const exit = await Effect.runPromiseExit(
      program.pipe(Effect.ensuring(Effect.sync(() => setPending(false)))),
    );
    if (Exit.isFailure(exit)) {
      const error = Cause.squash(exit.cause);
      setError(error instanceof Error ? error.message : "Consent failed");
    }
  }

  const scopes = (scope ?? "").split(" ").filter(Boolean);
  const permissions = scopes.map((value) => ({
    value,
    label: describeScope(value),
  }));

  if (!session?.user) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col px-4 py-20 sm:py-28">
        <Card padding={6}>
          <div className="flex flex-col items-center gap-4 text-center">
            <Heading level={1} type="display-3">
              Sign in to continue
            </Heading>
            <Text color="secondary">
              An application is waiting for your approval.
            </Text>
            <Button
              label="Sign in"
              variant="primary"
              onClick={() => {
                window.location.assign(`/login${window.location.search}`);
              }}
            />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col px-4 py-20 sm:py-24">
      <Card padding={6}>
        <div className="flex flex-col items-center gap-5 text-center">
          <div className="flex items-center gap-3">
            <Avatar
              name={session.user.name ?? session.user.email ?? "User"}
              src={session.user.image ?? ""}
              size="lg"
            />
            <span className="text-secondary/40" aria-hidden>
              ·
            </span>
            <span className="border-border bg-surface text-secondary flex size-12 items-center justify-center rounded-2xl border">
              <AppWindow size={20} aria-hidden />
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <Heading level={1} type="display-3">
              Allow access?
            </Heading>
            <Text color="secondary" className="text-balance">
              <span className="text-primary font-semibold">
                {clientId ?? "An application"}
              </span>
              {" "}
              wants to use your Shikanime Studio account.
            </Text>
          </div>

          {permissions.length > 0
            ? (
              <ul className="bg-body flex w-full flex-col gap-2 rounded-xl p-4 text-left">
                {permissions.map((permission) => (
                  <li
                    key={permission.value}
                    className="flex items-start gap-2.5"
                  >
                    <Check
                      size={16}
                      aria-hidden
                      className="text-accent mt-0.5 shrink-0"
                    />
                    <Text size="sm">{permission.label}</Text>
                  </li>
                ))}
              </ul>
            )
            : null}

          {error
            ? (
              <Text color="accent" size="sm" weight="semibold" role="alert">
                {error}
              </Text>
            )
            : null}

          <Divider />

          <div className="flex w-full flex-col gap-2">
            <Button
              label="Allow"
              variant="primary"
              isDisabled={pending}
              onClick={() => { void decide(true); }}
            />
            <Button
              label="Not now"
              variant="secondary"
              isDisabled={pending}
              onClick={() => { void decide(false); }}
            />
          </div>
        </div>
      </Card>
      <Text size="sm" color="secondary" className="mt-6 text-center">
        You can remove access anytime in{" "}
        <Link
          to="/settings/security"
          className="hover:text-foreground font-medium transition-colors"
        >
          Apps and websites
        </Link>
        .
      </Text>
    </div>
  );
}

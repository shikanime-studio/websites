import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { count } from "drizzle-orm";
import { createD1Database } from "../lib/db";
import { users } from "../schema";

const countUsers = createServerFn().handler(async (): Promise<number> => {
  const db = createD1Database();
  const rows = await db.select({ value: count() }).from(users);
  return rows[0]?.value ?? 0;
});

export const Route = createFileRoute("/")({
  loader: () => countUsers(),
  component: HomePage,
});

const ENDPOINTS = [
  { name: "Discovery", path: "/.well-known/openid-configuration" },
  { name: "Authorization", path: "/oauth2/authorize" },
  { name: "Token", path: "/oauth2/token" },
];

function HomePage() {
  const userCount = Route.useLoaderData();

  return (
    <div className="mx-auto w-full max-w-5xl px-4">
      <div className="flex flex-col items-center gap-12 py-14 text-center sm:py-20">
        <section className="flex max-w-2xl flex-col items-center gap-4">
          <Heading level={1} type="display-1">
            One account for all of Shikanime Studio
          </Heading>
          <Text size="lg" color="secondary">
            Sign in once and move between every Shikanime Studio property
            without repeating yourself.
          </Text>
          <Button
            href="/login"
            label="Sign in"
            variant="primary"
            className="mt-2"
          />
        </section>

        <Card className="w-full text-left" padding={5}>
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Heading level={2}>For applications</Heading>
              <Text color="secondary">
                First-party clients authenticate through the standard OAuth 2.1
                authorization-code flow with OpenID Connect identity tokens.
              </Text>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {ENDPOINTS.map((endpoint) => (
                <div
                  key={endpoint.name}
                  className="bg-surface border-border flex flex-col gap-1 rounded-xl border p-4"
                >
                  <Text size="sm" weight="semibold">
                    {endpoint.name}
                  </Text>
                  <code className="text-secondary/70 text-xs break-all">
                    {endpoint.path}
                  </code>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card variant="muted" className="w-full" padding={4}>
          <Text color="secondary" size="sm">
            <span className="text-secondary font-bold">{userCount}</span>
            {" "}
            {userCount === 1 ? "identity" : "identities"}
            {" "}
            registered across the fleet.
          </Text>
        </Card>
      </div>
    </div>
  );
}

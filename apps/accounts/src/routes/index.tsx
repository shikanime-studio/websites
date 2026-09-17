import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { createD1Database } from "../lib/db";
import { users } from "../schema";

const countUsers = createServerFn().handler(async (): Promise<number> => {
  const db = createD1Database();
  const rows = await db.select({ id: users.id }).from(users);
  return rows.length;
});

export const Route = createFileRoute("/")({
  loader: () => countUsers(),
  component: HomePage,
});

function HomePage() {
  const userCount = Route.useLoaderData();

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="flex flex-col gap-12 py-10 sm:gap-16 sm:py-14">
        <section className="flex flex-col gap-7">
          <h1 className="text-secondary text-5xl leading-[1.05] font-black tracking-tight sm:text-6xl">
            One account for all of Shikanime Studio
          </h1>
          <p className="text-secondary/80 max-w-xl text-lg leading-relaxed font-semibold sm:text-xl">
            Sign in once and move between every Shikanime Studio property
            without repeating yourself.
          </p>
        </section>

        <section className="border-border bg-body flex flex-col gap-6 rounded-3xl border-2 p-8 shadow-sm">
          <div className="flex flex-col gap-3">
            <h2 className="text-secondary text-2xl font-black tracking-tight sm:text-3xl">
              For applications
            </h2>
            <p className="text-secondary/70 max-w-2xl text-lg font-semibold">
              First-party clients authenticate through the standard OAuth 2.1
              authorization-code flow with OpenID Connect identity tokens.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="border-border flex flex-col gap-1 rounded-2xl border-2 bg-white p-4">
              <div className="text-secondary text-sm font-black">
                Discovery
              </div>
              <code className="text-secondary/70 text-xs break-all">
                /.well-known/openid-configuration
              </code>
            </div>
            <div className="border-border flex flex-col gap-1 rounded-2xl border-2 bg-white p-4">
              <div className="text-secondary text-sm font-black">
                Authorization
              </div>
              <code className="text-secondary/70 text-xs break-all">
                /oauth2/authorize
              </code>
            </div>
            <div className="border-border flex flex-col gap-1 rounded-2xl border-2 bg-white p-4">
              <div className="text-secondary text-sm font-black">Token</div>
              <code className="text-secondary/70 text-xs break-all">
                /oauth2/token
              </code>
            </div>
          </div>
        </section>

        <section className="border-border bg-body flex flex-col gap-4 rounded-3xl border-2 border-dashed p-8">
          <h2 className="text-secondary text-2xl font-black tracking-tight sm:text-3xl">
            Fleet status
          </h2>
          <p className="text-secondary/70 text-lg font-semibold">
            {userCount}
            {" "}
            {userCount === 1 ? "identity" : "identities"} registered.
          </p>
        </section>
      </div>
    </div>
  );
}

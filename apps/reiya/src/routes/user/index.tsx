import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createAuth } from "../../lib/auth";
import { createD1Database } from "../../lib/db";

interface SessionUser {
  name: string;
  email: string;
  image?: string | null | undefined;
}

const getSessionUser = createServerFn().handler(
  async (): Promise<SessionUser | null> => {
    const request = getRequest();
    const db = createD1Database();
    const auth = createAuth(db);
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    if (!session?.user) {
      return null;
    }
    return {
      name: session.user.name,
      email: session.user.email,
      image: session.user.image,
    };
  },
);

export const Route = createFileRoute("/user/")({
  loader: () => getSessionUser(),
  component: UserPage,
});

function UserPage() {
  const user = Route.useLoaderData();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-secondary text-3xl font-bold">User Settings</h1>

      {user ? (
        <div className="bg-card border-border bg-body max-w-2xl rounded-lg border shadow-xl">
          <div className="flex flex-col gap-4 p-6">
            <div className="flex items-center gap-4">
              <div className="overflow-hidden rounded-full">
                <div className="w-24 rounded-full">
                  <img
                    src={
                      user.image ||
                      `https://ui-avatars.com/api/?name=${user.name}`
                    }
                    alt={user.name}
                    width={96}
                    height={96}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
              <div>
                <h2 className="text-secondary text-2xl font-bold">
                  {user.name}
                </h2>
                <p className="text-secondary/70">{user.email}</p>
              </div>
            </div>

            <div className="border-border border-t" />

            <div className="flex w-full flex-col gap-2">
              <label
                className="text-secondary text-sm font-medium"
                htmlFor="user-name"
              >
                Name
              </label>
              <input
                id="user-name"
                type="text"
                value={user.name}
                className="border-border bg-surface w-full rounded-md border px-3 py-2"
                disabled
              />
            </div>
            <div className="flex w-full flex-col gap-2">
              <label
                className="text-secondary text-sm font-medium"
                htmlFor="user-email"
              >
                Email
              </label>
              <input
                id="user-email"
                type="text"
                value={user.email}
                className="border-border bg-surface w-full rounded-md border px-3 py-2"
                disabled
              />
            </div>
          </div>
        </div>
      ) : (
        <div
          role="alert"
          className="border-warning bg-warning-muted text-on-warning rounded-md border px-4 py-3"
        >
          <span>You need to be logged in to view this page.</span>
        </div>
      )}
    </div>
  );
}

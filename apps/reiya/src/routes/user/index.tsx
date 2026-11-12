import { Avatar } from "@astryxdesign/core/Avatar";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { useToast } from "@astryxdesign/core/Toast";
import { PageShell } from "@shikanime-studio/design";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SquareArrowOutUpRight } from "lucide-react";
import { authClient } from "../../lib/auth-client";
import { ACCOUNTS_SITE } from "../../lib/config";

const rpcFetch = async <T,>(tag: string): Promise<T> => {
  if (import.meta.env.SSR) {
    const { getCategoriesRows, getSessionUserFor } =
      await import("../../rpc/handlers");
    const headers = new Headers();
    const value =
      tag === "getCategories"
        ? await getCategoriesRows()
        : await getSessionUserFor(headers);
    return value as T;
  }
  const res = await fetch("/rpc", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify([{ _tag: "Request", id: 1, tag, payload: undefined }]),
  });
  const batch: unknown = await res.json();
  const exit = (batch as Array<{ exit?: { value?: unknown } }>)[0]?.exit;
  return exit?.value as T;
};

type SessionRow = { name: string; email: string; image?: string | null } | null;

export const Route = createFileRoute("/user/")({
  loader: () => rpcFetch<SessionRow>("getSessionUser"),
  component: UserPage,
});

function UserPage() {
  const user = Route.useLoaderData();
  const toast = useToast();

  const signOut = () => {
    authClient
      .signOut({
        fetchOptions: {
          onSuccess: () => {
            window.location.href = "/";
          },
        },
      })
      .catch(() => {
        toast({ body: "Failed to sign out", type: "error" });
      });
  };

  return (
    <PageShell className="max-w-2xl">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-secondary text-2xl font-semibold tracking-tight">
          Your account
        </h1>
        <p className="text-secondary/70 text-sm">
          Reiya reads your identity from the Shikanime Studio Accounts Center.
        </p>
      </div>

      {user ? (
        <Card className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <Avatar name={user.name} size="lg" src={user.image ?? ""} />
            <div className="flex min-w-0 flex-col">
              <span className="text-secondary truncate text-lg font-semibold">
                {user.name}
              </span>
              <span className="text-secondary/70 truncate text-sm">
                {user.email}
              </span>
            </div>
          </div>

          <div className="border-border flex flex-col gap-3 border-t pt-5">
            <Button
              href={`${ACCOUNTS_SITE}/settings/profile`}
              icon={<SquareArrowOutUpRight className="size-4" />}
              label="Manage profile and security"
              variant="secondary"
            />
            <Button
              label="Sign out of Reiya"
              onClick={signOut}
              variant="ghost"
            />
            <p className="text-secondary/60 text-xs">
              Signing out here ends the Reiya session only. Your Accounts Center
              session stays alive for the other studio apps.
            </p>
          </div>
        </Card>
      ) : (
        <Card className="flex flex-col items-start gap-4">
          <p className="text-secondary text-sm">
            You are not signed in. Sign in with your studio account to follow
            artists and keep your lists in sync.
          </p>
          <Button href="/" label="Back to the gallery" variant="secondary" />
        </Card>
      )}

      <Link
        className="text-secondary/60 hover:text-secondary text-xs transition-colors"
        to="/privacy-notices"
      >
        How Reiya handles your data
      </Link>
    </PageShell>
  );
}

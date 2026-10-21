import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { AccountCenterLayout } from "../components/AccountCenterLayout";
import { createAuth } from "../lib/auth";
import { createD1Database } from "../lib/db";

const requireSession = createServerFn().handler(async (): Promise<boolean> => {
  const request = getRequest();
  const db = createD1Database();
  const auth = createAuth(db);
  const session = await auth.api.getSession({ headers: request.headers });
  return Boolean(session?.user);
});

export const Route = createFileRoute("/settings")({
  beforeLoad: async () => {
    const signedIn = await requireSession();
    if (!signedIn) {
      throw redirect({ to: "/login" });
    }
  },
  component: SettingsLayoutComponent,
});

function SettingsLayoutComponent() {
  return <AccountCenterLayout />;
}

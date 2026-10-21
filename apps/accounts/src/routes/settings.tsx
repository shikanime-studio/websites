import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { AccountCenterLayout } from "../components/AccountCenterLayout";
import { createAuth } from "../lib/auth";
import { createD1Database } from "../lib/db";

interface SettingsSessionUser {
  name: string;
  email: string;
}

const getSettingsSessionUser = createServerFn().handler(
  async (): Promise<SettingsSessionUser | null> => {
    const request = getRequest();
    const db = createD1Database();
    const auth = createAuth(db);
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return null;
    }
    return {
      name: session.user.name,
      email: session.user.email,
    };
  },
);

export const Route = createFileRoute("/settings")({
  beforeLoad: async () => {
    const user = await getSettingsSessionUser();
    if (!user) {
      throw redirect({ to: "/login" });
    }
  },
  component: SettingsLayoutComponent,
});

function SettingsLayoutComponent() {
  return <AccountCenterLayout title="Settings" />;
}

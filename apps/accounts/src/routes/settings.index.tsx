import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Avatar } from "@astryxdesign/core/Avatar";
import { Card } from "@astryxdesign/core/Card";
import { Divider } from "@astryxdesign/core/Divider";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ChevronRight,
  LogOut,
  Mail,
  ShieldCheck,
  Smartphone,
  SquareArrowOutUpRight,
  UserRound,
} from "lucide-react";
import { useSession } from "../hooks/useSession";
import { authClient } from "../lib/auth-client";

export const Route = createFileRoute("/settings/")({
  component: AccountsCenterPage,
});

interface RowProps {
  icon: LucideIcon;
  label: string;
  description: string;
  to?: "/settings/profile" | "/settings/security";
}

function RowIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className="bg-accent/10 text-accent flex size-10 shrink-0 items-center justify-center rounded-full">
      <Icon size={18} aria-hidden />
    </span>
  );
}

function SettingsRow({ icon, label, description, to }: RowProps) {
  const row = (
    <div className="flex items-center gap-4 px-4 py-3.5 sm:px-5">
      <RowIcon icon={icon} />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <Text weight="medium">{label}</Text>
        <Text size="sm" color="secondary" className="truncate">
          {description}
        </Text>
      </div>
      <ChevronRight size={18} aria-hidden className="text-secondary/50 shrink-0" />
    </div>
  );

  if (!to) {
    return row;
  }

  return (
    <Link
      to={to}
      className="hover:bg-body focus-visible:ring-accent/40 block transition-colors focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset"
    >
      {row}
    </Link>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-secondary px-1 pb-2 text-xs font-bold tracking-wider uppercase">
      {children}
    </h2>
  );
}

function AccountsCenterPage() {
  const { data: session } = useSession();

  async function handleSignOut() {
    await authClient.signOut();
    window.location.assign("/");
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <Heading level={1} type="display-2" className="font-display">
          Accounts Center
        </Heading>
        <Text size="lg" color="secondary">
          Your details, security, and connected apps — all in one place.
        </Text>
      </header>

      <Card padding={0} className="overflow-hidden">
        <div className="flex items-center gap-4 px-5 py-5">
          <Avatar
            name={session?.user?.name ?? session?.user?.email ?? "User"}
            src={session?.user?.image ?? ""}
            size="lg"
          />
          <div className="flex min-w-0 flex-col gap-1">
            <Text size="lg" weight="semibold">
              {session?.user?.name ?? "Your account"}
            </Text>
            <Text size="sm" color="secondary">
              {session?.user?.email ?? ""}
            </Text>
          </div>
        </div>
      </Card>

      <section className="flex flex-col gap-2">
        <SectionLabel>Personal details</SectionLabel>
        <Card padding={0} className="overflow-hidden">
          <SettingsRow
            icon={UserRound}
            label="Name"
            description={session?.user?.name ?? "Add your name"}
            to="/settings/profile"
          />
          <Divider className="ml-[4.25rem]" />
          <SettingsRow
            icon={Mail}
            label="Email"
            description={session?.user?.email ?? "Add your email"}
            to="/settings/profile"
          />
        </Card>
      </section>

      <section className="flex flex-col gap-2">
        <SectionLabel>Password and security</SectionLabel>
        <Card padding={0} className="overflow-hidden">
          <SettingsRow
            icon={ShieldCheck}
            label="Sign-in and security"
            description="How you sign in"
            to="/settings/security"
          />
          <Divider className="ml-[4.25rem]" />
          <SettingsRow
            icon={Smartphone}
            label="Where you're signed in"
            description="Active sessions"
            to="/settings/security"
          />
          <Divider className="ml-[4.25rem]" />
          <SettingsRow
            icon={SquareArrowOutUpRight}
            label="Apps and websites"
            description="Connected apps"
            to="/settings/security"
          />
        </Card>
      </section>

      <section className="flex flex-col gap-2">
        <SectionLabel>Your account</SectionLabel>
        <Card padding={0} className="overflow-hidden">
          <button
            type="button"
            onClick={handleSignOut}
            className="hover:bg-body flex w-full items-center gap-4 px-4 py-4 text-left transition-colors"
          >
            <RowIcon icon={LogOut} />
            <span className="flex flex-col">
              <Text weight="medium">Sign out</Text>
              <Text size="sm" color="secondary">
                Sign out of this device
              </Text>
            </span>
          </button>
        </Card>
      </section>
    </div>
  );
}

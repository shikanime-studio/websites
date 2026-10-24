import type { LucideIcon } from "lucide-react";
import { Avatar } from "@astryxdesign/core/Avatar";
import { Card } from "@astryxdesign/core/Card";
import { Divider } from "@astryxdesign/core/Divider";
import { Text } from "@astryxdesign/core/Text";
import { useAtomValue } from "@effect/atom-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { getOrElse } from "effect/reactivity/AsyncResult";
import {
  ChevronRight,
  MonitorSmartphone,
  ShieldCheck,
  SquareArrowOutUpRight,
} from "lucide-react";
import { STUDIO_APPS } from "../lib/apps";
import { sessionAtom } from "../lib/atoms";

export const Route = createFileRoute("/settings/")({
  component: AccountsCenterPage,
});

interface DetailRowProps {
  label: string;
  value: string;
  to: "/settings/profile" | "/settings/security";
  icon?: LucideIcon;
}

function DetailRow({ label, value, to, icon: Icon }: DetailRowProps) {
  return (
    <Link
      to={to}
      className="hover:bg-surface focus-visible:ring-accent/40 flex items-center gap-3 px-4 py-3 transition-colors focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset"
    >
      {Icon ? <Icon size={18} aria-hidden className="text-secondary shrink-0" /> : null}
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <Text size="sm" weight="semibold">
          {label}
        </Text>
        <Text size="sm" color="secondary" className="truncate">
          {value}
        </Text>
      </span>
      <ChevronRight size={18} aria-hidden className="text-secondary/70 shrink-0" />
    </Link>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-[15px] font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function AccountsCenterPage() {
  const session = getOrElse(useAtomValue(sessionAtom), () => null);
  const name = session?.user?.name ?? "Your account";
  const email = session?.user?.email ?? "";

  return (
    <div className="flex flex-col gap-8 pb-16">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-[26px] leading-tight font-semibold">
          Profiles and personal details
        </h1>
        <Text size="sm" color="secondary" className="max-w-xl">
          Review the profiles and personal details you have added to this
          Accounts Center.
        </Text>
      </header>

      <Section title="Profiles">
        <Card padding={0} className="overflow-hidden">
          <Link
            to="/settings/profile"
            className="hover:bg-surface flex items-center gap-3 px-4 py-3.5 transition-colors"
          >
            <Avatar name={name} src={session?.user?.image ?? ""} size="md" />
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <Text size="sm" weight="semibold" className="truncate">
                {name}
              </Text>
              <Text size="sm" color="secondary" className="truncate">
                {email}
              </Text>
            </span>
            <ChevronRight
              size={18}
              aria-hidden
              className="text-secondary/70 shrink-0"
            />
          </Link>
          <Divider />
          <Link
            to="/settings/profile"
            className="text-text-accent block px-4 py-3 text-sm font-semibold hover:underline"
          >
            Edit profile
          </Link>
        </Card>
      </Section>

      <Section title="Personal details">
        <Card padding={0} className="overflow-hidden">
          <DetailRow
            label="Contact info"
            value={email || "Add your email"}
            to="/settings/profile"
          />
          <Divider />
          <DetailRow
            label="Name"
            value={name}
            to="/settings/profile"
          />
        </Card>
      </Section>

      <Section title="Password and security">
        <Card padding={0} className="overflow-hidden">
          <DetailRow
            icon={ShieldCheck}
            label="Sign-in and security"
            value="How you sign in to your account"
            to="/settings/security"
          />
          <Divider />
          <DetailRow
            icon={MonitorSmartphone}
            label="Where you're signed in"
            value="Devices and active sessions"
            to="/settings/security"
          />
          <Divider />
          <DetailRow
            icon={SquareArrowOutUpRight}
            label="Apps and websites"
            value="Apps that can use your account"
            to="/settings/security"
          />
        </Card>
      </Section>

      <Section title="More from Shikanime Studio">
        <div className="grid gap-3 sm:grid-cols-2">
          {STUDIO_APPS.map((app) => (
            <a
              key={app.name}
              href={app.href}
              className="border-border hover:bg-surface focus-visible:ring-accent/40 flex items-center gap-3 rounded-xl border p-3 transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              <span className="bg-accent-muted text-text-accent flex size-10 shrink-0 items-center justify-center rounded-lg text-sm font-black">
                {app.name.slice(0, 1)}
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <Text size="sm" weight="semibold">
                  {app.name}
                </Text>
                <Text size="sm" color="secondary" className="truncate">
                  {app.tagline}
                </Text>
              </span>
              <SquareArrowOutUpRight
                size={15}
                aria-hidden
                className="text-secondary/60 shrink-0"
              />
            </a>
          ))}
        </div>
      </Section>
    </div>
  );
}

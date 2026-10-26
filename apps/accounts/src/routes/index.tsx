import type { LucideIcon } from "lucide-react";
import { Avatar } from "@astryxdesign/core/Avatar";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { Divider } from "@astryxdesign/core/Divider";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import {
  ChevronRight,
  Fingerprint,
  LayoutGrid,
  ShieldCheck,
  SquareArrowOutUpRight,
} from "lucide-react";
import { STUDIO_APPS } from "../lib/apps";
import { createAuth } from "../lib/auth";
import { createD1Database } from "../lib/db";

const isSignedIn = createServerFn().handler(async (): Promise<boolean> => {
  const request = getRequest();
  const db = createD1Database();
  const auth = createAuth(db);
  const session = await auth.api.getSession({ headers: request.headers });
  return Boolean(session?.user);
});

export const Route = createFileRoute("/")({
  loader: async () => {
    const signedIn = await isSignedIn();
    if (signedIn) {
      throw redirect({ to: "/settings" });
    }
    return null;
  },
  component: HomePage,
});

const FEATURES: Array<{ icon: LucideIcon, title: string, body: string }> = [
  {
    icon: Fingerprint,
    title: "One sign-in, everywhere",
    body: "The same identity follows you across every Shikanime Studio app and device.",
  },
  {
    icon: LayoutGrid,
    title: "Apps you choose",
    body: "See what you have connected and remove access whenever you change your mind.",
  },
  {
    icon: ShieldCheck,
    title: "Yours to control",
    body: "Update your name, review your sessions, and keep your account safe.",
  },
];

const PREVIEW_ROWS = ["Personal details", "Password and security", "Apps and websites"];

function AccountPreview() {
  return (
    <Card padding={0} className="shadow-black/5 w-full overflow-hidden shadow-xl">
      <div className="grid sm:grid-cols-[150px_minmax(0,1fr)]">
        <div className="bg-[var(--studio-cream)] hidden flex-col gap-1 border-r p-4 sm:flex">
          <div className="mb-3 flex items-center gap-2">
            <span className="bg-accent text-on-accent flex size-6 items-center justify-center rounded-md text-[10px] font-black">
              S
            </span>
            <Text size="sm" weight="semibold">
              Accounts
            </Text>
          </div>
          <span className="nav-pill-active rounded-lg px-2.5 py-2 text-[11px] font-semibold">
            Profiles
          </span>
          <span className="text-secondary px-2.5 py-2 text-[11px]">
            Password and security
          </span>
          <span className="text-secondary px-2.5 py-2 text-[11px]">
            Apps and websites
          </span>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-3 px-4 py-4">
            <Avatar name="Shikanime Deva" size="md" />
            <div className="flex min-w-0 flex-col">
              <Text size="sm" weight="semibold">
                Shikanime Deva
              </Text>
              <Text size="sm" color="secondary" className="truncate">
                william@shikanime.studio
              </Text>
            </div>
          </div>
          <Divider />
          <ul className="flex flex-col">
            {PREVIEW_ROWS.map((row) => (
              <li
                key={row}
                className="border-border flex items-center gap-3 border-b px-4 py-2.5 last:border-b-0"
              >
                <Text size="sm" className="flex-1">
                  {row}
                </Text>
                <ChevronRight
                  size={15}
                  aria-hidden
                  className="text-secondary/50"
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}

function HomePage() {
  return (
    <div className="pb-20">
      <section className="border-border border-b bg-[var(--studio-cream)]">
        <div className="studio-shell flex flex-col items-center gap-5 py-16 text-center sm:py-20">
          <span className="border-border bg-body flex items-center gap-2 rounded-full border py-1 pr-3 pl-1 text-xs font-semibold">
            <span className="bg-accent text-on-accent flex size-6 items-center justify-center rounded-full text-[10px] font-black">
              S
            </span>
            Shikanime Studio
          </span>
          <Heading
            level={1}
            type="display-1"
            className="font-display max-w-2xl text-balance"
          >
            One account, every Shikanime Studio app.
          </Heading>
          <Text size="lg" color="secondary" className="max-w-lg text-balance">
            Sign in once and every application knows who you are. Your details,
            your connected apps, and your security live in one place.
          </Text>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <Button href="/login" label="Continue" variant="primary" size="lg" />
            <Button
              href="https://shikanime.studio"
              label="Visit the studio"
              variant="secondary"
              size="lg"
            />
          </div>
        </div>
      </section>

      <div className="studio-shell grid items-center gap-12 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <AccountPreview />
        <ul className="flex flex-col gap-5">
          {FEATURES.map((feature) => (
            <li key={feature.title} className="flex items-start gap-3.5">
              <span className="bg-accent-muted text-text-accent flex size-9 shrink-0 items-center justify-center rounded-full">
                <feature.icon size={17} aria-hidden />
              </span>
              <div className="flex flex-col gap-1">
                <Text weight="semibold">{feature.title}</Text>
                <Text size="sm" color="secondary">
                  {feature.body}
                </Text>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <section className="studio-shell">
        <h2 className="pb-3 text-[15px] font-semibold">
          More from Shikanime Studio
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
      </section>
    </div>
  );
}

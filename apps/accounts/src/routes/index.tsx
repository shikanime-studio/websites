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
  Smartphone,
  UserRound,
} from "lucide-react";
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
    body: "See what you've connected and remove access whenever you change your mind.",
  },
  {
    icon: ShieldCheck,
    title: "Yours to control",
    body: "Update your name, review your sessions, and keep your account safe.",
  },
];

const PREVIEW_ROWS: Array<{ icon: LucideIcon, label: string }> = [
  { icon: UserRound, label: "Personal details" },
  { icon: ShieldCheck, label: "Password and security" },
  { icon: Smartphone, label: "Where you're signed in" },
];

function AccountPreview() {
  return (
    <Card
      padding={0}
      className="shadow-black/5 w-full overflow-hidden shadow-xl"
    >
      <div className="border-border flex items-center gap-2 border-b px-4 py-3">
        <span className="bg-accent text-on-accent flex size-6 items-center justify-center rounded-full text-[10px] font-black">
          S
        </span>
        <Text size="sm" weight="semibold">
          Accounts Center
        </Text>
      </div>
      <div className="flex items-center gap-3 px-4 py-4">
        <Avatar name="Shikanime Deva" size="lg" />
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
      <ul className="flex flex-col py-1">
        {PREVIEW_ROWS.map((row) => (
          <li key={row.label} className="flex items-center gap-3 px-4 py-2.5">
            <span className="bg-accent/10 text-accent flex size-8 items-center justify-center rounded-full">
              <row.icon size={15} aria-hidden />
            </span>
            <Text size="sm" className="flex-1">
              {row.label}
            </Text>
            <ChevronRight size={15} aria-hidden className="text-secondary/40" />
          </li>
        ))}
      </ul>
    </Card>
  );
}

function HomePage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
      <section className="grid items-center gap-12 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-24">
        <div className="flex flex-col items-start gap-5">
          <span className="bg-accent/10 text-accent flex items-center gap-2 rounded-full py-1 pr-3 pl-1 text-xs font-bold tracking-wide">
            <span className="bg-accent text-on-accent flex size-6 items-center justify-center rounded-full text-[10px] font-black">
              S
            </span>
            Shikanime Studio
          </span>
          <Heading
            level={1}
            type="display-1"
            className="font-display max-w-xl text-balance"
          >
            One account that follows you everywhere.
          </Heading>
          <Text size="lg" color="secondary" className="max-w-lg">
            Sign in once and every Shikanime Studio application knows who you
            are. Your details, your apps, and your security live in one place.
          </Text>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Button href="/login" label="Sign in" variant="primary" size="lg" />
            <Button
              href="#features"
              label="See what's inside"
              variant="secondary"
              size="lg"
            />
          </div>
        </div>
        <div className="relative">
          <AccountPreview />
        </div>
      </section>

      <section id="features" className="scroll-mt-20 pb-16">
        <div className="grid gap-4 sm:grid-cols-3">
          {FEATURES.map((feature) => (
            <Card key={feature.title} padding={5} className="h-full">
              <div className="flex h-full flex-col gap-3">
                <span className="bg-accent/10 text-accent flex size-10 items-center justify-center rounded-full">
                  <feature.icon size={18} aria-hidden />
                </span>
                <Heading level={2}>{feature.title}</Heading>
                <Text size="sm" color="secondary">
                  {feature.body}
                </Text>
              </div>
            </Card>
          ))}
        </div>
      </section>

    </div>
  );
}

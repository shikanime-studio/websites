import { Card } from "@astryxdesign/core/Card";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { OneTap } from "../components/OneTap";
import { useSession } from "../hooks/useSession";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { data: session } = useSession();
  const [error, setError] = useState<string | null>(null);

  if (session?.user) {
    return <SignedInNotice />;
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col px-4 py-20 sm:py-28">
      <Card padding={6}>
        <div className="flex flex-col items-center gap-6 text-center">
          <span className="bg-accent text-on-accent flex size-14 items-center justify-center rounded-2xl text-lg font-black">
            S
          </span>
          <div className="flex flex-col gap-2">
            <Heading level={1} type="display-3" className="font-display">
              Welcome back
            </Heading>
            <Text color="secondary">
              Sign in to your Shikanime Studio account.
            </Text>
          </div>
          {error
            ? (
              <Text color="accent" size="sm" weight="semibold" role="alert">
                {error}
              </Text>
            )
            : null}
          <OneTap onError={setError} />
        </div>
      </Card>
    </div>
  );
}

function SignedInNotice() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col px-4 py-20 sm:py-28">
      <Card padding={6}>
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="bg-accent text-on-accent flex size-12 items-center justify-center rounded-full text-sm font-black">
            S
          </span>
          <Heading level={1} type="display-3" className="font-display">
            You're signed in
          </Heading>
          <Text color="secondary">
            You can close this tab and return to the application you came from.
          </Text>
          <Link
            to="/settings"
            className="bg-surface border-border hover:bg-body mt-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors"
          >
            Open Accounts Center
          </Link>
        </div>
      </Card>
    </div>
  );
}

import { Card } from "@astryxdesign/core/Card";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { createFileRoute } from "@tanstack/react-router";
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
    <div className="mx-auto flex w-full max-w-md flex-col px-4 py-24">
      <Card padding={5}>
        <div className="flex flex-col items-center gap-5 text-center">
          <div className="bg-accent/10 text-accent flex h-12 w-12 items-center justify-center rounded-full text-xl font-black">
            S
          </div>
          <div className="flex flex-col gap-2">
            <Heading level={1}>Sign in</Heading>
            <Text color="secondary">
              One account for all of Shikanime Studio. Continue to the
              application that sent you here.
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
      <Text
        color="secondary"
        size="sm"
        className="mt-6 text-center"
      >
        Protected by Shikanime Studio SSO.
      </Text>
    </div>
  );
}

function SignedInNotice() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col px-4 py-24">
      <Card padding={5}>
        <div className="flex flex-col items-center gap-4 text-center">
          <Heading level={1}>You are signed in</Heading>
          <Text color="secondary">
            Return to the application that sent you here to finish connecting.
          </Text>
        </div>
      </Card>
    </div>
  );
}

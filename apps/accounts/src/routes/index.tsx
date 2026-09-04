import { Button } from "@astryxdesign/core/Button";
import { Heading } from "@astryxdesign/core/Heading";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-4">
      <Heading level={1}>Shikanime Studio Accounts</Heading>
      <p className="max-w-md text-center text-sm opacity-80">
        This is the Shikanime Studio identity provider. Use your account to sign
        in across shikanime.studio apps.
      </p>
      <Button variant="primary" label="SIGN IN" href="/sign-in" />
    </main>
  );
}

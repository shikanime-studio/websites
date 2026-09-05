import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { Heading } from "@astryxdesign/core/Heading";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { authClient } from "../lib/auth-client";

export const Route = createFileRoute("/sign-in")({
  component: SignIn,
});

function SignIn() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = () => {
    setIsLoading(true);
    setError(null);
    authClient.signIn
      .social({
        provider: "google",
        callbackURL: "/",
      })
      .catch(() => {
        setError("An error occurred during sign in");
        setIsLoading(false);
      });
  };

  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-6 p-6 text-center">
          <Heading level={1}>Sign in to Shikanime Studio</Heading>
          <p className="text-sm opacity-70">
            Use your Google account to continue.
          </p>
          <Button
            type="button"
            variant="primary"
            label="CONTINUE WITH GOOGLE"
            width="100%"
            isLoading={isLoading}
            onClick={handleSignIn}
          />
          <p className="text-xs opacity-50">
            One Tap may appear automatically. Or use the button above.
          </p>
          {error && (
            <p role="alert" className="text-sm text-(--color-error)">
              {error}
            </p>
          )}
        </div>
      </Card>
    </main>
  );
}

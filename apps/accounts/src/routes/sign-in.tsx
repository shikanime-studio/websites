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
    <main className="flex min-h-dvh flex-col items-center justify-center p-4">
      <div className="card bg-base-100 w-full max-w-sm shadow-xl">
        <div className="card-body items-center gap-6 text-center">
          <h1 className="card-title text-xl font-bold">
            Sign in to Shikanime Studio
          </h1>
          <p className="text-sm opacity-70">
            Use your Google account to continue.
          </p>
          <button
            type="button"
            className="btn btn-primary w-full rounded-full font-bold"
            onClick={handleSignIn}
            disabled={isLoading}
          >
            {isLoading
              ? (
                  <>
                    <span className="loading loading-spinner loading-xs"></span>
                    SIGNING IN
                  </>
                )
              : (
                  "CONTINUE WITH GOOGLE"
                )}
          </button>
          <p className="text-xs opacity-50">
            One Tap may appear automatically. Or use the button above.
          </p>
          {error && (
            <div role="alert" className="alert alert-error text-sm">
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

import { useState } from "react";
import { siGoogle } from "simple-icons";
import { authClient } from "../lib/auth-client";
import { AlertError } from "./AlertError";
import { Toast } from "./Toast";

export default function LoginButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = () => {
    setIsLoading(true);
    authClient.signIn
      .social({
        provider: "google",
        callbackURL: "/",
      })
      .catch(() => {
        setError("An error occurred during sign in");
        setIsLoading(false);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <>
      <button
        type="button"
        className="inline-flex items-center font-medium rounded-full px-4 font-bold"
        onClick={() => {
          handleSignIn();
        }}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <span
              className="h-3 w-3 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-current"
              role="status"
              aria-label="Loading"
            />
            SIGNING IN
          </>
        ) : (
          <>
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path d={siGoogle.path} />
            </svg>
            SIGN IN
          </>
        )}
      </button>
      {error && (
        <Toast
          duration={3000}
          onClose={() => {
            setError(null);
          }}
        >
          <AlertError
            onClose={() => {
              setError(null);
            }}
          >
            {error}
          </AlertError>
        </Toast>
      )}
    </>
  );
}

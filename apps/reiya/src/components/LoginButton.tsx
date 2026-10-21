import { Button } from "@astryxdesign/core/Button";
import { Spinner } from "@astryxdesign/core/Spinner";
import { useToast } from "@astryxdesign/core/Toast";
import { useState } from "react";
import { siGoogle } from "simple-icons";
import { authClient } from "../lib/auth-client";
import { showToast } from "./Toast";

export function LoginButton() {
  const [isLoading, setIsLoading] = useState(false);
  const toast = showToast(useToast());

  const handleSignIn = () => {
    setIsLoading(true);
    authClient.signIn
      .social({
        provider: "google",
        callbackURL: "/",
      })
      .catch(() => {
        toast("An error occurred during sign in");
        setIsLoading(false);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <>
      <Button
        variant="secondary"
        label="Sign in with Google"
        onClick={() => {
          handleSignIn();
        }}
        isDisabled={isLoading}
      >
        {isLoading ? (
          <>
            <Spinner size="sm" shade="inherit" aria-label="Signing in" />
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
      </Button>
    </>
  );
}

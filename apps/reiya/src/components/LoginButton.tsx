import { Button } from "@astryxdesign/core/Button";
import { Spinner } from "@astryxdesign/core/Spinner";
import { useToast } from "@astryxdesign/core/Toast";
import { useState } from "react";
import { siGoogle } from "simple-icons";
import { authClient } from "../lib/auth-client";

export function LoginButton() {
  const [pending, setPending] = useState<"accounts" | "google" | null>(null);
  const toast = useToast();

  const signIn = (provider: "accounts" | "google") => {
    setPending(provider);
    authClient.signIn
      .social({ provider, callbackURL: "/" })
      .catch(() => {
        toast({ body: "An error occurred during sign in", type: "error" });
        setPending(null);
      })
      .finally(() => {
        setPending(null);
      });
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="primary"
        label={pending === "accounts" ? "SIGNING IN" : "SIGN IN WITH STUDIO"}
        onClick={() => {
          signIn("accounts");
        }}
        isDisabled={pending !== null}
      >
        {pending === "accounts" ? (
          <>
            <Spinner size="sm" shade="inherit" aria-label="Signing in" />
            SIGNING IN
          </>
        ) : (
          <>SIGN IN WITH STUDIO</>
        )}
      </Button>
      <Button
        variant="ghost"
        label="SIGN IN WITH GOOGLE"
        size="sm"
        onClick={() => {
          signIn("google");
        }}
        isDisabled={pending !== null}
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
          <path d={siGoogle.path} />
        </svg>
        GOOGLE
      </Button>
    </div>
  );
}

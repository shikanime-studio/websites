import { Button } from "@astryxdesign/core/Button";
import { useToast } from "@astryxdesign/core/Toast";
import { useState } from "react";
import { authClient } from "../lib/auth-client";

/** The studio identity: one button, one Accounts Center, every app. */
export function SignInButton({ size = "sm" }: { size?: "sm" | "md" | "lg" }) {
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  return (
    <Button
      clickAction={() => {
        setIsLoading(true);
        return authClient.signIn
          .social({ provider: "accounts", callbackURL: "/" })
          .then(() => {
            setIsLoading(false);
          })
          .catch(() => {
            setIsLoading(false);
            toast({ body: "Could not reach the Accounts Center", type: "error" });
          });
      }}
      icon={
        <span className="flex size-4 items-center justify-center rounded-[4px] border border-current text-[9px] font-black">
          S
        </span>
      }
      isLoading={isLoading}
      label="Sign in"
      size={size}
      variant="primary"
    />
  );
}

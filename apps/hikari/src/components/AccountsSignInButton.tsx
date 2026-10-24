import { Button } from "@astryxdesign/core/Button";
import { useTranslator } from "@astryxdesign/core/i18n";
import { useState } from "react";
import { authClient } from "../lib/auth-client";

/** Sign in through the studio Accounts Center, the shared identity. */
export function AccountsSignInButton({
  size = "lg",
  variant = "primary",
  label,
}: {
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "ghost";
  label?: string;
}) {
  const t = useTranslator();
  const [isLoading, setIsLoading] = useState(false);

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
          });
      }}
      icon={
        <span className="flex size-4 items-center justify-center rounded-[4px] bg-current text-[9px] font-black text-[var(--hk-surface)]">
          S
        </span>
      }
      isLoading={isLoading}
      label={
        isLoading
          ? t("nav.signingIn")
          : (label ?? "Continue with Shikanime Studio")
      }
      size={size}
      variant={variant}
    />
  );
}

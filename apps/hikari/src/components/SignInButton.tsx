import { Button } from "@astryxdesign/core/Button";
import { useState } from "react";
import { siGoogle } from "simple-icons";
import { useI18n } from "../i18n/useI18n";
import { authClient } from "../lib/auth-client";

type Variant = "primary" | "secondary" | "ghost";

const ASTRYX_VARIANT = {
  primary: "primary",
  secondary: "secondary",
  ghost: "ghost",
} as const;

const SKIN: Record<Variant, string> = {
  primary: "",
  secondary: "hk-btn-outline",
  ghost: "",
};

export function SignInButton({
  variant = "primary",
  size = "md",
  label,
  withIcon = true,
  className = "",
}: {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
  label?: string;
  withIcon?: boolean;
  className?: string;
}) {
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Button
      className={`${SKIN[variant]} ${className}`.trim()}
      clickAction={() => {
        setIsLoading(true);
        return authClient.signIn
          .social({ provider: "google", callbackURL: "/" })
          .then(() => {
            setIsLoading(false);
          })
          .catch(() => {
            setIsLoading(false);
          });
      }}
      icon={
        withIcon ? (
          <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
            <path d={siGoogle.path} />
          </svg>
        ) : undefined
      }
      isLoading={isLoading}
      label={isLoading ? t("nav.signingIn") : (label ?? t("landing.ctaPrimary"))}
      size={size}
      variant={ASTRYX_VARIANT[variant]}
    />
  );
}

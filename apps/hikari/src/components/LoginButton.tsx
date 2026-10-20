import { Button } from "@astryxdesign/core/Button";
import { Spinner } from "@astryxdesign/core/Spinner";
import { useState } from "react";
import { siGoogle } from "simple-icons";
import { useI18n } from "../i18n/useI18n";
import { authClient } from "../lib/auth-client";

export function LoginButton() {
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useI18n();

  return (
    <Button
      variant="secondary"
      label={t("nav.signIn")}
      onClick={() => {
        setIsLoading(true);
        authClient.signIn
          .social({
            provider: "google",
            callbackURL: "/",
          })
          .catch(() => {
            setIsLoading(false);
          });
      }}
      isDisabled={isLoading}
    >
      {isLoading ? (
        <Spinner size="sm" shade="inherit" aria-label={t("nav.signingIn")} />
      ) : (
        <svg className="h-4 w-4" viewBox="0 0 24 24">
          <path d={siGoogle.path} />
        </svg>
      )}
      {t("nav.signIn").toUpperCase()}
    </Button>
  );
}

import { Button } from "@astryxdesign/core/Button";
import { useQueryClient } from "@tanstack/react-query";
import { useI18n } from "../i18n/useI18n";
import { authClient } from "../lib/auth-client";

export function LogoutButton() {
  const queryClient = useQueryClient();
  const { t } = useI18n();

  return (
    <Button
      variant="ghost"
      label={t("nav.signOut")}
      size="sm"
      onClick={() => {
        authClient.signOut().then(() => {
          queryClient.clear();
        });
      }}
    />
  );
}

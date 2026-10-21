import { IconButton } from "@astryxdesign/core/IconButton";
import { useQueryClient } from "@tanstack/react-query";
import { useI18n } from "../i18n/useI18n";
import { authClient } from "../lib/auth-client";
import { LogOut } from "./icons";

export function LogoutButton() {
  const queryClient = useQueryClient();
  const { t } = useI18n();

  return (
    <IconButton
      clickAction={async () => {
        await authClient.signOut();
        queryClient.clear();
      }}
      icon={<LogOut />}
      label={t("nav.signOut")}
      size="sm"
      tooltip={t("nav.signOut")}
      variant="ghost"
    />
  );
}

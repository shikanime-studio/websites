import { IconButton } from "@astryxdesign/core/IconButton";
import { useAtomRefresh } from "@effect/atom-react";
import { useI18n } from "../i18n/useI18n";
import {
  commissionsAtom,
  notificationsAtom,
  sessionAtom,
} from "../lib/atoms";
import { authClient } from "../lib/auth-client";
import { LogOut } from "./icons";

export function LogoutButton() {
  const refreshSession = useAtomRefresh(sessionAtom);
  const refreshCommissions = useAtomRefresh(commissionsAtom);
  const refreshNotifications = useAtomRefresh(notificationsAtom);
  const { t } = useI18n();

  return (
    <IconButton
      clickAction={async () => {
        await authClient.signOut();
        refreshSession();
        refreshCommissions();
        refreshNotifications();
      }}
      icon={<LogOut />}
      label={t("nav.signOut")}
      size="sm"
      tooltip={t("nav.signOut")}
      variant="ghost"
    />
  );
}

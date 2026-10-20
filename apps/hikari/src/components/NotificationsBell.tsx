import { Button } from "@astryxdesign/core/Button";
import { useState } from "react";
import { markRead, useNotifications } from "../hooks/useSession";
import { useI18n } from "../i18n/useI18n";

export function NotificationsBell() {
  const { t } = useI18n();
  const { data: notifications } = useNotifications();
  const [open, setOpen] = useState(false);
  const unread = (notifications ?? []).filter((n) => !n.isRead);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        label={t("nav.notifications")}
        size="sm"
        isIconOnly
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        🔔
        {unread.length > 0 ? (
          <span className="bg-accent text-secondary absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold">
            {unread.length}
          </span>
        ) : null}
      </Button>
      {open ? (
        <div className="bg-body border-border absolute right-0 z-50 mt-2 w-80 rounded-xl border p-2 shadow-lg">
          {notifications && notifications.length > 0 ? (
            <ul className="flex flex-col gap-1">
              {notifications.slice(0, 8).map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={`hover:bg-surface w-full rounded-lg p-2 text-left ${item.isRead ? "opacity-60" : ""}`}
                    onClick={() => {
                      markRead(item.id).catch(() => {});
                      setOpen(false);
                    }}
                  >
                    <span className="text-secondary block text-sm font-semibold">
                      {isNotificationKey(item.type) ? t(item.type) : item.title}
                    </span>
                    <span className="text-secondary/70 block text-xs">
                      {item.message}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-secondary/60 p-4 text-center text-sm">
              {t("notif.empty")}
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}

const NOTIFICATION_KEYS = [
  "notif.commission_requested",
  "notif.commission_accepted",
  "notif.commission_scheduled",
  "notif.commission_completed",
  "notif.commission_delivered",
  "notif.photos_added",
  "notif.photos_ready",
] as const;

type NotificationKey = (typeof NOTIFICATION_KEYS)[number];

function isNotificationKey(type: string): type is NotificationKey {
  return NOTIFICATION_KEYS.includes(`notif.${type}` as NotificationKey);
}

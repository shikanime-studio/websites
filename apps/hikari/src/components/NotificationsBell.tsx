import type { MessageKey } from "../i18n/messages";
import type { NotificationList } from "../lib/types";
import { Card } from "@astryxdesign/core/Card";
import { IconButton } from "@astryxdesign/core/IconButton";
import { useAtomRefresh, useAtomValue } from "@effect/atom-react";
import { Effect } from "effect";
import { getOrElse } from "effect/reactivity/AsyncResult";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "../i18n/useI18n";
import { markNotificationRead } from "../lib/api";
import { notificationsAtom } from "../lib/atoms";
import { Bell, Check } from "./icons";

export function NotificationsBell() {
  const { t } = useI18n();
  const refreshNotifications = useAtomRefresh(notificationsAtom);

  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const notifications = getOrElse(useAtomValue(notificationsAtom), () => []);
  const markRead = (id: number) => {
    Effect.runPromise(markNotificationRead(id)).catch(() => {});
  };
  const unread = notifications.filter((item) => !item.isRead);

  useEffect(() => {
    if (!open) {
      return;
    }
    function handlePointerDown(event: PointerEvent) {
      const target = event.target;
      if (
        containerRef.current &&
        target instanceof Node &&
        !containerRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  async function markAllRead(items: NotificationList) {
    await Promise.all(items.filter((item) => !item.isRead).map((item) => markRead(item.id)));
    refreshNotifications();
  }

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <IconButton
          aria-expanded={open}
          icon={<Bell />}
          label={t("nav.notifications")}
          onClick={() => {
            setOpen((current) => !current);
          }}
          size="sm"
          tooltip={t("nav.notifications")}
          variant="ghost"
        />
        {unread.length > 0 ? (
          <span
            className="text-ink pointer-events-none absolute top-0 right-0 flex size-4 items-center justify-center rounded-full text-[9px] font-bold"
            style={{ background: "var(--hk-signal)" }}
          >
            {unread.length > 9 ? "9+" : unread.length}
          </span>
        ) : null}
      </div>

      {open ? (
        <Card
          className="absolute right-0 z-50 mt-2 w-[min(92vw,344px)] overflow-hidden"
          elevation="med"
          padding={0}
        >
          <div className="border-hairline flex items-center justify-between border-b px-4 py-3">
            <div>
              <p className="text-ink text-[13.5px] font-semibold">
                {t("notif.title")}
              </p>
              <p className="text-ink-faint text-[11.5px]">
                {unread.length > 0
                  ? t("notif.unread", { count: String(unread.length) })
                  : t("notif.empty")}
              </p>
            </div>
            {unread.length > 0 ? (
              <button
                className="text-brand text-[11.5px] font-semibold hover:underline"
                onClick={() => {
                  markAllRead(notifications ?? []).catch(() => {});
                }}
                type="button"
              >
                {t("notif.markAllRead")}
              </button>
            ) : null}
          </div>

          {notifications && notifications.length > 0 ? (
            <ul className="max-h-[320px] overflow-y-auto p-1.5">
              {notifications.slice(0, 8).map((item) => {
                const key = notificationKey(item.type);
                return (
                  <li key={item.id}>
                    <button
                      className={`hover:bg-paper-muted flex w-full items-start gap-2.5 rounded-xl p-2.5 text-left transition-colors ${
                        item.isRead ? "opacity-55" : ""
                      }`}
                      onClick={() => {
                        markRead(item.id);
                        setOpen(false);
                      }}
                      type="button"
                    >
                      <span
                        className="mt-1.5 size-1.5 shrink-0 rounded-full"
                        style={{
                          background: item.isRead
                            ? "var(--hk-line-strong)"
                            : "var(--hk-accent)",
                        }}
                      />
                      <span className="min-w-0">
                        <span className="text-ink block text-[12.5px] font-semibold">
                          {key ? t(key) : item.title}
                        </span>
                        <span className="text-ink-soft mt-0.5 block truncate text-[11.5px]">
                          {item.message}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="px-4 py-8 text-center">
              <span
                className="text-ink-soft mx-auto flex size-9 items-center justify-center rounded-full"
                style={{ background: "var(--hk-surface-muted)" }}
              >
                <Check size={16} />
              </span>
              <p className="text-ink-soft mt-2 text-[12.5px]">
                {t("notif.empty")}
              </p>
            </div>
          )}
        </Card>
      ) : null}
    </div>
  );
}

const NOTIFICATION_KEYS: Readonly<Record<string, MessageKey>> = {
  commission_requested: "notif.commission_requested",
  commission_accepted: "notif.commission_accepted",
  commission_scheduled: "notif.commission_scheduled",
  commission_completed: "notif.commission_completed",
  commission_delivered: "notif.commission_delivered",
  photos_added: "notif.photos_added",
  photos_ready: "notif.photos_ready",
};

function notificationKey(type: string): MessageKey | null {
  return NOTIFICATION_KEYS[type] ?? null;
}

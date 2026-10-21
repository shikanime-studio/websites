import { useAtomValue } from "@effect/atom-react";
import { Link } from "@tanstack/react-router";
import { getOrElse } from "effect/reactivity/AsyncResult";
import { useI18n } from "../i18n/useI18n";
import { sessionAtom } from "../lib/atoms";
import { HikariMark } from "./icons";
import { LanguagePicker } from "./LanguagePicker";
import { LogoutButton } from "./LogoutButton";
import { NotificationsBell } from "./NotificationsBell";
import { SignInButton } from "./SignInButton";

export function Navbar() {
  const session = getOrElse(useAtomValue(sessionAtom), () => null);
  const { t } = useI18n();
  return (
    <header
      className="border-hairline sticky top-0 z-50 border-b backdrop-blur-xl"
      style={{
        background:
          "color-mix(in oklab, var(--hk-canvas) 92%, transparent)",
      }}
    >
      <div className="hk-shell flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-7">
          <Link
            className="group flex items-center gap-2.5"
            to="/"
            aria-label="Hikari"
          >
            <HikariMark className="transition-transform duration-300 group-hover:-rotate-6" />
            <span className="hk-display text-ink text-[19px] font-semibold tracking-[-0.03em]">
              Hikari
            </span>
          </Link>

          {session ? (
            <nav className="hidden items-center gap-1 md:flex">
              <Link
                className="text-ink-soft hover:text-ink hover:bg-[color-mix(in_oklab,var(--hk-ink)_5%,transparent)] rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors"
                to="/"
              >
                {t("nav.commissions")}
              </Link>
            </nav>
          ) : null}
        </div>

        <div className="flex items-center gap-1">
          <LanguagePicker />
          {session ? (
            <>
              <NotificationsBell />
              <LogoutButton />
            </>
          ) : (
            <SignInButton
              className="ml-1"
              label={t("nav.signIn")}
              size="sm"
              variant="secondary"
              withIcon={false}
            />
          )}
        </div>
      </div>
    </header>
  );
}

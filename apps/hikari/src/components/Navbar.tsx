import { Link } from "@tanstack/react-router";
import { useSession } from "../hooks/useSession";
import { useI18n } from "../i18n/useI18n";
import { LanguagePicker } from "./LanguagePicker";
import { LoginButton } from "./LoginButton";
import { LogoutButton } from "./LogoutButton";
import { NotificationsBell } from "./NotificationsBell";

export function Navbar() {
  const { data: session } = useSession();
  const { t } = useI18n();

  return (
    <nav className="bg-body border-border fixed top-0 z-50 flex w-full items-center justify-between border-b px-4 py-2 lg:px-6">
      <div className="flex items-center gap-6">
        <Link
          to="/"
          className="text-secondary flex items-center gap-2 text-xl font-bold tracking-tight transition-opacity hover:opacity-80"
        >
          Hikari
        </Link>
        {session ? (
          <Link
            to="/commissions/new"
            className="text-secondary/70 hover:text-secondary hover:bg-surface hidden items-center rounded-full px-3 py-1.5 font-medium transition-colors md:flex"
          >
            {t("nav.newCommission")}
          </Link>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        <LanguagePicker />
        {session ? (
          <>
            <NotificationsBell />
            <LogoutButton />
          </>
        ) : (
          <LoginButton />
        )}
      </div>
    </nav>
  );
}

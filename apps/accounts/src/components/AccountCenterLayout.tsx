import { Avatar } from "@astryxdesign/core/Avatar";
import { useTranslator } from "@astryxdesign/core/i18n";
import { Text } from "@astryxdesign/core/Text";
import { Link, Outlet, useMatchRoute } from "@tanstack/react-router";
import { useSession } from "../hooks/useSession";
import { authClient } from "../lib/auth-client";

interface AccountCenterLayoutProps {
  title: string;
}

export function AccountCenterLayout({ title }: AccountCenterLayoutProps) {
  const t = useTranslator();
  const { data: session } = useSession();
  const matchRoute = useMatchRoute();

  const navItems = [
    {
      to: "/settings/profile",
      label: t("accounts.center.profile"),
      key: "profile",
    },
    {
      to: "/settings/security",
      label: t("accounts.center.securityEmail"),
      key: "security",
    },
  ] as const;

  async function handleSignOut() {
    await authClient.signOut();
    window.location.assign("/");
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <div className="flex flex-col gap-3 pb-8">
        <Text size="sm" color="secondary">
          {t("accounts.center.title")}
        </Text>
        <div className="flex items-center gap-4">
          {session?.user
            ? (
              <Avatar
                name={session.user.name ?? session.user.email}
                src={session.user.image ?? ""}
                size="lg"
              />
            )
            : null}
          <div className="flex flex-col">
            <Text size="xl" weight="bold">
              {title}
            </Text>
            {session?.user
              ? (
                <Text color="secondary" size="sm">
                  {session.user.email}
                </Text>
              )
              : null}
          </div>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-[220px_1fr]">
        <nav aria-label={t("accounts.center.title")} className="md:border-border md:border-r md:pr-4">
          <ul className="flex flex-row gap-1 md:flex-col">
            {navItems.map((item) => {
              const active = matchRoute({ to: item.to, fuzzy: true });
              return (
                <li key={item.key} className="md:last:border-b-0 border-b md:border-0">
                  <Link
                    to={item.to}
                    aria-current={active ? "page" : undefined}
                    className={
                      active
                        ? "text-secondary bg-surface block rounded-lg px-3 py-2 text-sm font-semibold"
                        : "hover:text-secondary text-secondary/70 block rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                    }
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
            <li className="md:mt-4 md:border-0">
              <button
                type="button"
                onClick={handleSignOut}
                className="hover:text-secondary text-secondary/70 block w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors"
              >
                {t("accounts.center.signOut")}
              </button>
            </li>
          </ul>
        </nav>
        <div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

import type { LucideIcon } from "lucide-react";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { CircleUserRound, LogOut, ShieldCheck } from "lucide-react";
import { authClient } from "../lib/auth-client";

interface NavItem {
  to: "/settings" | "/settings/security";
  label: string;
  icon: LucideIcon;
  isActive: (pathname: string) => boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    to: "/settings",
    label: "Profiles and personal details",
    icon: CircleUserRound,
    isActive: (pathname) =>
      pathname === "/settings" || pathname.startsWith("/settings/profile"),
  },
  {
    to: "/settings/security",
    label: "Password and security",
    icon: ShieldCheck,
    isActive: (pathname) => pathname.startsWith("/settings/security"),
  },
];

export function AccountCenterLayout() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  async function handleSignOut() {
    await authClient.signOut();
    window.location.assign("/");
  }

  return (
    <div className="studio-page">
      <div className="studio-shell">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-16">
        <nav aria-label="Accounts Center" className="min-w-0 lg:sticky lg:top-10 lg:self-start">
          <div className="hidden flex-col gap-3 lg:flex">
            <Link
              to="/"
              className="flex w-fit items-center gap-2.5 transition-opacity hover:opacity-80"
            >
              <span className="bg-accent text-on-accent flex size-7 items-center justify-center rounded-lg text-xs font-black">
                S
              </span>
              <span className="text-sm font-semibold tracking-tight">
                Shikanime Studio
              </span>
            </Link>
            <h2 className="font-display mt-2 text-[26px] leading-tight font-semibold">
              Accounts Center
            </h2>
            <p className="text-secondary text-sm leading-relaxed">
              Manage your connected experiences and account settings across
              Shikanime Studio apps.
            </p>
            <a
              href="https://shikanime.studio"
              className="text-text-accent w-fit text-sm font-semibold hover:underline"
            >
              Learn more
            </a>
          </div>

          <p className="font-display mb-3 text-xl font-semibold lg:hidden">
            Accounts Center
          </p>

          <div className="mt-0 lg:mt-8">
            <p className="text-secondary hidden px-3 pb-2 text-[13px] font-bold lg:block">
              Account settings
            </p>
            <ul className="flex flex-wrap gap-2 pb-1 lg:flex-col lg:flex-nowrap lg:gap-0.5 lg:pb-0">
              {NAV_ITEMS.map((item) => {
                const active = item.isActive(pathname);
                return (
                  <li key={item.to} className="shrink-0 lg:shrink">
                    <Link
                      to={item.to}
                      aria-current={active ? "page" : undefined}
                      className={
                        active
                          ? "nav-pill-active flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold lg:w-full"
                          : "text-foreground hover:bg-surface flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors lg:w-full"
                      }
                    >
                      <item.icon
                        size={18}
                        aria-hidden
                        className={active ? "" : "text-secondary"}
                      />
                      <span className="whitespace-nowrap">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
              <li className="shrink-0 lg:mt-6 lg:shrink lg:border-t lg:border-border lg:pt-4">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="text-secondary hover:text-foreground flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-medium transition-colors lg:w-full"
                >
                  <LogOut size={18} aria-hidden className="text-secondary" />
                  <span className="whitespace-nowrap">Sign out</span>
                </button>
              </li>
            </ul>
          </div>
        </nav>

          <div className="min-w-0">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

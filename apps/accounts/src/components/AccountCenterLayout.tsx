import type { LucideIcon } from "lucide-react";
import { Link, Outlet, useMatchRoute } from "@tanstack/react-router";
import {
  LayoutGrid,
  LogOut,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { authClient } from "../lib/auth-client";

interface NavItem {
  to: "/settings" | "/settings/profile" | "/settings/security";
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: "/settings", label: "Overview", icon: LayoutGrid, exact: true },
  { to: "/settings/profile", label: "Personal details", icon: UserRound },
  { to: "/settings/security", label: "Password and security", icon: ShieldCheck },
];

export function AccountCenterLayout() {
  const matchRoute = useMatchRoute();

  async function handleSignOut() {
    await authClient.signOut();
    window.location.assign("/");
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="grid gap-8 md:grid-cols-[232px_minmax(0,1fr)] md:gap-12">
        <nav aria-label="Account Center" className="hidden md:sticky md:top-24 md:block md:self-start">
          <ul className="flex flex-wrap gap-2 md:flex-col md:flex-nowrap md:gap-1">
            {NAV_ITEMS.map((item) => {
              const active = Boolean(
                matchRoute({ to: item.to, fuzzy: !item.exact }),
              );
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    aria-current={active ? "page" : undefined}
                    className={
                      active
                        ? "border-border bg-surface flex items-center gap-3 rounded-full border px-3.5 py-2 text-sm font-semibold shadow-sm md:rounded-xl md:px-3 md:py-2.5"
                        : "text-secondary hover:text-foreground flex items-center gap-3 rounded-full px-3.5 py-2 text-sm font-medium transition-colors md:rounded-xl md:px-3 md:py-2.5"
                    }
                  >
                    <item.icon
                      size={18}
                      aria-hidden
                      className={active ? "text-accent" : "text-secondary/70"}
                    />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
            <li className="hidden md:mt-6 md:block md:border-t md:border-border md:pt-4">
              <button
                type="button"
                onClick={handleSignOut}
                className="text-secondary hover:text-foreground flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors"
              >
                <LogOut size={18} aria-hidden className="text-secondary/70" />
                Sign out
              </button>
            </li>
          </ul>
        </nav>
        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

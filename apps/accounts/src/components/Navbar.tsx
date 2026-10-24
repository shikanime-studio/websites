import { Avatar } from "@astryxdesign/core/Avatar";
import { Button } from "@astryxdesign/core/Button";
import { Link, useMatchRoute } from "@tanstack/react-router";
import { useSession } from "../hooks/useSession";

export function Navbar() {
  const { data: session } = useSession();
  const matchRoute = useMatchRoute();
  const onLogin = Boolean(matchRoute({ to: "/login" }));

  return (
    <header className="bg-body/85 border-border fixed top-0 z-50 w-full border-b backdrop-blur">
      <nav className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link
          to="/"
          className="flex items-center gap-2.5 text-[15px] font-bold tracking-tight transition-opacity hover:opacity-80"
        >
          <span className="bg-accent/10 text-accent flex size-7 items-center justify-center rounded-full text-xs font-black">
            S
          </span>
          Accounts
        </Link>
        {session?.user
          ? (
            <Link
              to="/settings"
              className="hover:bg-surface flex items-center gap-2 rounded-full py-1 pr-3 pl-1 transition-colors"
            >
              <Avatar
                name={session.user.name ?? session.user.email ?? "User"}
                src={session.user.image ?? ""}
                size="sm"
              />
              <span className="hidden text-sm font-medium sm:inline">
                {session.user.name ?? session.user.email}
              </span>
            </Link>
          )
          : onLogin
          ? null
          : (
            <Button href="/login" label="Sign in" variant="primary" size="sm" />
          )}
      </nav>
    </header>
  );
}

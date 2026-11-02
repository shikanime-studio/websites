import { Avatar } from "@astryxdesign/core/Avatar";
import { Button } from "@astryxdesign/core/Button";
import { useAtomValue } from "@effect/atom-react";
import { StudioHeader } from "@shikanime-studio/design";
import { Link, useMatchRoute, useRouterState } from "@tanstack/react-router";
import { getOrElse } from "effect/reactivity/AsyncResult";
import { sessionAtom } from "../lib/atoms";

const MARK = (
  <span className="bg-accent text-on-accent flex size-8 items-center justify-center rounded-lg text-xs font-black">
    S
  </span>
);

export function Navbar() {
  const session = getOrElse(useAtomValue(sessionAtom), () => null);
  const matchRoute = useMatchRoute();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const onLogin = Boolean(matchRoute({ to: "/login" }));
  const user = session?.user;

  return (
    <StudioHeader
      actions={
        user
          ? (
            <Link
              className="hover:bg-surface flex items-center gap-2 rounded-full py-1 pr-3 pl-1 transition-colors"
              to="/settings"
            >
              <Avatar
                name={user.name ?? user.email ?? "User"}
                size="sm"
                src={user.image ?? ""}
              />
              <span className="hidden text-sm font-medium sm:inline">
                {user.name ?? user.email}
              </span>
            </Link>
          )
          : onLogin
          ? null
          : <Button href="/login" label="Sign in" size="sm" variant="primary" />
      }
      brand={{ name: "Accounts", href: "/", mark: MARK }}
      links={[
        { href: "/settings", label: "Your account", active: pathname.startsWith("/settings") },
      ]}
      renderLink={({ href, className, children, ...rest }) => (
        <Link className={className} to={href} {...rest}>
          {children}
        </Link>
      )}
    />
  );
}

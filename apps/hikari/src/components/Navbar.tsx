import { useTranslator } from "@astryxdesign/core/i18n";
import { useAtomValue } from "@effect/atom-react";
import { StudioHeader } from "@shikanime-studio/design";
import { Link, useRouterState } from "@tanstack/react-router";
import { getOrElse } from "effect/reactivity/AsyncResult";
import { sessionAtom } from "../lib/atoms";
import { HikariMark } from "./icons";
import { LanguagePicker } from "./LanguagePicker";
import { LogoutButton } from "./LogoutButton";
import { NotificationsBell } from "./NotificationsBell";
import { SignInButton } from "./SignInButton";

/** Hikari's slice of the shared band: language, notifications, session. */
export function Navbar() {
  const session = getOrElse(useAtomValue(sessionAtom), () => null);
  const t = useTranslator();
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <StudioHeader
      actions={
        <>
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
        </>
      }
      brand={{
        name: "Hikari",
        href: "/",
        mark: <HikariMark className="studio-brand__mark" />,
      }}
      links={
        session
          ? [{ href: "/", label: t("nav.commissions"), active: pathname === "/" }]
          : []
      }
      renderLink={({ href, className, children, ...rest }) => (
        <Link className={className} to={href} {...rest}>
          {children}
        </Link>
      )}
    />
  );
}

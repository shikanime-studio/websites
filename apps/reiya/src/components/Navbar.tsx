import { Avatar } from "@astryxdesign/core/Avatar";
import { DropdownMenu } from "@astryxdesign/core/DropdownMenu";
import { useToast } from "@astryxdesign/core/Toast";
import { useAtomValue } from "@effect/atom-react";
import { StudioHeader } from "@shikanime-studio/design";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { getOrElse } from "effect/reactivity/AsyncResult";
import { Menu, Search } from "lucide-react";
import { useState } from "react";
import Logo from "../assets/logo.png";
import { sessionAtom } from "../lib/atoms";
import { authClient } from "../lib/auth-client";
import { SignInButton } from "./SignInButton";

/** Reiya's slice of the shared header: a search field, two menus and the
 *  studio identity. Everything structural comes from the design package. */
export function Navbar() {
  const session = getOrElse(useAtomValue(sessionAtom), () => null);
  const navigate = useNavigate();
  const toast = useToast();
  const [query, setQuery] = useState("");
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    void navigate({
      to: "/explore",
      search: trimmed.length > 0 ? { q: trimmed } : {},
    });
  };

  const signOut = () => {
    authClient
      .signOut({
        fetchOptions: {
          onSuccess: () => {
            window.location.href = "/";
          },
        },
      })
      .catch(() => {
        toast({ body: "Failed to sign out", type: "error" });
      });
  };

  const moreItems = [
    {
      label: "Privacy notices",
      onClick: () => void navigate({ to: "/privacy-notices" }),
    },
  ];

  return (
    <StudioHeader
      actions={
        <>
          <div className="hidden md:block">
            <DropdownMenu
              alignment="end"
              button={{ label: "More", variant: "ghost", size: "sm" }}
              items={moreItems}
            />
          </div>

          {session
            ? (
              <DropdownMenu
                alignment="end"
                button={{
                  label: session.user?.name ?? "Your account",
                  variant: "ghost",
                  size: "sm",
                  icon: (
                    <Avatar
                      name={session.user?.name ?? session.user?.email ?? "You"}
                      size="sm"
                      src={session.user?.image ?? ""}
                    />
                  ),
                }}
                items={[
                  {
                    label: session.user?.name ?? "Your account",
                    description: session.user?.email ?? undefined,
                    onClick: () => void navigate({ to: "/user" }),
                  },
                  { type: "divider" },
                  { label: "Sign out", onClick: signOut },
                ]}
              />
            )
            : <SignInButton />}
        </>
      }
      brand={{ name: "Reiya", href: "/", mark: <img alt="" className="studio-brand__mark" height={32} src={Logo} width={32} /> }}
      center={
        <form
          action="/explore"
          className="w-full max-w-xs"
          method="get"
          onSubmit={submitSearch}
          role="search"
        >
          <div className="relative">
            <Search
              aria-hidden
              className="text-secondary/60 pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
            />
            <input
              aria-label="Search merch, artists, characters and conventions"
              className="border-border bg-surface text-secondary placeholder:text-secondary/50 focus:border-accent h-10 w-full rounded-full border pr-3 pl-9 text-sm transition-colors focus:outline-none"
              name="q"
              onChange={(event) => {
                setQuery(event.target.value);
              }}
              placeholder="Search merch, artists, conventions"
              type="search"
              value={query}
            />
          </div>
        </form>
      }
      links={[
        { href: "/explore", label: "Explore", active: pathname.startsWith("/explore") },
        ...(session
          ? [{ href: "/following", label: "Following", active: pathname.startsWith("/following") }]
          : []),
      ]}
      menu={
        <DropdownMenu
          alignment="end"
          button={{
            label: "Menu",
            variant: "ghost",
            size: "sm",
            icon: <Menu className="size-4" />,
          }}
          items={[
            { label: "Explore", onClick: () => void navigate({ to: "/explore" }) },
            ...(session
              ? [
                { label: "Following", onClick: () => void navigate({ to: "/following" }) },
                { label: "Your profile", onClick: () => void navigate({ to: "/user" }) },
              ]
              : []),
            {
              label: "Privacy notices",
              onClick: () => void navigate({ to: "/privacy-notices" }),
            },
          ]}
        />
      }
      renderLink={({ href, className, children, ...rest }) => (
        <Link className={className} to={href} {...rest}>
          {children}
        </Link>
      )}
    />
  );
}

import { Avatar } from "@astryxdesign/core/Avatar";
import { DropdownMenu } from "@astryxdesign/core/DropdownMenu";
import { useToast } from "@astryxdesign/core/Toast";
import { useAtomValue } from "@effect/atom-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { getOrElse } from "effect/reactivity/AsyncResult";
import { Menu, Search } from "lucide-react";
import { useState } from "react";
import Logo from "../assets/logo.png";
import { sessionAtom } from "../lib/atoms";
import { authClient } from "../lib/auth-client";
import { SignInButton } from "./SignInButton";

const NAV_LINK =
  "text-secondary hover:bg-surface rounded-full px-3 py-1.5 text-sm font-medium transition-colors";

/** One 64px band, one accent, one menu component — the same navigation surface
 *  as Accounts and Hikari, so moving between studio apps feels like one place. */
export function Navbar() {
  const session = getOrElse(useAtomValue(sessionAtom), () => null);
  const navigate = useNavigate();
  const toast = useToast();
  const [query, setQuery] = useState("");

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

  return (
    <header className="bg-body/85 border-border sticky top-0 z-50 border-b backdrop-blur-xl">
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center gap-2 px-4 sm:px-6">
        <Link
          className="flex shrink-0 items-center gap-2 text-[17px] font-bold tracking-tight transition-opacity hover:opacity-80"
          to="/"
        >
          <img
            alt=""
            className="size-8 rounded-lg object-cover"
            height={32}
            src={Logo}
            width={32}
          />
          <span className="font-display">Reiya</span>
        </Link>

        <div className="ml-3 hidden items-center gap-1 md:flex">
          <Link className={NAV_LINK} to="/explore">
            Explore
          </Link>
          {session
            ? (
              <Link className={NAV_LINK} to="/following">
                Following
              </Link>
            )
            : null}
        </div>

        {/* Progressive enhancement: before hydration this is a plain GET to
            /explore, afterwards the router owns the transition. */}
        <form
          action="/explore"
          className="relative ml-auto hidden w-full max-w-xs lg:block"
          method="get"
          onSubmit={submitSearch}
          role="search"
        >
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
        </form>

        <div className="ml-auto flex items-center gap-1">
          <div className="md:hidden">
            <DropdownMenu
              alignment="end"
              button={{
                label: "Menu",
                variant: "ghost",
                size: "sm",
                icon: <Menu className="size-4" />,
              }}
              items={[
                {
                  label: "Explore",
                  onClick: () => void navigate({ to: "/explore" }),
                },
                ...(session
                  ? [
                    {
                      label: "Following",
                      onClick: () => void navigate({ to: "/following" }),
                    },
                    {
                      label: "Your profile",
                      onClick: () => void navigate({ to: "/user" }),
                    },
                  ]
                  : []),
                {
                  label: "Privacy notices",
                  onClick: () => void navigate({ to: "/privacy-notices" }),
                },
              ]}
            />
          </div>

          <div className="hidden md:block">
            <DropdownMenu
              alignment="end"
              button={{ label: "More", variant: "ghost", size: "sm" }}
              items={[
                {
                  label: "Privacy notices",
                  onClick: () => void navigate({ to: "/privacy-notices" }),
                },
              ]}
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
        </div>
      </nav>
    </header>
  );
}

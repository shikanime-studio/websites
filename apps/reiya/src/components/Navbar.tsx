// icons removed to simplify UI and drop react-icons
import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import Logo from "../assets/logo.png";
import { useSession } from "../hooks/useSession";
import { LoginButton } from "./LoginButton";
import { LogoutButton } from "./LogoutButton";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-body border-border fixed top-0 z-50 flex w-full items-center justify-between border-b px-4 lg:px-6">
      {/* Navbar Start */}
      <div className="flex items-center">
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="text-secondary flex items-center gap-2 text-xl font-bold tracking-tight transition-opacity hover:opacity-80"
          >
            <img
              src={Logo}
              className="h-8 w-auto"
              alt="Reiya Logo"
              width={32}
              height={32}
            />
            Reiya
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {session ? (
              <Link
                to="/following"
                className="text-secondary/70 hover:text-secondary hover:bg-surface flex items-center rounded-full px-3 py-1.5 font-medium transition-colors"
              >
                Following
              </Link>
            ) : null}
            <Link
              to="/explore"
              className="text-secondary/70 hover:text-secondary hover:bg-surface flex items-center rounded-full px-3 py-1.5 font-medium transition-colors"
            >
              Explore
            </Link>

            <div className="group relative">
              <button
                type="button"
                className="text-secondary/70 hover:text-secondary hover:bg-surface flex items-center rounded-full px-3 py-1.5 text-sm font-medium transition-colors"
              >
                More
              </button>
              <ul className="bg-body border-border invisible absolute right-0 z-50 mt-1 w-52 rounded-lg border p-2 opacity-0 shadow-md transition-all group-hover:visible group-hover:opacity-100">
                <li>
                  <Link to="/privacy-notices">Privacy Notices</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Navbar Center */}
      <div className="hidden max-w-2xl flex-1 justify-center px-4 lg:flex">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search for a character, license, artist, or convention"
            className="bg-surface focus:ring-accent/20 h-10 w-full rounded-full border-none pr-4 pl-10 text-sm transition-all focus:ring-2 focus:outline-none"
          />
          <div className="text-secondary/50 absolute top-1/2 left-3.5 -translate-y-1/2">
            <span className="text-xs">🔎</span>
          </div>
        </div>
      </div>

      {/* Navbar End */}
      <div className="flex items-center justify-end gap-2">
        {/* Icons */}
        {session ? (
          <>
            <button
              type="button"
              className="text-secondary/80 hover:bg-surface flex h-9 w-9 items-center justify-center rounded-full transition-colors"
            >
              <span className="sr-only">Messages</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
                />
              </svg>
            </button>

            <button
              type="button"
              className="text-secondary/80 hover:bg-surface relative flex h-9 w-9 items-center justify-center rounded-full transition-colors"
            >
              <span className="sr-only">Notifications</span>
              <span className="bg-accent border-body absolute top-2 right-2 h-2 w-2 rounded-full border-2 p-0" />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
                />
              </svg>
            </button>
          </>
        ) : null}

        {/* CTA Button */}
        <button
          type="button"
          className="hidden items-center rounded-full bg-[var(--color-accent)] px-4 font-bold text-[var(--color-on-accent)] shadow-sm transition-all hover:shadow-md sm:flex"
        >
          + Share
        </button>

        {/* User Menu / Login */}
        <div className="flex items-center pl-1">
          {session ? (
            <div className="group relative">
              <button
                type="button"
                className="hover:bg-surface flex h-10 w-10 items-center justify-center rounded-full transition-colors"
              >
                <div className="w-10 rounded-full">
                  <Image
                    src={
                      session.user?.image ||
                      `https://ui-avatars.com/api/?name=${session.user?.name}`
                    }
                    alt={`${session.user?.name} Avatar`}
                    width={40}
                    height={40}
                    layout="constrained"
                    className="h-full w-full object-cover"
                  />
                </div>
              </button>
              <ul className="bg-body border-border invisible absolute right-0 z-50 mt-1 w-52 rounded-lg border p-2 opacity-0 shadow-md transition-all group-hover:visible group-hover:opacity-100">
                <li>
                  <Link to="/user">User</Link>
                </li>
                <div className="border-border my-1 border-t" />
                <li>
                  <LogoutButton />
                </li>
              </ul>
            </div>
          ) : (
            <LoginButton />
          )}
        </div>
      </div>
    </nav>
  );
}

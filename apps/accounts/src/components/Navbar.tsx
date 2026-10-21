import { Avatar } from "@astryxdesign/core/Avatar";
import { Link } from "@tanstack/react-router";
import { useSession } from "../hooks/useSession";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-body border-border fixed top-0 z-50 flex h-14 w-full items-center justify-between border-b px-4 lg:px-6">
      <Link
        to="/"
        className="text-secondary flex items-center gap-2.5 text-lg font-bold tracking-tight transition-opacity hover:opacity-80"
      >
        <span className="bg-accent/10 text-accent flex size-7 items-center justify-center rounded-full text-xs font-black">
          S
        </span>
        Accounts
      </Link>
      {session?.user
        ? (
          <div className="flex items-center gap-3">
            <span className="text-secondary/70 hidden text-sm font-medium sm:inline">
              {session.user.name ?? session.user.email}
            </span>
            <Avatar
              name={session.user.name ?? session.user.email ?? "User"}
              src={session.user.image ?? ""}
              size="sm"
            />
          </div>
        )
        : (
          <Link to="/login" className="hover:text-secondary text-secondary/70 text-sm font-medium transition-colors">
            Sign in
          </Link>
        )}
    </nav>
  );
}

import { Link } from "@tanstack/react-router";
import { useSession } from "../hooks/useSession";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-body border-border fixed top-0 z-50 flex w-full items-center justify-between border-b px-4 lg:px-6">
      <div className="flex items-center gap-6">
        <Link
          to="/"
          className="text-secondary flex items-center gap-2 text-xl font-bold tracking-tight transition-opacity hover:opacity-80"
        >
          Accounts
        </Link>
      </div>
      <div className="text-secondary/70 flex items-center gap-3 text-sm font-medium">
        {session ? (
          <span>{session.user?.name ?? session.user?.email}</span>
        ) : (
          <Link to="/login" className="hover:text-secondary transition-colors">
            Sign in
          </Link>
        )}
      </div>
    </nav>
  );
}

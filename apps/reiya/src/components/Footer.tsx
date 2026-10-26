import { Link } from "@tanstack/react-router";
import Logo from "../assets/logo.png";

const LINK =
  "text-secondary/70 hover:text-secondary text-sm transition-colors";

/** Same footer band as the rest of the studio: mark on the left, the small
 *  set of real destinations in the middle, the year on the right. */
export function Footer() {
  return (
    <footer className="border-border mt-auto border-t">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-2">
          <img
            alt=""
            className="size-6 rounded-full object-cover"
            height={24}
            src={Logo}
            width={24}
          />
          <span className="font-display text-[15px] font-semibold tracking-tight">
            Reiya
          </span>
        </div>

        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <a
            className={LINK}
            href="https://shikanime.studio"
            rel="noreferrer"
            target="_blank"
          >
            Shikanime Studio ↗
          </a>
          <a
            className={LINK}
            href="https://accounts.shikanime.studio"
            rel="noreferrer"
            target="_blank"
          >
            Accounts ↗
          </a>
          <Link className={LINK} to="/privacy-notices">
            Privacy
          </Link>
        </nav>

        <p className="text-secondary/60 text-xs">
          © {new Date().getFullYear()} Shikanime Studio
        </p>
      </div>
    </footer>
  );
}

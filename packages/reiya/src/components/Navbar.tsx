import logo from "../assets/logo.png";
import {
  BsBoxArrowRight,
  BsInstagram,
  BsFillPersonVcardFill,
} from "react-icons/bs";
import SignInButton from "./SignInButton";
import SignOutButton from "./SignOutButton";
import auth from "../lib/auth";

function getServerSession() {
  return null;
}
function NavbarStart() {
  return (
    <div className="flex items-center justify-start">
      <a href="/" className="ml-2 flex md:mr-24">
        <img
          src={logo.src}
          className="mr-3 h-8"
          alt="Cosplay Garden Logo"
          width={32}
          height={32}
        />
        <span className="self-center whitespace-nowrap text-xl font-semibold sm:text-2xl">
          Cosplay Garden
        </span>
      </a>
    </div>
  );
}

function NavbarCenter() {
  return <div className="flex items-center justify-center"></div>;
}

async function NavbarEnd() {
  const session = await getServerSession(auth);
  return (
    <div className="flex items-center">
      <div className="ml-3 flex items-center">
        <div>{session ? <UserMenu /> : <SignInMenu />}</div>
      </div>
    </div>
  );
}

async function UserMenu() {
  const session = await getServerSession(auth);
  return (
    <div className="dropdown dropdown-end">
      <label tabIndex={0} className="avatar btn btn-circle btn-ghost btn-sm">
        {session?.user?.image && (
          <div className="rounded-full">
            <img
              src={session.user.image}
              alt={`${
                session?.user?.name ?? session?.user?.email ?? "Me"
              } Avatar`}
              width={32}
              height={32}
            />
          </div>
        )}
      </label>
      <ul
        tabIndex={0}
        className="menu dropdown-content z-50 w-52 rounded-box bg-base-100 p-2 shadow"
      >
        <li>
          <a href="/account">
            <BsFillPersonVcardFill />
            Account
          </a>
        </li>
        <li>
          <SignOutButton>
            <BsBoxArrowRight />
            Logout
          </SignOutButton>
        </li>
      </ul>
    </div>
  );
}

function SignInMenu() {
  return (
    <SignInButton className="btn btn-sm">
      <BsInstagram />
      Sign in
    </SignInButton>
  );
}

export default function Navbar() {
  return (
    <nav className="fixed top-0 z-50 w-full border-b border-base-200 bg-base-100">
      <div className="px-3 py-3 lg:px-5 lg:pl-3">
        <div className="flex items-center justify-between">
          <NavbarStart />
          <NavbarCenter />
          <NavbarEnd />
        </div>
      </div>
    </nav>
  );
}

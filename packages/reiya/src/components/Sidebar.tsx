import {
  BsBellFill,
  BsHouseFill,
  BsLifePreserver,
  BsLock,
  BsSendFill,
} from "react-icons/bs";
import NextLink from "next/link";

type SidebarItemProps = {
  href: string;
  label: string;
  children: React.ReactNode;
};

function SidebarItem({ href, label, children }: SidebarItemProps) {
  return (
    <li>
      <NextLink href={href} className="flex items-center p-2">
        {children}
        <span className="ml-3">{label}</span>
      </NextLink>
    </li>
  );
}

function SidebarPrimaryMenu() {
  return (
    <ul className="flex flex-col gap-2 font-medium">
      <SidebarItem href="/" label="Home">
        <BsHouseFill />
      </SidebarItem>
      <SidebarItem href="https://forms.gle/2uYf78xCByBFa3ec9" label="Requests">
        <BsSendFill />
      </SidebarItem>
    </ul>
  );
}

function SidebarSecondaryMenu() {
  return (
    <ul className="flex flex-col gap-2 pt-4 font-medium">
      <SidebarItem href="https://forms.gle/69v3nkmt8NXJctvP6" label="Feedback">
        <BsLifePreserver />
      </SidebarItem>
      <NextLink href="/privacy-notices">
        <SidebarItem href="/privacy-notices" label="Privacy">
          <BsLock />
        </SidebarItem>
      </NextLink>
    </ul>
  );
}

function SidebarInfo() {
  return (
    <div id="dropdown-cta" className="rounded-lg bg-secondary p-4" role="alert">
      <div className="mb-3 flex items-center">
        <div className="badge badge-primary mr-2 rounded px-2.5 py-0.5 text-sm font-semibold">
          Notice
        </div>
      </div>
      <p className="mb-3 text-sm">
        Cosplay Garden is still in the early stages of development. If you would
        like to be included in the list of makers, please contact us via the
        request form.
      </p>
    </div>
  );
}

function SideBarCopyright() {
  return (
    <div className="text-xs text-neutral">
      <p>
        Made with{" "}
        <span role="img" aria-label="heart">
          ❤️
        </span>{" "}
        by <a href="https://shikanime.studio">Shikanime Studio</a>
      </p>
    </div>
  );
}

export default function Sidebar() {
  return (
    <aside
      id="logo-sidebar"
      className="fixed left-0 top-0 z-40  h-screen w-64 -translate-x-full border-r border-base-200 bg-base-100 pt-14 transition-transform sm:translate-x-0"
      aria-label="Sidebar"
    >
      <div className="flex h-full flex-col gap-6 overflow-y-auto px-3 py-4">
        <div className="flex grow flex-col gap-4 divide-y divide-base-200">
          <SidebarPrimaryMenu />
          <SidebarSecondaryMenu />
          <SidebarInfo />
        </div>
        <div>
          <SideBarCopyright />
        </div>
      </div>
    </aside>
  );
}

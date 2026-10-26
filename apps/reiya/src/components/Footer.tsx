import { StudioFooter } from "@shikanime-studio/design";
import { Link } from "@tanstack/react-router";
import Logo from "../assets/logo.png";

export function Footer() {
  return (
    <StudioFooter
      brand={{
        name: "Reiya",
        href: "/",
        mark: <img alt="" className="studio-brand__mark" height={24} src={Logo} width={24} />,
      }}
      links={[
        { href: "https://shikanime.studio", label: "Shikanime Studio ↗", external: true },
        { href: "https://accounts.shikanime.studio", label: "Accounts ↗", external: true },
        { href: "/privacy-notices", label: "Privacy" },
      ]}
      note={`© ${String(new Date().getFullYear())} Shikanime Studio`}
      renderLink={({ href, className, children, ...rest }) =>
        href.startsWith("http")
          ? (
            <a className={className} href={href} {...rest}>
              {children}
            </a>
          )
          : (
            <Link className={className} to={href} {...rest}>
              {children}
            </Link>
          )}
    />
  );
}

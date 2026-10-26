import type { ReactNode } from "react";
import { Fragment } from "react";

export interface StudioHeaderLink {
  href: string;
  label: string;
  active?: boolean;
}

/** Lets each app keep its own router for internal navigation. */
export interface RenderLinkProps {
  href: string;
  className?: string;
  children: ReactNode;
  "aria-label"?: string;
  "aria-current"?: "page";
  target?: string;
  rel?: string;
}

export type RenderLink = (props: RenderLinkProps) => ReactNode;

const anchor: RenderLink = ({ href, className, children, ...rest }) => (
  <a className={className} href={href} {...rest}>
    {children}
  </a>
);

export interface StudioHeaderProps {
  brand: {
    name: string;
    href: string;
    /** A square mark: image, monogram or SVG. */
    mark?: ReactNode;
  };
  links?: StudioHeaderLink[];
  /** Sits between the links and the actions: search, status, a picker. */
  center?: ReactNode;
  /** Right-hand cluster: language, notifications, account, sign-in. */
  actions?: ReactNode;
  /** Small-screen stand-in for `links`, usually a dropdown menu. */
  menu?: ReactNode;
  density?: "regular" | "compact";
  renderLink?: RenderLink;
}

/**
 * The one header band in the studio: same height, same hairline, same rhythm
 * of brand → links → center → actions, in every app.
 */
export function StudioHeader({
  brand,
  links = [],
  center,
  actions,
  menu,
  density = "regular",
  renderLink = anchor,
}: StudioHeaderProps) {
  return (
    <header
      className={
        density === "compact"
          ? "studio-header studio-header--compact"
          : "studio-header"
      }
    >
      <div className="studio-shell studio-header__bar">
        {renderLink({
          href: brand.href,
          className: "studio-brand",
          "aria-label": brand.name,
          children: (
            <>
              {brand.mark}
              <span>{brand.name}</span>
            </>
          ),
        })}

        {links.length > 0 ? (
          <nav aria-label={brand.name} className="studio-header__links">
            {links.map((link) => (
              <Fragment key={link.href}>
                {renderLink({
                  href: link.href,
                  className: "studio-nav-link",
                  children: link.label,
                  ...(link.active ? { "aria-current": "page" as const } : {}),
                })}
              </Fragment>
            ))}
          </nav>
        ) : null}

        {center ? <div className="studio-header__center">{center}</div> : null}

        <div className="studio-header__actions">{actions}</div>

        {menu ? <div className="studio-header__menu">{menu}</div> : null}
      </div>
    </header>
  );
}

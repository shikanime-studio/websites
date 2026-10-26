import type { ReactNode } from "react";
import type { RenderLink } from "./StudioHeader";
import { Fragment } from "react";

export interface StudioFooterLink {
  href: string;
  label: string;
  external?: boolean;
}

export interface StudioFooterProps {
  brand: {
    name: string;
    href: string;
    mark?: ReactNode;
  };
  links?: StudioFooterLink[];
  note?: string;
  renderLink?: RenderLink;
}

const anchor: RenderLink = ({ href, className, children, ...rest }) => (
  <a className={className} href={href} {...rest}>
    {children}
  </a>
);

/** The footer that closes every page: mark, the few real destinations, the year. */
export function StudioFooter({
  brand,
  links = [],
  note,
  renderLink = anchor,
}: StudioFooterProps) {
  return (
    <footer className="studio-footer">
      <div className="studio-shell studio-footer__inner">
        {renderLink({
          href: brand.href,
          className: "studio-brand",
          children: (
            <>
              {brand.mark}
              <span>{brand.name}</span>
            </>
          ),
        })}

        {links.length > 0 ? (
          <nav
            aria-label={`${brand.name} footer`}
            className="studio-footer__links"
          >
            {links.map((link) => (
              <Fragment key={link.href}>
                {renderLink({
                  href: link.href,
                  className: "studio-footer__link",
                  children: link.label,
                  ...(link.external
                    ? { target: "_blank", rel: "noreferrer" }
                    : {}),
                })}
              </Fragment>
            ))}
          </nav>
        ) : null}

        {note ? <p className="studio-footer__note">{note}</p> : null}
      </div>
    </footer>
  );
}

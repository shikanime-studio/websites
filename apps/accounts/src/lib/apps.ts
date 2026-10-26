export interface StudioApp {
  name: string;
  tagline: string;
  href: string;
}

/** The public face of the studio, linked from the Accounts Center the way
 *  Meta points at its own products from "More from Meta". */
export const STUDIO_APPS: StudioApp[] = [
  {
    name: "Hikari",
    tagline: "Commission a project",
    href: "https://hikari.shikanime.studio",
  },
  {
    name: "Reiya",
    tagline: "Selected work",
    href: "https://reiya.shikanime.studio",
  },
  {
    name: "Fade",
    tagline: "Local RAW darkroom",
    href: "https://fade.shikanime.studio",
  },
  {
    name: "Links",
    tagline: "Everything we make",
    href: "https://links.shikanime.studio",
  },
  {
    name: "Docs",
    tagline: "Guides and reference",
    href: "https://docs.shikanime.studio",
  },
  {
    name: "Studio",
    tagline: "The people behind it",
    href: "https://shikanime.studio",
  },
];

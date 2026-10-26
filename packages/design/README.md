# @shikanime-studio/design

The shared design layer for the studio's product apps — accounts, hikari,
reiya and fade. `links` and `www` are deliberately out of scope.

## What is shared

| Layer      | File                       | Owns                                                                    |
| ---------- | -------------------------- | ----------------------------------------------------------------------- |
| Foundation | `src/styles.css`           | Astryx imports, Tailwind bridge, type ramp, page shell, header, footer  |
| Tokens     | `src/styles.css` (`:root`) | `--studio-*` canvas, ink, accent, radius, header height, page measure   |
| Header     | `StudioHeader.tsx`         | The 64px band: brand → links → center → actions, plus a compact variant |
| Footer     | `StudioFooter.tsx`         | Mark, destination links, note                                           |
| Page       | `PageShell.tsx`            | The page column and its vertical rhythm                                 |

## What an app owns

Only its brand hue and its own actions:

```css
@import "@shikanime-studio/design/styles.css";

:root {
  /* Hikari's accent, rendered through the shared roles. */
  --studio-accent: light-dark(#ff6433, #ff7a4d);
  --studio-on-accent: #241c18;
}
```

```tsx
<StudioHeader
  brand={{
    name: "Reiya",
    href: "/",
    mark: <img className="studio-brand__mark" src={logo} alt="" />,
  }}
  links={[
    { href: "/explore", label: "Explore", active: pathname === "/explore" },
  ]}
  actions={<SignInButton />}
  menu={<MobileMenu />}
  renderLink={({ href, children, ...rest }) => (
    <Link to={href} {...rest}>
      {children}
    </Link>
  )}
/>
```

`renderLink` is how a router participates: the package never imports
TanStack Router, so the same header works in a Docusaurus page, a
client-only editor or a server-rendered app.

## Rules

- No Tailwind utility classes in this package. Tailwind does not scan
  `node_modules`, so the shared components use the CSS classes defined in
  `styles.css`; apps may still use utilities in their own files.
- One accent per app, same role. Meaning comes from `--studio-accent`,
  never from a hard-coded hex in a component.
- Layout changes belong here. If two apps need the same tweak, it belongs
  in this package rather than in both apps.

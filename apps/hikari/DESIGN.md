# Hikari design notes

How the interface is put together, why it looks the way it does, and how to
change it without breaking the system.

## References

Three inputs, deliberately kept separate:

- **Astryx** (`@astryxdesign/core`, Meta's design system) is the component
  layer. Button, IconButton, Card, Badge, TextInput, TextArea, DateTimeInput,
  FileInput, Banner, EmptyState and Selector all come from it, and every
  semantic token is Astryx's. The app extends the neutral theme in
  `src/theme/hikari.ts` with `defineTheme({ extends: neutralTheme })`: palette,
  radii and typography are theme tokens, not per-component overrides.
- **ImaCoCoS** (`https://omiomi79.github.io/imacocos/`), the app's original
  inspiration, supplies the warm paper ground and the signal yellow.
- **Ko-fi, Vgen and booth.pm** set the tone: Ko-fi's coral/lilac/sky palette,
  Vgen's image-forward commission cards with candy "OPEN" badges and pill
  controls, booth.pm's chunky coloured tags on a light canvas.

The result is a friendly marketplace surface — cream paper, white cards, vivid
thumbnails, sticker status badges — built from Astryx components rather than a
parallel component kit.

## Palette

Defined once in `src/assets/global.css` as `light-dark()` pairs, so the whole
app follows `data-theme` without a second stylesheet.

| Token                | Light     | Dark      | Used for                        |
| -------------------- | --------- | --------- | ------------------------------- |
| `--hk-canvas`        | `#fff8f0` | `#171110` | Page background                 |
| `--hk-surface`       | `#ffffff` | `#211a17` | Cards, header, sheets           |
| `--hk-surface-muted` | `#fff1e4` | `#2a211c` | Inset panels, icon tiles        |
| `--hk-ink`           | `#241c18` | `#fff4e9` | Primary text                    |
| `--hk-ink-soft`      | `#6f6058` | `#cdbdb2` | Secondary text                  |
| `--hk-ink-faint`     | `#7a6659` | `#9a8a7f` | Metadata, labels                |
| `--hk-line`          | `#f2e2d3` | `#3a2c24` | Hairlines                       |
| `--hk-line-strong`   | `#e4cdba` | `#4a382d` | Input borders, active hairlines |
| `--hk-accent`        | `#ff6433` | `#ff7a4d` | Primary action fills            |
| `--hk-accent-ink`    | `#c43d10` | `#ffb59a` | Links, focus ring, small text   |
| `--hk-signal`        | `#ffd84d` | `#ffd84d` | Stickers, current stage         |

Candy tints for status and thumbnails: lilac `#d9c2ff`, sky `#b9daff`, lemon
`#c8f56a`, coral `#ff6433`. They are set as Astryx Badge hue
tokens in the theme, so status chips are solid stickers readable on any
thumbnail.

Rules of thumb:

- Coral is the **action** fill. Buttons use ink on coral, never white —
  `#241c18` on `#ff6433` is about 5.7:1, white would fail. Small coral text
  and the focus ring use `--hk-accent-ink` (`#c43d10`), because the fill
  coral only reaches 2.8:1 on paper.
- Candy colours are for **status, thumbnails and category dots**, always with
  ink text. They are never body-text backgrounds.
- Colour is never the only carrier: every badge keeps its label, every stage
  keeps its name.
- Thumbnails are deterministic decorative gradients (one source in
  `src/lib/thumb.ts`) with a dotted texture, not fake photos.

## Type

- **Display**: Bricolage Grotesque Variable, weight 600, tracking `-0.03em`,
  line-height `1`. Used for h1/h2 and card titles.
- **UI**: the rounded system stack (`ui-rounded`, SF Pro Rounded, Hiragino
  Maru Gothic) — friendly without a webfont download.
- **Labels**: bold, normal-case 12px in the UI face. The old mono uppercase
  eyebrow is gone; mono is reserved for IDs, timestamps and code.

Weights: 300 display contrast, 400 body, 600 titles, 700 labels, 800 sticker
and avatar glyphs. No 800+ headings.

## Layout

- `max-width: 1200px`, gutters 20px mobile / 40px desktop (`.hk-shell`).
- Cards use 26px radii; inputs 14px; actions are pills at 999px.
- Soft warm shadows (`--hk-shadow-*`), no hard borders on cards except a
  hairline.
- Sections breathe at `py-20` mobile / `py-28` desktop.
- The landing page is full-bleed sections; app pages are shell-contained.

## Component layer

Astryx owns the components. The rule of thumb:

| Need          | Astryx component                                      |
| ------------- | ----------------------------------------------------- |
| Actions       | `Button` (primary / secondary / ghost), `IconButton`  |
| Containers    | `Card` (default / muted), `ClickableCard`             |
| Forms         | `TextInput`, `TextArea`, `DateTimeInput`, `FileInput` |
| Status        | `Badge` with the hue variants in `src/lib/status.ts`  |
| Empty / error | `EmptyState`, `Banner`                                |
| Language      | `Selector`                                            |
| Skeleton      | `Card` with `animate-pulse`                           |

`src/theme/hikari.ts` carries the palette, radii and typography;
`--_button-radius: 999px` in `global.css` makes Astryx buttons pills without
forking the Button.

One brand skin remains, because Astryx ships only primary/secondary/ghost/
destructive: `.hk-btn-outline`, the outlined secondary used in the header and
on secondary actions. It overrides colour and border only; layout, focus,
loading and disabled behaviour still come from `Button`.

`global.css` also defines non-component vocabulary: `.hk-shell`, `.hk-display`,
`.hk-eyebrow`, `.hk-chip`, the paper textures and the ticket/thumbnail
treatments. These live in `@layer components` so Tailwind utilities can still
override them. Moving one out of the layer silently breaks `hidden`, `pl-9` or
`w-full` on that element.

Typography is token-driven (`--font-family-heading/body/code`) rather than
wrapped in `Heading`/`Text` everywhere: marketing headlines need a fluid
`clamp()` scale that the fixed Astryx type steps cannot express. App copy still
uses the Astryx body token.

## Pages

- **Signed-out `/`** — one hero on a paper-textured, warm-glowing canvas,
  composed as two columns on desktop: the copy (chip, short headline, one line,
  one action) on the left, the abstract collage (coral camera disc, lilac heart
  sticker, C108 disc, tilted ticket with a 7px ink shadow) on the right. Below
  `lg` the columns stack and centre. The hero fills the space between the nav
  and a one-row footer, which carries the brand, Studio and Documentation
  links and the copyright. No feature grid, no lifecycle cards, no long copy,
  no extra bands.
- **Signed-in `/`** — a horizontally scrollable status filter on mobile, a
  search field, and image-forward commission cards with candy status stickers
  on the thumbnail; empty, no-match, loading and error states included.
- **`/commissions/$id`** — brief, photo delivery, a five-step progress rail,
  next-stage actions, map embed, calendar details.
- **`/commissions/new`** — two-column form with a "what happens next" aside.
- **`/404` and router not-found** — the same signal-yellow 404 view.
- **Error boundary** — root `errorComponent` with reload/retry.

## Accessibility

- Every icon-only control is an Astryx `IconButton` with a `label`; the
  notification popover responds to `Escape` and outside clicks.
- Focus uses a visible 2px accent ring; `prefers-reduced-motion` disables
  animation and smooth scrolling.
- The progress rail is decorative (`aria-hidden`); the current stage is also
  stated in text.
- Status chips pair colour with a dot and a label.

## Verification

```sh
pnpm check   # tsc --noEmit
pnpm lint    # eslint
pnpm test    # lifecycle self-check
pnpm build   # vite build
```

Browser checks (Playwright, mocked API) cover search, status filtering,
notification open/close, empty, load-error, form server-error, required
fields, and dark mode.

## Rollback

The change is confined to `apps/hikari/src` plus `public/icon.svg` and this
file. No dependency was added: every component used was already in
`@astryxdesign/core`. `git checkout -- apps/hikari` restores the previous
UI; there are no API, schema, or dependency changes, so no migration or
data rollback is needed.

## Known limits

- The demo screenshots of the signed-in board use a mocked session; the real
  board needs Google sign-in and a D1 row.
- Photo thumbnails before delivery are gradients in the landing mock only.
- `zh` is not supported; adding a locale means adding one record to
  `MESSAGES` and one entry to `LANGUAGES`.
- Dark mode follows the OS (`mode="system"`); there is no in-app switch.

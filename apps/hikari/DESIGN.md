# Hikari design notes

How the interface is put together, why it looks the way it does, and how to
change it without breaking the system.

## References

Two inputs, deliberately kept separate:

- **Astryx** (`@astryxdesign/core`, Meta's design system) is the component
  layer. Button, IconButton, Card, Badge, TextInput, TextArea, DateTimeInput,
  FileInput, Banner, EmptyState and Selector all come from it, and every
  semantic token (`--color-text-primary`, `--color-background-surface`,
  `--radius-container`, …) is Astryx's. The app extends the neutral theme in
  `src/theme/hikari.ts` with `defineTheme({ extends: neutralTheme })`: palette,
  radii and typography are theme tokens, not per-component overrides.
- **ImaCoCoS** (`https://omiomi79.github.io/imacocos/`), the app's original
  inspiration, supplies the material feel: warm paper canvas (`#f4f3ee` in the
  original), hairline rules, mono micro-labels, and a single signal yellow
  (`#ffd21f`).

The result is Meta-platform structure (white surfaces, pill actions, feed-style
cards, one blue action colour) on CoCoS paper — built with Astryx components,
not a parallel component kit.

## Palette

Defined once in `src/assets/global.css` as `light-dark()` pairs, so the whole
app follows `data-theme` without a second stylesheet.

| Token                | Light     | Dark      | Used for                        |
| -------------------- | --------- | --------- | ------------------------------- |
| `--hk-canvas`        | `#f5f4ef` | `#0a0c0e` | Page background                 |
| `--hk-surface`       | `#fffefb` | `#14171a` | Cards, header, sheets           |
| `--hk-surface-muted` | `#eeede6` | `#1c2024` | Inset panels, icon tiles        |
| `--hk-ink`           | `#0a1317` | `#f4f3ee` | Primary text                    |
| `--hk-ink-soft`      | `#4e606f` | `#a7b0b8` | Secondary text                  |
| `--hk-ink-faint`     | `#636e79` | `#78838d` | Metadata, eyebrows              |
| `--hk-line`          | `#e3e1d7` | `#262b30` | Hairlines                       |
| `--hk-line-strong`   | `#cfccc0` | `#384047` | Input borders, active hairlines |
| `--hk-accent`        | `#0064e0` | `#4d9fff` | Primary action, links, focus    |
| `--hk-signal`        | `#ffd21f` | `#ffd21f` | Brand mark, "current stage"     |

Rules of thumb:

- Blue is the **only** action colour. If it is clickable and primary, it is
  blue; everything else is ink, surface, or hairline.
- Yellow is a **signal**, not a surface. It marks the brand, the current step
  in a pipeline, and the single highlight per screen. Never put body text on
  it except `#0a1317`.
- Status colours are semantic and paired with a dot, so colour is never the
  only carrier of meaning.

Contrast was checked against WCAG AA for the text pairs actually used
(`ink-faint` was darkened from `#7d8b96` to `#636e79` to reach 4.7:1 on the
canvas).

## Type

- **Display**: Bricolage Grotesque Variable, 300–600, tracking `-0.035em`,
  line-height `0.98`. Used for h1/h2 and card titles only.
- **UI**: the platform UI stack (`-apple-system`, `Segoe UI`, Roboto). No
  webfont download for body copy, so first paint stays fast.
- **Mono**: `ui-monospace` for eyebrows, counts, and metadata. Uppercase
  eyebrows carry `0.16em` tracking.

Three weights only: 300 (display contrast), 400 (body), 600 (titles and
actions). Nothing at 700+.

## Layout

- `max-width: 1200px`, gutters 20px mobile / 40px desktop (`.hk-shell`).
- Cards use 18–24px radii; controls are pills at 999px; inputs are 12px.
- Sections breathe at `py-20` mobile / `py-28` desktop.
- The landing page is full-bleed sections; the app pages are shell-contained.

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

Three brand skins remain, because Astryx ships only primary/secondary/ghost/
destructive: `.hk-btn-signal` (yellow CTA on the dark band), `.hk-btn-on-ink`
and `.hk-btn-outline` (the outlined secondary used in the header and on
secondary actions). They override colour and border only; layout, focus,
loading and disabled behaviour still come from `Button`.

`global.css` also defines non-component vocabulary: `.hk-shell`, `.hk-display`,
`.hk-eyebrow`, `.hk-hairline`, `.hk-chip`, the ground textures and the rise
animation. These live in `@layer components` so Tailwind utilities can still
override them. Moving one out of the layer silently breaks `hidden`, `pl-9` or
`w-full` on that element.

Typography is token-driven (`--font-family-heading/body/code`) rather than
wrapped in `Heading`/`Text` everywhere: marketing headlines need a fluid
`clamp()` scale that the fixed Astryx type steps cannot express. App copy still
uses the Astryx body token.

## Pages

- **Signed-out `/`** — hero with a live product mock, lifecycle strip, role
  split, feature grid, four-step workflow, closing call to action, footer.
- **Signed-in `/`** — pipeline summary tiles, search + status filter, a card
  grid keyed by stage, plus empty, no-match, loading, and error states.
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
`@astryxdesign/core`. `git checkout -- apps/hikari` restores the previous UI; there are no API,
schema, or dependency changes, so no migration or data rollback is needed.

## Known limits

- The demo screenshots of the signed-in board use a mocked session; the real
  board needs Google sign-in and a D1 row.
- Photo thumbnails before delivery are gradients in the landing mock only.
- `zh` is not supported; adding a locale means adding one record to
  `MESSAGES` and one entry to `LANGUAGES`.
- Dark mode follows the OS (`mode="system"`); there is no in-app switch.

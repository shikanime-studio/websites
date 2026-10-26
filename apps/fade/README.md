# Fade

A local-first image viewer for RAW and JPEG workflows, rendered on the
browser's GPU. Open a directory from disk; nothing is uploaded.

**Live:** https://fade.shikanime.studio

## What it does

- **Import**: pick a local directory (`showDirectoryPicker`); the
  gallery scans it, filtering to supported images.
- **View**: main viewer renders JPEG directly and Fujifilm RAF through a
  demosaicing pipeline (embedded JPEG for previews, CFA data for the
  editor).
- **Edit**: WebGPU lighting — exposure, contrast, saturation,
  highlights/shadows/whites/blacks, tint/temperature, vibrance, hue —
  with histogram on the same compute path.
- **Browse**: filmstrip with GPU-rendered thumbnails, keyboard
  navigation (first/last, next/previous), fullscreen and settings
  modals (URL-backed), EXIF info panel.
- **Studio account**: optional sign-in through the Accounts Center
  (settings → _Studio account_). Photos never leave the machine; the
  account is only a name and an avatar.

## Studio account

Fade has no database, so the Accounts Center integration is a
confidential OAuth client with PKCE and a signed cookie rather than a
session table:

```text
/api/studio/login    → 302 to accounts, sets state + verifier cookie
/api/studio/callback → code → token → userinfo → HMAC-signed cookie
/api/studio/session  → { user } or { user: null }
/api/studio/logout   → clears the cookie
```

`STUDIO_SESSION_SECRET` signs the cookie; `ACCOUNTS_CLIENT_SECRET` is the
`fade` client secret. Neither is ever sent to the browser.

## Stack

| Layer      | Choice                                                                                                                                                             |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| UI         | React 19 + TanStack Router/Start (SPA-ish, SSR shell) + Astryx design system                                                                                       |
| GPU        | Raw WebGPU: compute pipelines for histogram, render pipeline for thumbnails and lighting                                                                           |
| State      | Effect atoms as a derived graph — support → adapter → device → format → pipelines → thumbnail/histogram; the device atom owns lost-device recovery and destruction |
| Local data | `@tanstack/react-db` collection persists the theme preference                                                                                                      |
| Analytics  | Mixpanel (initialised in `MixpanelProvider`, instance in an atom)                                                                                                  |
| Runtime    | Cloudflare Workers via `@cloudflare/vite-plugin`                                                                                                                   |

## Architecture notes

- `src/lib/atoms.ts` — `queryAtom`/`nullableAtom`: one cached atom per
  object identity (file, blob, directory handle), so re-renders reuse
  results.
- `src/lib/gpu-graph.ts` — support → adapter → device → format, with a
  finalizer that destroys the device; `pipelines.ts` derives the shader
  pipelines from the device.
- `src/lib/photo-atoms.ts` — file, preview (RAF-aware), EXIF, raw CFA,
  gallery scan, thumbnail and histogram atoms; loaders are plain async
  functions, testable without React.
- `src/hooks/` exists only for React/DOM concerns: directory picker,
  keymaps, element size, object URLs, canvas rendering, modal/theme via
  atoms or URL.

## Routes

| Route           | Purpose                                                     |
| --------------- | ----------------------------------------------------------- |
| `/`             | the editor (single page; modal via the `modal` query param) |
| `/api/studio/*` | Accounts Center sign-in, callback, session, sign-out        |

## Develop

```sh
pnpm install            # repo root
pnpm dev                # http://localhost:3000
pnpm check              # tsc --noEmit (via lint config: eslint + tsc)
pnpm lint               # eslint
pnpm test               # unit (Vitest)
pnpm test:e2e           # Playwright (imports an image, adjusts lighting)
pnpm build              # production build
```

WebGPU requires Chrome/Edge 113+ (or the flag in other browsers); the
app degrades with a warning when `navigator.gpu` is missing.

## Environment

No secrets. Analytics is wired in `__root.tsx` with a Mixpanel token —
remove or point it at your own project before reusing this app.

## Conventions

- Every data read is an atom; `useAtomSuspense` with Suspense
  boundaries, `includeFailure` only where a dedicated failure UI exists.
- Hooks never contain data-fetch policy — they exist for React lifecycle
  and browser APIs only.
- Effects own async error paths; toasts surface failures.

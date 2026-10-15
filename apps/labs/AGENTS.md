# labs

## Purpose

- Playground for Shikanime Studio experiments ("Let's play with what's
  next"). Adapts the instrument/HUD idiom of a labs teaser page to the
  studio brand: daisyUI `newfuture` theme, Inter Variable, experiment
  dossiers, an ASCII luma instrument, and keyboard modes.
- Primary content: hero with live HUD telemetry, three experiment
  dossiers, the philosophy section (Our Dream), the ASCII machine, and a
  subscribe form stub.

## URLs

- Production: `https://labs.shikanime.studio` (see
  [astro.config.mjs](astro.config.mjs))

## Commands

- Dev server: `pnpm dev` (Astro)
- Typecheck: `pnpm check` (Astro check)
- Preview: `pnpm preview`

## Deploy

- Cloudflare Workers: `pnpm deploy` (see [wrangler.jsonc](wrangler.jsonc))

## Configuration

- Mixpanel: `PUBLIC_MIXPANEL_TOKEN`, `PUBLIC_MIXPANEL_API_HOST` (used in
  [BaseLayout.astro](src/layouts/BaseLayout.astro))

## Technical notes

- Stack: Astro app deployed to Cloudflare Workers (Wrangler deploy).
- React island: the ASCII machine is `src/components/Machine.tsx`
  (`client:load`), render math in `src/lib/luma.ts`, self-check
  `pnpm test` (`src/lib/luma.check.ts`).
- SEO: uses `@astrojs/sitemap` and a custom robots route (see
  [robots.txt.ts](src/pages/robots.txt.ts)).
- Analytics: Mixpanel is initialized client-side in
  [BaseLayout.astro](src/layouts/BaseLayout.astro).
- The subscribe form is a stub: it validates input and reports state, it
  does not POST anywhere yet. Wire it to a real endpoint before using it
  to collect emails.
- Keyboard modes are handled in the Machine island: `d` palette, `r` CRT,
  `c` color, `f` focus, `p` pause, `Esc` exits focus mode.

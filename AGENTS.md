## Repo notes

### apps/fade

- Dev server: `pnpm -C apps/fade dev` (Vite, port 3000)
- Mixpanel env: `VITE_MIXPANEL_TOKEN` and `VITE_MIXPANEL_API_HOST` are required at runtime (see \[\_\_root.tsx\](file:///Users/shikanimedeva/Source/Repos/github.com/shikanime-studio/websites/apps/fade/src/routes/\_\_root.tsx))
- E2E (Playwright): `pnpm -C apps/fade test:e2e`
- Browsers install (one-time on a machine): `pnpm -C apps/fade exec playwright install`

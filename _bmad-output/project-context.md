______________________________________________________________________

## project_name: 'Fade' user_name: 'Shikanimedeva' date: '2026-03-30' sections_completed: ['technology_stack', 'language_rules', 'framework_rules', 'testing_rules', 'code_quality_rules', 'workflow_rules', 'anti_patterns', 'usage_guidelines'] existing_patterns_found: 0 status: 'complete' rule_count: 33 optimized_for_llm: true

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

______________________________________________________________________

## Technology Stack & Versions

- Runtime/tooling:
  - Node: >=22
  - pnpm: >=10 (repo pins pnpm@10.33.0)
  - TypeScript: ^5.9.3
- Monorepo:
  - pnpm workspaces (apps/\* + packages/\*)
  - Shared dependency versions via pnpm-workspace.yaml catalogs
- Primary app stack (Fade):
  - TanStack Start (Vite plugin): ^1.167.5
  - TanStack Router: ^1.168.3
  - TanStack Query: ^5.95.2
  - TanStack DB (react-db): ^0.1.77
  - React / React DOM: ^19.2.4
  - Vite: ^7.3.1
  - Tailwind CSS: ^4.2.2 (plus DaisyUI: ^5.5.19)
- Other apps stack (www/links/reiya):
  - Astro: ^6.0.8 (Cloudflare adapter: @astrojs/cloudflare ^13.1.3)
  - Tailwind CSS: ^4.2.2
- Deployment:
  - Cloudflare Workers via Wrangler: ^4.77.0 (each app has its own wrangler.jsonc)
- Analytics:
  - mixpanel-browser: ^2.76.0
- Testing:
  - Unit/integration: Vitest ^4.1.1
  - E2E: Playwright ^1.58.2
- Client env var conventions:
  - Vite apps: VITE\_\*
  - Astro apps: PUBLIC\_\*

## Critical Implementation Rules

### Language-Specific Rules (TypeScript/ESM)

- Repo and packages are ESM (`"type": "module"`): use ESM imports/exports everywhere; in Node contexts prefer `node:` protocol imports (e.g. `node:process`, `node:path`).
- TypeScript is configured via `@tsconfig/strictest`: avoid `any`, keep types precise; prefer discriminated unions and `zod` inference for data that is persisted/validated.
- Prefer `import type { ... }` for type-only imports (common pattern across the codebase).
- Prefer named exports for modules; default exports are mainly used for tool/config entrypoints (vite/vitest/playwright/eslint config files).
- Keep formatting compatible with the repo ESLint setup (`@antfu/eslint-config`): single quotes, no semicolons, trailing commas as enforced by lint.

### Framework-Specific Rules (TanStack Start/Router/Query/DB + Tailwind)

- Prefer TanStack primitives first:
  - Routing/layout/data flow: TanStack Router/Start patterns as used in apps/fade.
  - Server/client data: TanStack Query first; keep query keys centralized if an existing helper exists.
  - Local persisted state: TanStack DB (react-db) patterns as already used (e.g. collections + zod schemas).
- Follow existing app conventions before inventing new patterns:
  - When adding code to any app/package, mirror the conventions already present in that app’s folder structure, file naming, exports, and provider/hook patterns.
  - Prefer shared internal packages (`@shikanime-studio/*`) over introducing new external libs.
- Styling:
  - Use Tailwind CSS utility-first styling consistent with existing components.
  - Avoid adding new styling frameworks or component libraries unless the repo already depends on them.
- Deployment/runtime assumptions:
  - Target Cloudflare Workers constraints (no Node-only APIs at runtime); keep Node-only usage confined to tooling/config.

### Testing Rules (Vitest + Playwright)

- Default testing stack:
  - Use Vitest for unit/integration tests.
  - Use Playwright for E2E tests (Fade app already has Playwright config and scripts).
- Conventions:
  - Prefer colocated `*.test.ts` / `*.test.tsx` for unit tests (Vitest style: `describe/it/expect`).
  - For E2E, put tests under the app’s `tests/` directory (e.g. apps/fade/tests) and use the existing Playwright baseURL/server config.
- Practical rules:
  - Add tests when changing behavior; keep them deterministic and fast.
  - Don’t introduce new testing frameworks or helper libs unless already used in-repo.

### Code Quality & Style Rules

- Always preserve cross-repo quality gates (match CI):
  - `corepack pnpm --recursive lint` must pass.
  - `corepack pnpm --recursive check` must pass.
  - `corepack pnpm --recursive build` must pass when changes affect build output.
  - `nix flake check --accept-flake-config --no-pure-eval` must pass (Nix validates constraints not covered by ESLint/TS/etc).
- Follow existing conventions across apps/packages:
  - When implementing in a given app/package, mirror its existing file layout, naming, exports, provider/hook patterns, and styling approach.
  - If a similar pattern exists in another app, prefer reusing that convention over inventing a new one.
- Use as few third-party libraries as possible:
  - Before adding a new dependency, prefer internal packages (`@shikanime-studio/*`) or existing repo dependencies.
  - Don’t introduce broad “utility” libraries for small needs; write small local utilities instead.

### Development Workflow Rules

- Always keep CI-aligned commands passing for changed workspaces:
  - Prefer `corepack pnpm --recursive lint` / `check` / `build` locally when changes span multiple workspaces.
  - When changes are scoped, at minimum ensure `pnpm -C <workspace> lint` (and `check`/`test` when available) passes for the workspace you touched.
- Nix is a required validator in this repo:
  - Run `nix flake check --accept-flake-config --no-pure-eval` when changing tooling/devshell/build inputs or anything that might affect Nix-level validation.
- Testing workflow:
  - Use `pnpm test` for unit/integration (Vitest, currently Fade-focused).
  - Use `pnpm -C apps/fade test:e2e` for E2E (Playwright) when user-facing flows are affected.
- Env/config workflow:
  - Don’t commit secrets; rely on VITE\_\* / PUBLIC\_\* env var conventions per app.
  - Keep Cloudflare Worker constraints in mind when touching runtime code.

### Critical Don't-Miss Rules

- Don’t add new third-party dependencies unless there is a clear gap in existing repo dependencies or internal packages.
- Don’t introduce Node-only runtime APIs in Cloudflare Worker runtime code; keep Node usage limited to tooling/config/scripts.
- Don’t bypass established patterns inside an app/package; follow that app’s existing conventions first.
- Don’t land changes that break CI gates:
  - `corepack pnpm --recursive lint`
  - `corepack pnpm --recursive check`
  - `nix flake check --accept-flake-config --no-pure-eval`
- Don’t ship behavior changes without tests:
  - Use Vitest for unit/integration.
  - Use Playwright for user-facing flows/end-to-end coverage where appropriate.
- Don’t commit secrets; use VITE\_\* / PUBLIC\_\* env vars and Cloudflare configuration.

______________________________________________________________________

## Usage Guidelines

**For AI Agents:**

- Read this file before implementing any code in this repo.
- Follow all rules exactly as documented.
- When in doubt, prefer the more restrictive option.
- Update this file if new patterns emerge.

**For Humans:**

- Keep this file lean and focused on agent needs.
- Update when the technology stack or CI gates change.
- Review periodically to remove rules that have become obvious or outdated.

Last Updated: 2026-03-30

# Story 1.1: Set Up Initial Project from Starter Template

Status: ready-for-dev

## Story

As a Developer,
I want the Fade app to run locally with the expected TanStack Start + TanStack Router foundations,
so that future features can be implemented safely on top of stable routing, providers, and filesystem entry points.

## Acceptance Criteria

1. **Given** I have the repository checked out locally
   **When** I install dependencies and run the Fade dev server
   **Then** the app starts successfully and loads the start screen
   **And** the start screen provides an “Open Folder” entry point that triggers the system directory picker
2. **Given** the project is running
   **When** I navigate between the primary routes (grid, editor, compare, settings)
   **Then** each route renders without runtime errors
   **And** feature modules are structured in alignment with the architecture requirements

## Tasks / Subtasks

- [ ] Verify local dev setup works end-to-end (AC: #1)
  - [ ] Install repo deps with pnpm
  - [ ] Run Fade dev server (`pnpm -C apps/fade dev`) and confirm the initial UI renders
  - [ ] Confirm Vite client env requirements are documented by behavior (Mixpanel env vars may be unset during dev; app still renders)
- [ ] Ensure an “Open Folder” entry point exists on the start screen and triggers directory picking (AC: #1)
  - [ ] Confirm the empty-state UI instructs the user to click “Open Folder” when no files are loaded
  - [ ] Confirm “Open Folder” triggers folder selection via the VFS picker hook
  - [ ] Ensure directory-picker invocation errors do not crash the UI (AbortError / SecurityError should be handled; degraded-mode messaging can be implemented in Story 1.2 if currently missing)
- [ ] Ensure primary navigation surfaces as routes (or route-equivalent) without runtime errors (AC: #2)
  - [ ] Decide route mapping that matches current app reality:
    - Current implementation uses `/` and `/$path` as the primary app shell routes
    - Target architecture document proposes explicit routes for grid/editor/compare/settings/diagnostics
  - [ ] If explicit routes do not exist, add minimal placeholder route files under `apps/fade/src/routes/` for `compare`, `settings`, and `diagnostics` that render without runtime errors and reuse the existing `AppShell` where appropriate
  - [ ] Ensure route tree generation and router boot still work (no broken imports; no circular deps)
- [ ] Align high-level project structure with the architecture requirements without a risky refactor (AC: #2)
  - [ ] Do not move existing working components in this story unless required to satisfy routing/runtime stability
  - [ ] If new architecture-aligned folders are needed for future work (grid/editor/compare/settings/lib/*), scaffold only what is immediately required by the placeholder routes
- [ ] Quality gates (AC: #1, #2)
  - [ ] Run Fade lint/check scripts for the workspace
  - [ ] Run existing E2E smoke coverage only if route changes impact the existing Playwright flow

## Dev Notes

- Current code already provides an “Open Folder” entry point via the toolbar using VFS hooks: [ToolBar.tsx](file:///Users/shikanimedeva/Source/Repos/github.com/shikanime-studio/websites/apps/fade/src/components/ToolBar.tsx)
- Current route structure is minimal and routes into `AppShell`: [index.tsx](file:///Users/shikanimedeva/Source/Repos/github.com/shikanime-studio/websites/apps/fade/src/routes/index.tsx), [$path.tsx](file:///Users/shikanimedeva/Source/Repos/github.com/shikanime-studio/websites/apps/fade/src/routes/$path.tsx)
- Root providers and app shell wiring live in: [__root.tsx](file:///Users/shikanimedeva/Source/Repos/github.com/shikanime-studio/websites/apps/fade/src/routes/__root.tsx), [AppShell.tsx](file:///Users/shikanimedeva/Source/Repos/github.com/shikanime-studio/websites/apps/fade/src/components/AppShell.tsx)
- Architecture expectations for eventual route and folder structure are documented here: [architecture.md](file:///Users/shikanimedeva/Source/Repos/github.com/shikanime-studio/websites/_bmad-output/planning/architecture.md#L305-L456)

### Project Structure Notes

- The architecture plan proposes a feature-first directory layout and explicit route files (grid/editor/compare/settings/diagnostics). The current codebase already works with a smaller surface area (single shell + `/$path`).
- To avoid regressions, treat this story as a stabilization + scaffolding story:
  - Prefer reusing existing providers and `AppShell` instead of introducing a parallel routing stack
  - If adding route files to satisfy AC #2, keep them thin and delegate UI to existing components

### References

- Story definition and acceptance criteria: [epics.md](file:///Users/shikanimedeva/Source/Repos/github.com/shikanime-studio/websites/_bmad-output/planning/epics.md#L180-L203)
- Starter/architecture decisions and target structure: [architecture.md](file:///Users/shikanimedeva/Source/Repos/github.com/shikanime-studio/websites/_bmad-output/planning/architecture.md#L84-L456)
- Product constraints (Chrome-only, secure context, FS Access): [prd.md](file:///Users/shikanimedeva/Source/Repos/github.com/shikanime-studio/websites/_bmad-output/planning/prd.md#L188-L209)
- Repo-wide implementation rules and quality gates: [project-context.md](file:///Users/shikanimedeva/Source/Repos/github.com/shikanime-studio/websites/_bmad-output/project-context.md#L42-L119)

## Dev Agent Record

### Agent Model Used

GPT-5.2 (Trae IDE)

### Debug Log References

- git log -n 5 --oneline (local)

### Completion Notes List

- Sprint status file was not present; story selection was inferred as the first story in Epic 1 from the epics artifact.
- No prior story files existed under `_bmad-output/implementation` for cross-story learnings.

### File List

- /Users/shikanimedeva/Source/Repos/github.com/shikanime-studio/websites/apps/fade/src/routes/__root.tsx
- /Users/shikanimedeva/Source/Repos/github.com/shikanime-studio/websites/apps/fade/src/routes/index.tsx
- /Users/shikanimedeva/Source/Repos/github.com/shikanime-studio/websites/apps/fade/src/routes/$path.tsx
- /Users/shikanimedeva/Source/Repos/github.com/shikanime-studio/websites/apps/fade/src/components/AppShell.tsx
- /Users/shikanimedeva/Source/Repos/github.com/shikanime-studio/websites/apps/fade/src/components/ToolBar.tsx

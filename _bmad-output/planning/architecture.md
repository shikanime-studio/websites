---
stepsCompleted:
  - step-01-init.md
  - step-02-context.md
  - step-03-starter.md
  - step-04-decisions.md
  - step-05-patterns.md
  - step-06-structure.md
  - step-07-validation.md
  - step-08-complete.md
inputDocuments:
  - /Users/shikanimedeva/Source/Repos/github.com/shikanime-studio/websites/_bmad-output/planning/prd.md
workflowType: 'architecture'
lastStep: 8
status: 'complete'
completedAt: '2026-03-30'
project_name: 'Fade'
user_name: 'Shikanimedeva'
date: '2026-03-30'
---

# Architecture Decision Document

This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together.

## Initialization Report

Documents Found:
- PRD: 1
- UX Design: None found
- Research: None found
- Project docs: None found
- Project context: None found

Files loaded:
- /Users/shikanimedeva/Source/Repos/github.com/shikanime-studio/websites/_bmad-output/planning/prd.md

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
- 38 FRs across 9 capability areas: Experimentation Loop, Branching & Compare, File System Access & Outputs, Batch Apply, Keyboard/Hotkeys, Presets, Project/Folder Management, Diagnostics & Recovery, Product Analytics (opt‑in).
- Architectural implications:
  - Tight render scheduling for instant compare/branch toggles.
  - Non‑destructive sidecar graph per photo/branch with atomic operations.
  - Background debounced `.tiff` write executor decoupled from UI.
  - Deterministic batch propagation with undo/redo across selection.
  - Context‑scoped hotkeys with conflict detection and persistence in local DB.
  - Diagnostics surface exposing permission/queue/error states without leaking content.
  - Opt‑in analytics emitter with offline buffering and privacy guards.

**Non-Functional Requirements:**
- Performance: frame budget ≈16ms; compare toggle <100ms; branch create <300ms; progressive indexing.
- Reliability: crash‑safe queues; atomic writes; consistent history under stress.
- Integration: secure‑context FS Access; capability detection; graceful degradation.
- Accessibility: keyboard‑first, focus management, status annunciation.
- Security: local‑first, no network writes unless enabled; explicit consent for future cloud.
- Analytics & Observability: AARRR‑aligned event taxonomy, offline buffering, minimal properties.

**Scale & Complexity:**
- Primary domain: Web app (creative imaging) with GPU acceleration and local filesystem integration.
- Complexity level: High.
- Estimated architectural components: 10–12 (Render Pipeline, VFS Layer, Indexer, Sidecar Manager, Write Queue/Executor, Compare & Branch Engine, Batch Engine, Hotkeys Subsystem, Preset Engine, Diagnostics Service, Analytics Emitter, Config/State Store).

### Technical Constraints & Dependencies

- Chrome‑only target; secure context required for directory picking; transient user activation gating FS Access.
- WebGPU preferred; fallback paths must not break core loop if used.
- File System Access limited to directory read/write; avoid reliance on unsupported operations.
- Local‑first storage of state in `@tanstack/db`; no export of DB content in MVP.
- Continuous debounced `.tiff` outputs; sidecar format must be deterministic and crash‑safe.
- Future Cloudflare sync/collab/AI deferred; design seams to allow later backends via VFS.

### Cross-Cutting Concerns Identified

- Performance scheduling across render, IO, and batch operations to protect interactivity.
- Atomicity and consistency for sidecars and output files with crash recovery.
- Capability detection and user‑facing degraded‑mode messaging.
- Privacy posture and permissions handling across workflows.
- Keyboard accessibility and context scoping affecting input routing.
- Observability: event taxonomy, latency measurements, and diagnostics without content leakage.

## Starter Template Evaluation

### Primary Technology Domain

Web application based on project requirements analysis.

### Starter Options Considered

- Vite + React official starter (create-vite) — lightweight, fast HMR, good fit for Chrome-only, FS Access, and WebGPU experimentation.
- TanStack Start — router-first full-stack, but heavier than needed for local-first app without server-side rendering requirements.
- Next.js — production-grade, but introduces SSR/edge concerns unnecessary for a purely local-first Chrome app.

### Selected Starter: TanStack Start (migrate apps/fade)

**Rationale for Selection:**
- Aligns with TanStack ecosystem (Router, Query, DB, Hotkeys) and ESLint plugins already present in the workspace.
- Supports file-based routing and data loaders with optional SSR; we operate CSR-only for local-first MVP but keep SSR seams for future needs.
- Built on Vite, preserving fast HMR while standardizing patterns across routing, loaders, and configuration.

**Initialization Command:**

```bash
pnpm -C apps/fade dev
```

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**
TypeScript configured; React 19 aligned with workspace.

**Styling Solution:**
Tailwind CSS alignment per workspace conventions; daisyUI optional for UI components if used.

**Build Tooling:**
Vite for dev/build; fast HMR; plugin-friendly for WebGPU experiments.

**Testing Framework:**
Vitest with workers pool for Cloudflare-compatible contexts in apps/fade; root `pnpm test` runs fade’s suite.

**Code Organization:**
File-based routes with TanStack Start; feature modules for Grid/Editor/Compare/Batch/Diagnostics; local state via `@tanstack/db`; VFS abstraction for FS Access; loaders/actions used where beneficial without server I/O.

**Development Experience:**
pnpm workspaces; ESLint via `@antfu/eslint-config`; scripts for deploy/upload via Wrangler per app.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Sidecar schema and branch graph model for non‑destructive edits.
- Write Queue/Executor design for atomic sidecar/`.tiff` operations and crash‑safe resume.
- Render scheduling strategy to protect interactivity during compare/branch toggles.
- Capability detection and gating for FS Access and WebGPU in secure contexts.

**Important Decisions (Shape Architecture):**
- GPU texture/tile caching and memory budgeting.
- Batch propagation determinism and undo/redo strategy.
- Context‑scoped hotkeys and command bus routing.
- Diagnostics surface and observability event taxonomy.

**Deferred Decisions (Post‑MVP):**
- Cloudflare sync backends and collaboration models.
- Plugin API and smart collections.
- AI assist integration depth and model selection.

### Data Architecture

- Local state in `@tanstack/db` for configuration, keymaps, session counters; no export in MVP.
- Photo/branch edits persisted as XMP payload embedded in Fade-generated `.tiff` sidecar outputs (one `.tiff` per original per branch); branch IDs and deterministic naming.
- XMP payload schema versioned; forward‑compatible with migration hooks; validated with Zod before write.
- Indexer builds a folder catalog with derived relationships among originals and Fade-generated `.tiff` sidecars (including branch mapping).
- Caching: GPU texture cache and in‑memory tile LRU to bound memory; eviction policy tuned to interaction fidelity.
- Metadata embedding is the portable persistence layer: branch graph (minimal) and latest adjustments per branch live in `.tiff` XMP under a `fade` namespace.
- Reconciliation rules: on load, `.tiff` XMP is authoritative for portable state; DB is authoritative for in-session derived state; conflicts resolved by timestamp and deterministic precedence.
- Atomic writes: `.tiff` metadata updates use temp file + replace semantics; privacy guard — no file paths or PII stored, only normalized adjustments and identifiers.
- Best-effort Lightroom compatibility: embed XMP using the standard TIFF XMP tag (700) and include Adobe-friendly namespaces; when feasible, mirror a subset of adjustments into `crs:` (Camera Raw settings) while keeping `fade:` as the canonical schema.
- Argument for a JSON escape hatch (optional): XMP writes rewrite the entire `.tiff` and payload size growth can hurt performance; therefore, operation-level history may be compacted or truncated in XMP, and a separate JSON sidecar is only considered if a user explicitly enables “extended history export”.

### Authentication & Security

- MVP has no user authentication; operates entirely local‑first.
- Secure‑context enforcement for FS Access; permission prompts and scopes surfaced in UX.
- Future: integrate `better-auth` for optional accounts when Cloudflare sync arrives; configure providers in `lib/auth.ts`; env validation in `server/config.ts`.

### API & Communication Patterns

- No remote API in MVP; modular VFS interface abstracts filesystem backends.
- Analytics emitter integrates with Mixpanel only when enabled; events buffered offline; privacy guards prevent PII and file metadata leakage.
- Diagnostics channel provides structured error/status without exposing image contents.

### Frontend Architecture

- React + Vite app with feature modules: Grid, Editor, Compare, Batch, Diagnostics, Settings.
- State segmentation: ephemeral UI state in React, persisted preferences/keymaps in `@tanstack/db`, derived edit graph from `.tiff` XMP payloads.
- Render Scheduler: central coordinator prioritizing interactive frames over background IO; hooks into compare/branch toggle.
- Hotkeys Subsystem: context‑scoped command bus; collision detection; sub‑frame dispatch; persistence in local DB.
- Compare & Branch Engine: manages branch graph, layouts (2‑up/3‑up), experiment toggles with consistent framing.
- Preset Engine: applies baseline presets and user presets with `.tiff` XMP persistence.

### Infrastructure & Deployment

- Cloudflare deploy/upload scripts per app standardized in `package.json`.
- CI: root `pnpm test` runs Vitest for fade; Playwright E2E available for apps/fade.
- Linting via `@antfu/eslint-config`; type declarations via per‑workspace `check` scripts.
- Environment: Vite `VITE_*` tokens for client config (e.g., Mixpanel); Astro apps use `PUBLIC_*` when applicable.

### Decision Impact Analysis

**Implementation Sequence:**
1. XMP payload schema + deterministic naming
2. VFS layer + Indexer
3. Render Scheduler + Editor baseline adjustments
4. Branch Engine + Compare layouts/toggles
5. Write Queue/Executor for `.tiff` sidecars (debounced)
6. Batch Engine (apply to selection, undo/redo)
7. Hotkeys Subsystem + keymap persistence
8. Diagnostics surface + observability events
9. Preset Engine
10. Opt‑in analytics emitter

**Cross-Component Dependencies:**
- Render Scheduler depends on Indexer and Branch Engine for fast switches.
- Write Queue relies on Sidecar/XMP Manager and VFS for atomicity and recovery.
- Batch Engine coordinates with Sidecar Manager and Diagnostics for progress/error handling.
- Hotkeys route into feature modules; persistence maps to `@tanstack/db`.

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:**
8 areas where AI agents could make different choices (naming, structure, formats, events, state updates, error handling, loading states, metadata embedding).

### Naming Patterns

**Database/Local DB Naming Conventions:**
- Keys: camelCase (e.g., keymapVersion, sessionCounters).
- IDs: ULID for branchId; photoId is stable basename + relative path.
- Collections: singular document shape; no pluralized keys.

**Sidecar/XMP Naming:**
- XMP namespace: fade:version, fade:branchId, fade:adjustments.exposure, fade:adjustments.contrast, fade:adjustments.whiteBalance.kelvin, fade:adjustments.saturation.
- Adobe compatibility (best-effort): include XMP packet namespaces commonly read by Adobe apps (xmp, dc, tiff, exif, photoshop, crs, lr) and mirror supported adjustments into `crs:` keys when possible.
- No file paths or PII in metadata; only normalized adjustments and identifiers.

**Code & Files:**
- Components: PascalCase (e.g., ComparePanel.tsx).
- Files: kebab-case for folders and utilities (e.g., write-queue.ts, sidecar-manager.ts).
- Routes: TanStack Start file-based routing uses kebab-case directories (e.g., routes/compare/).

### Structure Patterns

**Project Organization:**
- Feature-first directories: grid/, editor/, compare/, batch/, diagnostics/, settings/.
- Cross-cutting services in lib/: vfs/, sidecar/, write-queue/, analytics/, presets/, render-scheduler/.
- Shared types in types/; constants in constants/.

**Tests:**
- Co-located unit tests: *.test.ts adjacent to modules.
- Scenario tests in tests/scenarios/ for render scheduler, write queue, and branch/compare flows.

### Format Patterns

**TIFF XMP Payload:**
- ISO 8601 timestamps (createdAt, updatedAt).
- adjustments object normalized; no denormalized computed values.
- history optional and may be compacted/truncated; operations use verb + params (e.g., { op: "setExposure", value: 0.35 }).

**Diagnostics & Errors:**
- Error shape: { message, code, recoverable: boolean }.
- Diagnostics payload: { permissionStatus, queueDepth, recentErrors: Error[] }.

**Analytics Events:**
- Event names: aarr.*, flow.*, ui.*; properties camelCase; latencies in ms; counts as integers; capability flags boolean.

### Communication Patterns

**Event System:**
- Command bus names: cmd.grid.nextPhoto, cmd.editor.applyPreset, cmd.compare.toggleLayout, cmd.branch.promote.
- Event payloads include minimal identifiers; never include file paths or image content.
- Version events with version property when schema evolves.

**State Management:**
- Immutable updates for persisted state; ephemeral UI state can use local mutation within React component scope.
- Selectors return derived data; no components read raw DB documents directly.

### Process Patterns

**Error Handling:**
- Global error boundary at app root; per-feature error surfaces.
- Retry/backoff for write queue: exponential backoff starting at 250ms, cap at 5s, jittered.
- Permission prompts: single entry point with user guidance; idempotent retries.

**Loading States:**
- Names: isIndexing, isWritingMetadata, isWritingTiff, isBatchApplying.
- Loading UI: non-blocking; compare/navigation remain responsive.
- Progress: numeric percent where applicable; otherwise queued counts and latency estimates.

### Enforcement Guidelines

**All AI Agents MUST:**
- Use camelCase for fields, PascalCase for components, kebab-case for utility files and folders.
- Validate metadata payload with Zod schemas before write; reject on validation failure.
- Route commands through the command bus; do not call feature modules directly.

**Pattern Enforcement:**
- ESLint rules via @antfu config; custom rules for naming and file structure in eslint.config.ts.
- Unit tests assert schema validation, atomic writes, and command bus routing.
- Pattern violations documented in docs/pattern-violations.md and corrected before merge.

### Pattern Examples

**Good Examples:**
- XMP adjustments use camelCase with ISO timestamps; branchId is ULID.
- Command bus action cmd.branch.promote with payload { photoId, branchId }.

**Anti-Patterns:**
- Embedding file paths or PII in XMP.
- Direct calls from UI to write-queue without going through the command bus.

## Project Structure & Boundaries

### Complete Project Directory Structure

```
apps/fade/
├── package.json
├── tsconfig.json
├── eslint.config.ts
├── vite.config.ts
├── wrangler.jsonc
├── public/
│   └── assets/
├── src/
│   ├── app.tsx
│   ├── styles/
│   │   └── index.css
│   ├── routes/
│   │   ├── __root.tsx
│   │   ├── index.tsx
│   │   ├── editor.$photoId.tsx
│   │   ├── compare.tsx
│   │   ├── settings.tsx
│   │   └── diagnostics.tsx
│   ├── components/
│   │   ├── grid/
│   │   ├── editor/
│   │   ├── compare/
│   │   ├── batch/
│   │   └── ui/
│   ├── lib/
│   │   ├── vfs/
│   │   │   ├── index.ts
│   │   │   └── fs-access.ts
│   │   ├── sidecar/
│   │   │   ├── schema.ts
│   │   │   ├── manager.ts
│   │   │   └── xmp.ts
│   │   ├── write-queue/
│   │   │   ├── queue.ts
│   │   │   └── tiff-writer.ts
│   │   ├── analytics/
│   │   │   ├── mixpanel.ts
│   │   │   └── events.ts
│   │   ├── presets/
│   │   │   └── index.ts
│   │   ├── render-scheduler/
│   │   │   ├── scheduler.ts
│   │   │   └── gpu-pipeline.ts
│   │   ├── hotkeys/
│   │   │   ├── keymap.ts
│   │   │   └── bus.ts
│   │   ├── diagnostics/
│   │   │   └── index.ts
│   │   └── db/
│   │       ├── index.ts
│   │       └── schemas.ts
│   ├── types/
│   │   └── index.ts
│   ├── constants/
│   │   └── index.ts
│   ├── hooks/
│   │   └── use-hotkeys.ts
│   ├── workers/
│   │   └── gpu.worker.ts
│   └── test-utils/
│       └── render.tsx
├── tests/
│   ├── unit/
│   ├── scenarios/
│   └── e2e/
└── README.md
```

### Architectural Boundaries

**API Boundaries:**
- No external APIs in MVP. VFS abstracts filesystem access; analytics emitter integrates with Mixpanel only when enabled.

**Component Boundaries:**
- Feature modules (grid, editor, compare, batch, diagnostics, settings) communicate through a command bus and shared types; no cross-feature imports of internal state.
- Routes render features; features consume lib services via injected interfaces.

**Service Boundaries:**
- VFS isolates FS Access and potential future backends.
- Sidecar Manager owns schema validation and reconciliation with XMP.
- Write Queue owns atomic sidecar and TIFF writes with debouncing.
- Render Scheduler owns frame prioritization; GPU Pipeline owns WebGPU setup.

**Data Boundaries:**
- Canonical state: `@tanstack/db`.
- Portability: `.tiff` XMP metadata dump of latest edit settings and branch identifiers.
- `.tiff` XMP is canonical for persisted metadata outside the DB (branch graph + latest adjustments).

### Requirements to Structure Mapping

**Feature/Epic Mapping:**
- E1 Folder Intake & Grid → routes/index.tsx, components/grid/, lib/vfs/, lib/db/, render-scheduler/
- E2 Editor & Baseline Adjustments → routes/editor.$photoId.tsx, components/editor/, lib/render-scheduler/, lib/gpu-pipeline/
- E3 Branching & Compare → routes/compare.tsx, components/compare/, lib/sidecar/, lib/render-scheduler/
- E4 File System & Write Queue → lib/vfs/, lib/sidecar/, lib/write-queue/, workers/gpu.worker.ts
- E5 Batch Apply → components/batch/, lib/write-queue/
- E6 Keyboard & Hotkeys → hooks/use-hotkeys.ts, lib/hotkeys/, routes/__root.tsx integration
- E7 Diagnostics & Recovery → routes/diagnostics.tsx, lib/diagnostics/, lib/write-queue/
- E8 Product Analytics (Opt‑In) → lib/analytics/mixpanel.ts, lib/analytics/events.ts, settings route

**Cross-Cutting Concerns:**
- Presets → lib/presets/, components/editor/
- Types/Constants → types/, constants/
- Test utilities → src/test-utils/, tests/unit/, tests/scenarios/, tests/e2e/

### Integration Points

**Internal Communication:**
- Command bus dispatches actions to features (e.g., cmd.branch.promote).
- Render Scheduler exposes prioritized tasks to features; Write Queue consumes requests from features.

**External Integrations:**
- Mixpanel (opt-in) via lib/analytics/mixpanel.ts and environment tokens.
- Cloudflare deploy/upload via wrangler.jsonc; no runtime cloud dependencies in MVP.

**Data Flow:**
- `@tanstack/db` is canonical → dump latest settings into `.tiff` XMP sidecar metadata → atomic writes via Write Queue → Indexer reconciles originals and `.tiff` sidecars.

### File Organization Patterns

**Configuration Files:**
- workspace-level ESLint via `eslint.config.ts`; Vite configuration in `vite.config.ts`; wrangler.jsonc per app; environment variables through Vite `VITE_*`.

**Source Organization:**
- Feature-first with lib services; routes bind features to navigation.

**Test Organization:**
- Co-located unit tests per module; scenario tests under tests/scenarios; e2e in tests/e2e using Playwright.

**Asset Organization:**
- Static assets under public/assets; generated `.tiff` outputs live in user-selected folders via FS Access.

### Development Workflow Integration

**Development Server Structure:**
- TanStack Start app served via Vite dev; routes under src/routes; command bus and services under src/lib.

**Build Process Structure:**
- Vite build emits assets; no SSR for MVP; integrity checks include schema validation tests.

**Deployment Structure:**
- Cloudflare wrangler deploy/upload scripts in package.json; no server runtime dependencies for MVP.

## Refined Architecture Plan (Audit‑Informed)

### Core Principles

- Canonical edit state in `@tanstack/react-db`; write‑through to `.tiff` XMP sidecar metadata; no JSON sidecars by default.
- Non‑blocking UI: render scheduler prioritizes editor/compare; write queue debounces and commits atomically.
- Explicit module contracts to keep features decoupled; command bus mediates communication.

### Module Contracts

**lib/db**
- Provides schemas for Photo, Branch, Adjustments, Operation history; ULID branchId; deterministic photoId based on basename + relative path.
- Collections: settingsCollection, keymapsCollection, photosCollection, branchesCollection.
- Exposes selectors for derived state (active photo, active branch, applied adjustments).

**lib/sidecar**
- schema.ts: Zod schemas for XMP payload.
- manager.ts: read/write `.tiff` XMP payload; conflict resolution by timestamp/precedence; optional “extended history export” hook.
- xmp.ts: encode/decode under `fade` namespace (version, branchId, adjustments.*); privacy‑safe fields only.

**lib/write‑queue**
- queue.ts: debounced atomic writes; temp file + replace semantics using WritableFileStream; retry/backoff; crash‑safe resume via index scan.
- tiff‑writer.ts: integrate with medialab to write XMP into `.tiff`; coalesce metadata updates; emit progress events.

**lib/vfs**
- fs‑access.ts: wraps File System Access calls; safe directory/file resolution; writable stream helpers.
- index.ts: public interfaces consumed by features and services.

**lib/render‑scheduler**
- scheduler.ts: task prioritization (interaction > background); frame budget management.
- gpu‑pipeline.ts: WebGPU setup, histogram/thumbnail pipelines; capability detection/fallbacks.

**lib/hotkeys**
- keymap.ts: persisted bindings in DB; context‑scoped bindings.
- bus.ts: command dispatch for editor/grid/compare/batch operations.

**packages/medialab (enhancements)**
- xmp.ts: utilities for encoding/decoding XMP payloads; tag mappings; safety checks.
- tiff‑writer.ts: helpers to update metadata blocks respecting endianness and IFD offsets.
- adobe-xmp.ts: best-effort mapping helpers to emit Adobe-friendly XMP packets (including TIFF tag 700 embedding) and optionally mirror supported adjustments into `crs:` without breaking `fade:` parsing.

**packages/vfs (enhancements)**
- safe‑replace.ts: temp‑write + atomic replace helper; integrates with FileSystemWritableFileStream.
- queue integration hooks to reuse in apps/fade.

### Command Bus Topics

- cmd.grid.selectPhoto, cmd.grid.nextPhoto, cmd.grid.prevPhoto
- cmd.editor.applyAdjustment, cmd.editor.applyPreset, cmd.editor.reset
- cmd.branch.create, cmd.branch.switch, cmd.branch.promote
- cmd.compare.toggleLayout, cmd.compare.setA, cmd.compare.setB
- cmd.write.enqueue, cmd.write.flush, cmd.write.retry
- cmd.analytics.emit, cmd.analytics.toggle

### Data Flow

- User edits → UI dispatch → DB updates (canonical) → write‑queue schedules → `.tiff` XMP payload updated atomically → indexer reconciles mappings.

### Testing Strategy

- Unit: schemas (Zod), sidecar manager reconciliation, XMP encode/decode, write‑queue atomicity.
- Scenario: edit→branch→compare pipelines under tests/scenarios; queue coalescing; recovery after simulated crash.
- E2E: directory pick, selection, adjustments reflect in viewer; background writes do not block interaction.

### Migration Path (from current code)

- Add DB collections for photos/branches/adjustments in [apps/fade/src/lib/db.ts](file:///Users/shikanimedeva/Source/Repos/github.com/shikanime-studio/websites/apps/fade/src/lib/db.ts).
- Create lib/sidecar and lib/write‑queue directories with scaffolds; adopt packages/vfs helpers.
- Enhance packages/medialab with xmp.ts and tiff‑writer utilities, then consume from app.
- Wire command bus topics into components; refactor custom hooks to use bus + DB selectors.

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
TanStack Start + Router/Query/DB integrates cleanly with Vite, Tailwind, and Cloudflare Worker entry. Chrome‑only + FS Access pairs with local‑first storage and WebGPU capability detection without conflicts. XMP embedding is compatible with TIFF primitives in medialab; privacy guards avoid leaking paths/PII.

**Pattern Consistency:**
Naming (camelCase fields, PascalCase components, kebab‑case files) is consistent. Command bus mediates feature actions. Zod validation precedes writes. Atomic write and debouncing patterns align with non‑blocking UI and crash safety.

**Structure Alignment:**
Feature‑first directories with lib services support decisions. Boundaries isolate VFS, sidecar manager, write queue, render scheduler, and analytics. Integration points (providers, routes, services) are explicit and coherent.

### Requirements Coverage Validation ✅

**Epic/Feature Coverage:**
E1–E8 features have explicit modules, routes, and services mapped. Cross‑feature dependencies (render scheduling across editor/compare, write queue feedback in diagnostics) are architecturally handled.

**Functional Requirements Coverage:**
All FRs including metadata embedding (FR39–FR41) are supported: local‑first intake, non‑destructive branching, compare, debounced `.tiff` outputs with XMP, batch apply, configurable hotkeys, presets, diagnostics, and opt‑in analytics.

**Non-Functional Requirements Coverage:**
Performance guarded by render scheduler and GPU pipeline; reliability via atomic writes, debouncing, and crash‑safe resume; security/privacy through local‑first posture and metadata minimalism; accessibility via keyboard‑first controls; observability through privacy‑safe event taxonomy.

### Implementation Readiness Validation ✅

**Decision Completeness:**
Critical decisions documented; versions aligned (React/TanStack/TypeScript/Tailwind/Wrangler). Metadata namespace defined. Conflict resolution rules stated.

**Structure Completeness:**
Specific directories and files defined; providers and services placed. Integration points specified (command bus topics, service interfaces).

**Pattern Completeness:**
Conflict points covered (naming, events, state, error handling, loading). Zod validation + atomic write process documented. Examples included for good/anti‑patterns.

### Gap Analysis Results

**Critical Gaps:**
- Write Queue and TIFF metadata writer not yet implemented.
- Sidecar Manager (`.tiff` XMP read/write + reconciliation) not yet implemented.

**Important Gaps:**
- Formal hotkeys library adoption decision (keep custom or adopt TanStack Hotkeys).
- Indexer detailing for large folders and progressive pagination.

**Nice-to-Have Gaps:**
- Additional analytics counters and latency histograms.
- More preset definitions and serialization examples.

### Validation Issues Addressed
Plan includes module scaffolds, contracts, and migration path to close critical gaps. Privacy rules and atomic write semantics reduce risk during implementation.

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**✅ Architectural Decisions**
- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**✅ Implementation Patterns**
- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented

**✅ Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** high

**Key Strengths:**
Local‑first posture, clear canonical → sidecar/XMP flow, atomic write guarantees, feature decoupling via command bus, TanStack ecosystem alignment, GPU‑aware scheduler.

**Areas for Future Enhancement:**
Cloud sync/collaboration seams, AI assistance hooks, richer GPU pipelines, expanded diagnostics/observability.

### Implementation Handoff

**AI Agent Guidelines:**
- Follow architectural decisions; use documented schemas and contracts.
- Route actions through command bus; validate with Zod before writes.
- Respect boundaries (VFS, sidecar manager, write queue, scheduler).

**First Implementation Priority:**
Create DB schemas for photos/branches/adjustments; scaffold lib/sidecar and lib/write‑queue; add medialab xmp/tiff‑writer utilities; wire command bus topics in components.

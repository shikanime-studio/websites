---
stepsCompleted:
  - step-01-init.md
  - step-01b-continue.md
  - step-02-discovery.md
  - step-02b-vision.md
  - step-02c-executive-summary.md
  - step-03-success.md
  - step-04-journeys.md
  - step-05-domain.md
  - step-06-innovation.md
  - step-07-project-type.md
  - step-08-scoping.md
  - step-09-functional.md
  - step-10-nonfunctional.md
  - step-11-polish.md
  - step-12-complete.md
inputDocuments: []
documentCounts:
  briefCount: 0
  researchCount: 0
  brainstormingCount: 0
  projectDocsCount: 0
workflowType: 'prd'
classification:
  projectType: web_app
  domain: creative_imaging
  complexity: high
  projectContext: greenfield
---

# Product Requirements Document - Fade

**Author:** Shikanimedeva
**Date:** 2026-03-30

## Executive Summary

Fade is a modern, local‑first, in‑browser photo editor that directly competes with Lightroom. It targets high‑resolution, professional‑grade workflows while staying accessible to serious hobbyists. The core vision is rapid, precise creative exploration: non‑destructive branching enables fast experimentation, and batch application lets users propagate consistent edits across large shoots. A WebGPU pipeline delivers performance for large RAW/high‑definition images, while VFS abstraction preserves privacy and control by keeping files local and enabling optional backends (File System Access API, remote cloud, S3‑like). AI features (e.g., text‑to‑light/color) augment editing but remain fully adjustable and reversible.

### What Makes This Special

- WebGPU‑accelerated, in‑browser editing at professional fidelity; no desktop install or vendor lock‑in.
- First‑class branching model for non‑destructive creative exploration; easy comparison and rollback.
- Local‑first architecture with VFS for precision and trust, plus pluggable storage backends.
- Batch‑oriented workflow tuned for 300+ high‑definition photos per project; fast propagation of edits.
- AI‑assist as an opt‑in accelerator; edits remain deterministic, inspectable, and adjustable.

## Project Classification

- Project Type: web app
- Domain: creative imaging
- Complexity: high
- Project Context: greenfield

## Success Criteria

### User Success

- Import 300+ high‑definition photos per project with responsive UI and clear progress feedback; baseline throughput target: 300 RAW images in < 90s on a modern laptop with integrated GPU.
- Non‑destructive branching as a first‑class action: branch creation < 300ms; unlimited branch depth; visual diff; easy revert; side‑by‑side compare.
- Batch apply edits at scale: apply to 300 photos in < 10s with conflict‑free propagation; preview deltas before commit; undo/redo across batch.
- Compare and cull efficiently: keyboard‑first navigation; compare view switch < 100ms; rating/flagging flows; clear “done” path to export/share.

### Business Success

- 3‑month indicators: 500 WAU; D7 retention ≥ 35%; ≥ 2 batch‑edit sessions/week per active user; ≥ 30 exports per session median; newsletter/early‑access conversion ≥ 15%.
- 12‑month outcomes: paid conversion ≥ 8%; 200 power users (weekly heavy usage); NPS ≥ 40; referral rate ≥ 15%.

### Technical Success

- Performance: render/adjustments meet 16ms/frame budget for smooth interaction; branch creation < 300ms; batch apply (300 photos) < 10s; export (50 photos) < 60s.
- Reliability: crash rate < 1 per 1k sessions; autosave/transaction safety for edits; non‑destructive history graph remains consistent under stress.
- Architecture: WebGPU pipeline passes conformance tests; VFS baseline uses File System Access API with experimental cloud/S3 backends; offline correctness; zero data exfiltration unless configured by user.

### Measurable Outcomes

- Baseline hardware: modern laptop with integrated GPU (e.g., Apple Silicon M‑class, 16GB RAM).
- KPIs tracked: intake throughput; branch latency; batch apply duration; compare switch latency; export throughput; crash rate; retention (D7/D30); WAU/MAU; conversion; referral; NPS.

## Product Scope

### MVP - Minimum Viable Product

- Import; viewport (zoom/pan); baseline adjustments (exposure, contrast, white balance, saturation); non‑destructive history; branching; side‑by‑side compare; batch apply; export (JPEG/PNG); local‑first VFS; keyboard navigation; presets (basic).

### Growth Features (Post‑MVP)

- Advanced masking; curves/HSL/LUTs; preset management and sharing; performance tunings for large sets; storage backends (cloud/S3); session management; initial AI‑assist (text‑to‑light/color suggestions).

### Vision (Future)

- Full text‑to‑light/color with complete controllability; collaborative branching; cloud sync; smart collections; plugin API; ML‑assisted batch culling.

## User Journeys

- Primary User — Success Path (Photographer)
  - Opening Scene: The photographer opens a local folder containing ~300 high‑definition images from a recent shoot. The app indexes the folder and displays a responsive grid; no data leaves the machine.
  - Rising Action: They pick a photo and begin editing lighting/color. Each change writes to a sidecar file (non‑destructive). Edits are debounced; the system continuously produces an updated .tiff rendition in the folder without any save/export button.
  - Climax: They create a branch for an alternate look; this spawns a new sidecar while preserving the original. They experiment further, then select a subset and apply the branch edits across multiple photos. Batch propagation runs fast and reliably. Enter sticky Compare mode; keyboard shortcuts cycle branches and photos. 2‑up/3‑up layouts render instantly; branch toggle < 100ms.
  - Resolution: The folder now contains original assets plus debounced .tiff outputs aligned with each photo and branch. The photographer repeats the cycle on additional sets, confident that history is captured via sidecars and outputs are current. Publishing/export is deferred to a dedicated app at a later stage.

- Primary User — Edge Case (Compare/Navigation)
  - Opening Scene: Large set with multiple branches per photo.
  - Rising Action: Rapid toggling between experiments risks starving the render loop.
  - Climax: Renderer prioritizes compare frames; background debounced writes are decoupled; fallbacks prevent frame drops; branch toggle stays < 100ms.
  - Resolution: Navigation remains smooth; the debounced .tiff queue drains without impacting compare mode; sidecars and outputs remain consistent.

- Admin/Operations (Configuration/Presets)
  - Opening Scene: An operations user configures VFS backends (local baseline; experimental cloud/S3 later), chooses sidecar naming patterns, and sets debouncing thresholds.
  - Rising Action: They define preset packs (lighting/color recipes) and folder conventions for .tiff placement.
  - Climax: Presets and conventions are enforced; batch operations respect these policies.
  - Resolution: Teams share consistent presets; outputs remain predictable; storage is controlled.

- Support/Troubleshooting
  - Opening Scene: A user reports that .tiff outputs are missing for a subset.
  - Rising Action: Support guides the user to the diagnostics view showing filesystem permissions, write queue state, and recent errors without exposing private images.
  - Climax: The underlying cause (e.g., read‑only folder) is identified; suggestions resolve the issue.
  - Resolution: The system resumes debounced writes; sidecars and outputs are consistent again.

### Journey Requirements Summary

- Local‑first VFS: Safe folder access; permission handling; no network writes unless explicitly configured.
- Sidecar model: Non‑destructive edits stored per photo and per branch; clear mapping between original, embedded metadata sidecar(s) in `.tiff`, and outputs.
- Debounced .tiff output: Continuous, automatic writing with coalescing; atomic writes; visible status; queued retries on transient failures.
- Metadata embedding: Latest edit settings and branch identifiers written into `.tiff` XMP for portability; no JSON sidecars by default.
- Best‑effort Lightroom compatibility: when possible, `.tiff` XMP metadata is emitted in an Adobe-friendly way (standard XMP-in-TIFF embedding + compatible namespaces); behavior is best-effort and not guaranteed across all Lightroom versions.
- Branching: Fast creation; separate `.tiff` sidecar per branch; visual compare; batch apply across selections; deterministic propagation.
- Batch operations: Progress UI; conflict detection; undo/redo across batch; safeguards to avoid partial corruption.
- Compare mode: Sticky 2‑up/3‑up; instant experiment toggle (< 100ms); consistent framing; visual diff; keyboard shortcuts for next/prev photo, cycle branches, promote branch, quick assign to selection.
- Render scheduling: Prioritize interactive frames; background debounced writes and batch apply never stall UI.
- Diagnostics: Permissions, queue status, error logs without leaking image data; recovery flows.
- Configurability: Sidecar naming, output placement, debounce thresholds, preset management; future storage backends.

## Domain-Specific Requirements

### Compliance & Regulatory

- General privacy posture aligned with GDPR principles for any optional cloud backends (consent, transparency, data minimization).
- No regulated domain frameworks required; default behavior remains local‑first with zero network writes unless explicitly configured.

### Technical Constraints

- Large image handling: RAW/high‑definition formats; GPU/memory budget management; streaming/tiling; precise color pipeline.
- Local‑first privacy: transparent permission prompts; observable file operations; nothing leaves the machine by default.
- Deterministic non‑destructive history: sidecar format per photo and per branch; atomic writes; consistency across branches.
- Real‑time UX: render scheduling prioritizes interactive frames; compare/branch toggle < 100ms; batch apply respects UI responsiveness.

### Integration Requirements

- Sidecar and output conventions discoverable by the future export/publish app; clear metadata schema and stable naming.
- Optional storage backends (cloud/S3) later: credentials isolation; offline correctness; consistent path mapping across backends.

### Risk Mitigations

- File locking/permissions: queued retries; user prompts; safe fallbacks to prevent lost edits.
- Naming collisions: deterministic sidecar/output naming; branch IDs; conflict resolution strategies.
- Concurrency/atomicity: background write queue; atomic file writes; crash‑safe recovery and resumption.
- Performance cliffs: adaptive quality/progressive rendering for compare mode; backpressure for batch operations; monitoring to detect regressions.

## Innovation & Novel Patterns

### Detected Innovation Areas

- WebGPU‑accelerated, local‑first professional photo editing in the browser (desktop‑grade fidelity without vendor lock‑in).
- First‑class non‑destructive branching with instant compare navigation; 2‑up/3‑up layouts; branch toggle < 100ms.
- Debounced, continuous .tiff outputs — no explicit save/export; writes are coalesced and atomic to preserve responsiveness.
- VFS abstraction enabling multiple backends (File System Access API; future cloud/S3) while maintaining offline correctness and privacy.

### Market Context & Competitive Landscape

- Competes with desktop incumbents (e.g., Lightroom) by eliminating heavy installs and cloud lock‑in while retaining professional control.
- Differentiates from browser‑based tools by delivering GPU‑level performance, non‑destructive branching as a core primitive, and local‑first guarantees.

### Validation Approach

- Performance prototypes: measure branch creation latency (< 300ms), compare toggle (< 100ms), batch apply (300 photos < 10s), export throughput (50 photos < 60s).
- Stress tests: large RAW/high‑definition sets; concurrent edits; background write queue under load; crash‑safe recovery and resumption.
- User workflow tests: keyboard‑first navigation; rapid experiment compare; batch propagation confidence; sidecar consistency audits.
- Fallbacks: graceful degradation when WebGPU unavailable (e.g., WebGL/canvas paths); write queue backoff; UI remains responsive under backpressure.

### Risk Mitigation

- Browser variability: feature detection; capability‑based pipelines; adaptive quality; consistent color pipeline calibration.
- Filesystem constraints: permission prompts; queued retries; atomic writes; conflict resolution on naming collisions and locks.
- Concurrency: transactional sidecar updates; background write executor; integrity checks; crash recovery checkpoints.

## Web App Specific Requirements

### Project-Type Overview

- Chrome-only, secure-context (HTTPS) browser app for professional photo editing.
- Users open a directory via showDirectoryPicker, edit and branch non‑destructively (sidecars), and the system continuously (debounced) materializes `.tiff` outputs — no save/export UI.
- Metadata and edit state live locally in `@tanstack/db`; future Cloudflare sync/collaboration/AI, but MVP is single-user.

### Technical Architecture Considerations

- Chrome desktop target using WebGPU and File System Access API; TanStack Start application for routing and configuration consistency.
- Secure context and transient user activation required for directory picking; handle permission/Abort errors cleanly.
- Filesystem limited to directory read/write; canonical edit state flows through `@tanstack/db` and is dumped into `.tiff` sidecar metadata (XMP) for portability; indexing uses DB + file scan to reconcile.
- Embedded metadata captures latest adjustments and branch identifiers; background/debounced `.tiff` writes never block interactive editing/compare.
- When feasible, embed XMP using the standard TIFF XMP tag and include Adobe-friendly namespaces; optionally mirror a supported subset of adjustments into `crs:` for best-effort Lightroom compatibility while keeping a `fade:` schema for canonical parsing.

### Browser Matrix

- Supported (MVP): Chrome Stable (desktop).
- Out of scope (MVP): Safari, Firefox, mobile.
- Degraded-mode messaging when capabilities (WebGPU/FS Access) are unavailable.

### Responsive Design

- Desktop-first; mouse/keyboard.
- Keyboard-first navigation and compare are first-class; sticky Compare (2‑up/3‑up) with instant experiment toggles.

### Performance Targets (Experimentation Loop Priority)

- Open → edit → branch → compare/toggle experiments must feel instant:
  - Compare/branch toggle < 100ms perceived response
  - Branch creation < 300ms
  - Background debounced `.tiff` writes never stall UI
- Batch apply can be slower; must not degrade interactive responsiveness.

### SEO Strategy

- None for MVP (app UI, not marketing pages).

### Accessibility Level

- MVP: strong keyboard support (shortcuts, focus management, no traps), clear status messaging.

### Keyboard/Hotkeys

- Implement with TanStack Hotkeys.
- User-configurable bindings saved locally in `@tanstack/db`; desktop-app style keymap, defaults aligned to pro photo editors.
- Command coverage: next/prev photo; grid/editor switches; toggle compare; switch 2‑up/3‑up; cycle experiments/branches; create/promote branch; apply to selection; rating/flagging; search/filter.
- Context-aware: global vs scoped shortcuts (grid/editor/compare); preventDefault for conflicts; collision detection with resolution flow.
- Persistence: store keymaps locally; no export of `@tanstack/db` content in MVP; include reset-to-default.
- Performance: sub‑frame dispatch; integrates with render scheduler to keep compare/navigation responsive.

### Implementation Considerations

- Directory selection UX: clear CTA; robust error handling for Abort/permissions/sensitive directories.
- Data safety: atomic writes for sidecars/`.tiff`; crash‑safe write queue with resume.
- Future-facing: architecture ready for Cloudflare sync/collab/AI; MVP remains single-user/local-first.

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** Experience MVP — prioritize the experimentation loop (open, edit, branch, compare) feeling instant and reliable.
**Resource Requirements:** Solo/full-stack developer with design support; part-time QA assistance for performance/latency validation.

### MVP Feature Set (Phase 1)

**Core User Journeys Supported:**
- Open local folder (~300 photos), browse grid, open editor
- Non‑destructive edits with sidecars, branch creation, sticky Compare (2‑up/3‑up)
- Keyboard-first navigation with configurable Hotkeys
- Debounced, continuous `.tiff` outputs; diagnostics for permissions/write queue
- Basic batch apply to selection without impacting interactive responsiveness

**Must-Have Capabilities:**
- Chrome-only secure-context app; File System Access via `showDirectoryPicker`
- WebGPU rendering pipeline; baseline adjustments (exposure, contrast, WB, saturation)
- Branching model; compare/branch toggle < 100ms; branch creation < 300ms
- Background write queue with atomic sidecar/`.tiff` writes; crash-safe resume
- TanStack Hotkeys with local keymap persistence in `@tanstack/db`

### Post-MVP Features

**Phase 2 (Growth):**
- Advanced masking; curves/HSL/LUTs; preset management/sharing
- Performance tunings for large sets; optional storage backends (cloud/S3)
- Initial AI assist (text‑to‑light/color suggestions); keymap UI polish
- Export/publish companion app integration (deferred from MVP)

**Phase 3 (Expansion):**
- Collaborative branching; Cloudflare sync of settings/edits; smart collections
- Plugin API; ML‑assisted culling; deeper metadata workflows

### Risk Mitigation Strategy

**Technical Risks:** Browser/WebGPU variability, FS Access limits, file atomicity/concurrency — mitigated via capability detection, transactional sidecar updates, atomic writes, background executor, progressive rendering.
**Market Risks:** Adoption against entrenched desktop tools — mitigate by delivering superior experimentation speed and local-first trust; gather power-user feedback early.
**Resource Risks:** Limited team capacity — enforce strict MVP scope; defer export/publish and multi-backend until core loop quality is validated.

## Functional Requirements

### Experimentation Loop

- FR1: Photographers can open a local folder and browse photos in a grid.
- FR2: Photographers can open a photo into an editor view.
- FR3: Photographers can make non-destructive adjustments to lighting/color.
- FR4: Photographers can compare edits side-by-side without leaving the editing context.
- FR5: Photographers can rapidly switch between photos while preserving edit context.

### Branching & Compare

- FR6: Photographers can create a branch for alternative edits on a photo.
- FR7: Photographers can switch between branches for a given photo.
- FR8: Photographers can promote a branch to become the primary version for a photo.
- FR9: Photographers can enter a sticky compare mode with 2-up or 3-up layouts.
- FR10: Photographers can cycle through experiments/branches using keyboard shortcuts.

### File System Access, Sidecars & Outputs

- FR11: Users can select a directory using the system directory picker.
- FR12: The system can read photo files from the selected directory.
- FR13: The system can write sidecar metadata embedded in `.tiff` outputs to store non-destructive edits and branch identifiers.
- FR14: The system can write debounced `.tiff` outputs reflecting current edits.
- FR15: Users can see status/feedback for background writes and queued operations.

### Metadata Embedding

- FR39: The system can embed the latest edit settings into `.tiff` metadata (EXIF/XMP) when technically feasible.
- FR40: The system can read embedded `.tiff` metadata to reconstruct baseline adjustments when sidecars are absent.
- FR41: Embedded metadata excludes file paths and image content, storing only normalized adjustments and branch identifiers.
### Batch Apply

- FR16: Photographers can select multiple photos and apply edits from a chosen branch to the selection.
- FR17: Photographers can preview changes before committing batch operations.
- FR18: Photographers can undo/redo batch operations.

### Keyboard & Hotkeys

- FR19: Photographers can use keyboard shortcuts for navigation (next/prev photo, grid/editor).
- FR20: Photographers can configure and save their own key bindings.
- FR21: Shortcuts can be scoped by context (grid, editor, compare).
- FR22: Users can reset key bindings to default.

### Presets & Adjustments

- FR23: Photographers can apply predefined presets to a photo.
- FR24: Photographers can create and save custom presets locally.

### Project/Folder Management

- FR25: Users can re-open the last used folder (when available) and switch folders.
- FR26: Users can filter and search within the folder (rating/flagging, filename).

### Diagnostics & Recovery

- FR27: Users can view diagnostics for permissions, write queue state, and recent errors.
- FR28: Users can retry failed writes and resolve permission issues guided by prompts.
- FR29: The system can recover from crashes and resume pending background writes.

### Future Sync/Collab (Stubs)

- FR30: Users can opt-in to cloud sync of settings/edits when available (deferred).
- FR31: Users can collaborate on edits with shared branches when available (deferred).

### AI Assist (Stubs)

- FR32: Users can optionally request AI-generated edit suggestions (deferred).
- FR33: Users can adjust and override AI suggestions with full control (deferred).

### Product Analytics

- FR34: The system can emit analytics events for key user actions (folder open, photo open, edit applied, branch create/promote/switch, compare enter/toggle, batch apply start/complete, diagnostics open, permission/write errors).
- FR35: Users can opt in/out of analytics; default is off until explicitly enabled.
- FR36: The system buffers analytics events offline and flushes when analytics are enabled and network is available.
- FR37: Analytics never include image content, file names, or file paths; only aggregate counts, latencies, and capability flags.
- FR38: Users can view the current analytics status (enabled/disabled) and basic counters for the session.
## Non-Functional Requirements

### Performance

- Experimentation loop interactions prioritize frame scheduling for responsiveness: compare toggle and branch switch operations render within a target frame budget (≈16ms) with perceived response < 100ms.
- Branch creation completes fast enough to preserve flow (target < 300ms) without blocking UI; background debounced `.tiff` writes are executed off the interactive path and never stall navigation/compare.
- Folder open and initial grid display for ~300 photos occurs with progressive indexing and avoids layout thrash; UI remains interactive while indexing.

### Reliability

- `.tiff` sidecar writes (including XMP metadata updates) are atomic with crash‑safe background queues; on restart, pending operations resume without data loss.
- Edit history and branching remain consistent under stress (concurrent edits, partial failures); diagnostics expose recoverable states and guide resolution.

### Integration

- File System Access API usage respects platform constraints: secure context (HTTPS) and transient user activation required to call `showDirectoryPicker`; handle `AbortError` and `SecurityError` gracefully; support `read`/`readwrite` directory modes; degrade with clear messaging when capabilities are unavailable or directories are disallowed.
- Capability detection selects appropriate graphics pipeline (WebGPU when available; fallback paths when not) without breaking the core editing loop.
- Metadata writing uses XMP under a dedicated namespace; updates are atomic and validated; when metadata is missing, treat the image as baseline/unedited.
- Metadata interoperability goal: best-effort compatibility with Adobe Lightroom by emitting XMP-in-TIFF in a standard form; never rely on Lightroom-specific parsing for correctness.

### Accessibility

- Keyboard‑first workflows with robust focus management (no keyboard traps) and consistent, perceivable status messaging for background operations.
- Baseline color/contrast and annunciation patterns suitable for power‑user desktop contexts; future WCAG alignment can expand scope, but MVP maintains strong keyboard accessibility.

### Security

- Local‑first privacy posture: no network writes unless explicitly configured by the user; operate in secure contexts (HTTPS) and respect permission prompts and scopes.
- Future cloud backends isolate credentials, maintain offline‑correctness semantics, and provide explicit user consent controls before any remote operations.

### Analytics & Observability

- Event taxonomy maps to critical user paths (AARRR): Activation (FolderOpened, PhotoEdited), Engagement (BranchCreated, CompareEntered/Toggle), Retention (SessionResumed, WeeklyActive), Referral (ShareIntent later), Revenue (UpgradeIntent later).
- Each event includes properties needed for actionable insights: counts (photoCount, selectionSize, branchCount), latencies (branchCreateMs, compareToggleMs, batchApplyMs), layout (compareLayout), capability flags (webgpuAvailable, fsAccessAvailable).
- Offline-first buffering persists events locally and flushes when analytics are enabled; failures are retried without impacting UI responsiveness.
- Privacy posture: opt-in, no PII, no file metadata beyond aggregate counts; analytics configuration surfaced clearly in settings.

## Product Analytics

### Principles

- Actionable metrics aligned to growth stages; instrumentation emphasizes activation and engagement in the experimentation loop.
- Local-first and privacy-preserving: analytics are opt-in, minimal, and exclude any image/file identifiers.

### Event Taxonomy

- FolderOpened: photoCount, hardware capabilities.
- PhotoOpened: photoIndex, branchCount.
- EditApplied: adjustmentType, magnitude, isPreset.
- BranchCreated/Promoted/Switched: branchId, branchCount.
- CompareEntered/CompareLayoutChanged/CompareToggleExperiment: layout, branchId.
- BatchApplyStarted/Completed: selectionSize, sourceBranchId, durationMs.
- TiffMetadataWriteQueued/Completed and TiffWriteQueued/Completed: queueDepth, durationMs, outcome.
- DiagnosticsOpened: reason.
- PermissionError/WriteError: errorType, recoverable.
- HotkeyUsed/KeymapChanged: command, context.

### Funnels & KPIs

- Activation: FolderOpened → PhotoOpened → EditApplied.
- Engagement: BranchCreated → CompareEntered → CompareToggleExperiment.
- Reliability: WriteQueued → WriteCompleted; Error rates; Recovery successes.
- Retention: Sessions/week; repeat activation of core loop.

### Implementation Notes

- Integrate with Mixpanel when enabled; use environment tokens and API host configured per app.
- Buffer offline in local storage; flush on enable and network availability; rate-limit to avoid UI impact.

## Epics & Stories

### E1 — Folder Intake & Grid

- US1: As a Photographer, I can open a local folder to start a session.
  - Acceptance: Secure-context prompt appears; after selection, grid renders progressively; no network writes occur.
- US2: As a Photographer, I see progressive indexing with interactive UI.
  - Acceptance: Grid shows photos as they’re discovered; scrolling and selection remain responsive during indexing.
- US3: As a Photographer, I’m guided when permissions or locks prevent reads/writes.
  - Acceptance: Clear error state with suggested actions; diagnostics link available; app remains usable.

### E2 — Editor & Baseline Adjustments

- US4: As a Photographer, I can adjust exposure/contrast/WB/saturation non‑destructively.
  - Acceptance: Changes update preview instantly; sidecar records adjustments; undo/redo works.
- US5: As a Photographer, I can zoom/pan precisely on large images.
  - Acceptance: Interaction feels smooth; no stutter on integrated GPU hardware baseline.
- US6: As a Photographer, I can apply a preset to a photo.
  - Acceptance: Preset applies instantly; reflected in sidecar; can revert via undo.

### E3 — Branching & Compare

- US7: As a Photographer, I can create a branch for alternative edits.
  - Acceptance: Branch creation < 300ms; new sidecar exists; branch listed in UI.
- US8: As a Photographer, I can switch and promote branches.
  - Acceptance: Toggle < 100ms; promote updates primary; history remains consistent.
- US9: As a Photographer, I can compare 2‑up/3‑up and toggle experiments via keyboard.
  - Acceptance: Layout switches without jank; keyboard cycles experiments; framing stays consistent.

### E4 — File System & Write Queue

- US10: As a Photographer, my edits are saved atomically in sidecars.
  - Acceptance: Partial writes never corrupt data; crash‑safe guarantees; recovery resumes.
- US11: As a Photographer, `.tiff` outputs are written continuously and debounced.
  - Acceptance: Writes coalesce; status visible; compare/navigation remain responsive.
- US12: As a Photographer, pending writes resume after restart.
  - Acceptance: Queue persists; retry/backoff applied; user notified of completions/errors.

### E5 — Batch Apply

- US13: As a Photographer, I can apply edits from a branch to a selection.
  - Acceptance: Progress UI shows; background executor runs; interactive UI unaffected.
- US14: As a Photographer, I can preview deltas before committing.
  - Acceptance: Preview lists changed parameters; commit applies deterministically.
- US15: As a Photographer, I can undo/redo batch operations.
  - Acceptance: Undo restores prior state; redo reapplies; sidecars remain consistent.

### E6 — Keyboard & Hotkeys

- US16: As a Photographer, I can configure and save key bindings locally.
  - Acceptance: Defaults provided; conflicts detected with resolution flow; persistence in `@tanstack/db`.
- US17: As a Photographer, shortcuts adapt to context (grid/editor/compare).
  - Acceptance: Scope is enforced; preventDefault handles conflicts; sub‑frame dispatch.
- US18: As a Photographer, I can reset keymap to defaults.
  - Acceptance: One action restores defaults; change history tracked.

### E7 — Diagnostics & Recovery

- US19: As a Photographer, I can open diagnostics to see permissions/queue/errors.
  - Acceptance: No private image data exposed; actionable guidance included.
- US20: As a Photographer, I can retry failed writes.
  - Acceptance: Retry respects backoff; outcome status is visible; failures logged.
- US21: As a Photographer, I receive guided prompts to resolve permission issues.
  - Acceptance: Prompts link to OS/browser guidance; app state remains safe.

### E8 — Product Analytics (Opt‑In)

- US22: As a Photographer, I can enable/disable analytics explicitly.
  - Acceptance: Default off; toggle is clear; privacy statement shown.
- US23: As an Operator, I can buffer events offline and flush when enabled.
  - Acceptance: Events persist locally; no UI impact; flush respects rate limits.
- US24: As a Photographer, I can view session counters for key actions.
  - Acceptance: Counters show aggregate counts/latencies and capability flags; no PII or file metadata.

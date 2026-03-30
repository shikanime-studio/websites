---
stepsCompleted:
  - step-01-validate-prerequisites.md
  - step-02-design-epics.md
  - step-03-create-stories.md
  - step-04-final-validation.md
inputDocuments:
  - /Users/shikanimedeva/Source/Repos/github.com/shikanime-studio/websites/_bmad-output/planning/prd.md
  - /Users/shikanimedeva/Source/Repos/github.com/shikanime-studio/websites/_bmad-output/planning/architecture.md
---

# Fade - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Fade, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Photographers can open a local folder and browse photos in a grid.
FR2: Photographers can open a photo into an editor view.
FR3: Photographers can make non-destructive adjustments to lighting/color.
FR4: Photographers can compare edits side-by-side without leaving the editing context.
FR5: Photographers can rapidly switch between photos while preserving edit context.
FR6: Photographers can create a branch for alternative edits on a photo.
FR7: Photographers can switch between branches for a given photo.
FR8: Photographers can promote a branch to become the primary version for a photo.
FR9: Photographers can enter a sticky compare mode with 2-up or 3-up layouts.
FR10: Photographers can cycle through experiments/branches using keyboard shortcuts.
FR11: Users can select a directory using the system directory picker.
FR12: The system can read photo files from the selected directory.
FR13: The system can write sidecar metadata embedded in `.tiff` outputs to store non-destructive edits and branch identifiers.
FR14: The system can write debounced `.tiff` outputs reflecting current edits.
FR15: Users can see status/feedback for background writes and queued operations.
FR16: Photographers can select multiple photos and apply edits from a chosen branch to the selection.
FR17: Photographers can preview changes before committing batch operations.
FR18: Photographers can undo/redo batch operations.
FR19: Photographers can use keyboard shortcuts for navigation (next/prev photo, grid/editor).
FR20: Photographers can configure and save their own key bindings.
FR21: Shortcuts can be scoped by context (grid, editor, compare).
FR22: Users can reset key bindings to default.
FR23: Photographers can apply predefined presets to a photo.
FR24: Photographers can create and save custom presets locally.
FR25: Users can re-open the last used folder (when available) and switch folders.
FR26: Users can filter and search within the folder (rating/flagging, filename).
FR27: Users can view diagnostics for permissions, write queue state, and recent errors.
FR28: Users can retry failed writes and resolve permission issues guided by prompts.
FR29: The system can recover from crashes and resume pending background writes.
FR30: Users can opt-in to cloud sync of settings/edits when available (deferred).
FR31: Users can collaborate on edits with shared branches when available (deferred).
FR32: Users can optionally request AI-generated edit suggestions (deferred).
FR33: Users can adjust and override AI suggestions with full control (deferred).
FR34: The system can emit analytics events for key user actions (folder open, photo open, edit applied, branch create/promote/switch, compare enter/toggle, batch apply start/complete, diagnostics open, permission/write errors).
FR35: Users can opt in/out of analytics; default is off until explicitly enabled.
FR36: The system buffers analytics events offline and flushes when analytics are enabled and network is available.
FR37: Analytics never include image content, file names, or file paths; only aggregate counts, latencies, and capability flags.
FR38: Users can view the current analytics status (enabled/disabled) and basic counters for the session.
FR39: The system can embed the latest edit settings into `.tiff` metadata (EXIF/XMP) when technically feasible.
FR40: The system can read embedded `.tiff` metadata to reconstruct baseline adjustments when sidecars are absent.
FR41: Embedded metadata excludes file paths and image content, storing only normalized adjustments and branch identifiers.

### NonFunctional Requirements

NFR1: Compare toggle and branch switch interactions meet a frame budget of approximately 16ms with perceived response under 100ms.
NFR2: Branch creation completes under 300ms without blocking the UI.
NFR3: Background debounced `.tiff` writes run off the interactive path and never stall navigation/compare responsiveness.
NFR4: Folder open and initial grid display for approximately 300 photos uses progressive indexing; UI remains interactive while indexing.
NFR5: `.tiff` sidecar writes (including XMP metadata updates) are atomic and crash-safe; pending operations resume after restart without data loss.
NFR6: Edit history and branching remain consistent under stress (concurrent edits, partial failures) and diagnostics expose recoverable states with guidance.
NFR7: File System Access usage respects secure-context and transient activation constraints; `AbortError`/`SecurityError` are handled gracefully with clear degraded-mode messaging.
NFR8: Capability detection selects an appropriate graphics pipeline (WebGPU preferred, fallback when unavailable) without breaking the core editing loop.
NFR9: Metadata writing uses a dedicated XMP namespace; updates are atomic and validated; missing metadata is treated as baseline/unedited.
NFR10: Metadata interoperability is best-effort with Lightroom via standard XMP-in-TIFF embedding; correctness never depends on Lightroom parsing.
NFR11: Keyboard-first workflows have robust focus management (no keyboard traps) and perceivable status messaging for background operations.
NFR12: Default behavior is local-first with no network writes unless explicitly configured by the user; permissions and scopes are respected.
NFR13: Any future cloud backend isolates credentials, preserves offline-correctness semantics, and requires explicit user consent before remote operations.
NFR14: Analytics are opt-in, offline-buffered, and privacy-preserving (no PII, no file identifiers) and include only aggregate counts, latencies, layout, and capability flags needed for actionable insights.

### Additional Requirements

- Starter baseline: TanStack Start (Vite-based) aligned with TanStack Router/Query/DB patterns used in apps/fade.
- Chrome-only + secure context: FS Access requires HTTPS + transient user activation; degraded-mode messaging required when unavailable.
- Canonical state: persisted preferences/session counters in `@tanstack/db` (react-db); `.tiff` XMP is the portable persisted metadata layer for branch identifiers and latest adjustments.
- Sidecar/XMP schema: write under a `fade` namespace; validate payload with Zod before write; embed using TIFF XMP tag 700; optionally mirror supported adjustments into `crs:` for best-effort Adobe compatibility without breaking `fade:` parsing.
- Atomic write semantics: temp write + replace; retry/backoff for write queue (exponential backoff starting at 250ms, cap 5s, jittered); crash-safe resume via index scan/reconciliation.
- Render scheduling: central scheduler prioritizes interactive editor/compare frames over background IO and batch operations.
- Feature boundaries: feature-first modules (grid/editor/compare/batch/diagnostics/settings) communicate via a command bus; avoid cross-feature internal state imports.
- Diagnostics constraints: surface permission/queue/error state without leaking image content, file names, or paths.
- Testing expectations: unit tests for schema validation, XMP encode/decode, atomic writes; scenario tests for edit→branch→compare and recovery; Playwright E2E for user flows where applicable.
- Analytics integration: Mixpanel only when enabled; offline buffering; privacy guards prevent PII or file metadata leakage.

### UX Design Requirements

None provided yet (to be added when a UX Design spec exists).

### FR Coverage Map

FR1: Epic 1 - Open & Organize a Photo Folder
FR2: Epic 2 - Edit Photos (Baseline Workflow)
FR3: Epic 2 - Edit Photos (Baseline Workflow)
FR4: Epic 4 - Branch & Compare Looks
FR5: Epic 2 - Edit Photos (Baseline Workflow)
FR6: Epic 4 - Branch & Compare Looks
FR7: Epic 4 - Branch & Compare Looks
FR8: Epic 4 - Branch & Compare Looks
FR9: Epic 4 - Branch & Compare Looks
FR10: Epic 4 - Branch & Compare Looks
FR11: Epic 1 - Open & Organize a Photo Folder
FR12: Epic 1 - Open & Organize a Photo Folder
FR13: Epic 5 - Reliable Saving & Portable TIFF Metadata
FR14: Epic 5 - Reliable Saving & Portable TIFF Metadata
FR15: Epic 5 - Reliable Saving & Portable TIFF Metadata
FR16: Epic 6 - Batch Apply (Edit at Scale)
FR17: Epic 6 - Batch Apply (Edit at Scale)
FR18: Epic 6 - Batch Apply (Edit at Scale)
FR19: Epic 7 - Keyboard & Custom Hotkeys
FR20: Epic 7 - Keyboard & Custom Hotkeys
FR21: Epic 7 - Keyboard & Custom Hotkeys
FR22: Epic 7 - Keyboard & Custom Hotkeys
FR23: Epic 3 - Presets (Fast Starting Points)
FR24: Epic 3 - Presets (Fast Starting Points)
FR25: Epic 1 - Open & Organize a Photo Folder (Switch Folder) + Epic 9 - Deferred Features (Re-open Recent)
FR26: Epic 1 - Open & Organize a Photo Folder
FR27: Epic 9 - Deferred Features
FR28: Epic 9 - Deferred Features
FR29: Epic 5 - Reliable Saving & Portable TIFF Metadata
FR30: Epic 9 - Deferred Features
FR31: Epic 9 - Deferred Features
FR32: Epic 9 - Deferred Features
FR33: Epic 9 - Deferred Features
FR34: Epic 8 - Privacy-Preserving, Opt-In Analytics
FR35: Epic 8 - Privacy-Preserving, Opt-In Analytics
FR36: Epic 8 - Privacy-Preserving, Opt-In Analytics
FR37: Epic 8 - Privacy-Preserving, Opt-In Analytics
FR38: Epic 8 - Privacy-Preserving, Opt-In Analytics
FR39: Epic 5 - Reliable Saving & Portable TIFF Metadata
FR40: Epic 5 - Reliable Saving & Portable TIFF Metadata
FR41: Epic 5 - Reliable Saving & Portable TIFF Metadata

## Epic List

### Epic 1: Open & Organize a Photo Folder
Users can pick a folder, browse a grid, and find photos quickly.
**FRs covered:** FR1, FR11, FR12, FR25, FR26

### Epic 2: Edit Photos (Baseline Workflow)
Users can open a photo, adjust baseline controls, and move quickly between photos while staying in flow.
**FRs covered:** FR2, FR3, FR5

### Epic 3: Presets (Fast Starting Points)
Users can apply predefined presets and create/save their own presets locally.
**FRs covered:** FR23, FR24

### Epic 4: Branch & Compare Looks
Users can branch edits, switch/promote branches, and compare 2-up/3-up with fast toggling and keyboard cycling.
**FRs covered:** FR4, FR6, FR7, FR8, FR9, FR10

### Epic 5: Reliable Saving & Portable TIFF Metadata
Users get continuous debounced `.tiff` outputs and portable embedded metadata that can be read back to reconstruct edits.
**FRs covered:** FR13, FR14, FR15, FR29, FR39, FR40, FR41

### Epic 6: Batch Apply (Edit at Scale)
Users can batch-apply edits to a selection, preview deltas, and undo/redo batch operations.
**FRs covered:** FR16, FR17, FR18

### Epic 7: Keyboard & Custom Hotkeys
Users can navigate/edit via keyboard, customize bindings, scope shortcuts by context, and reset defaults.
**FRs covered:** FR19, FR20, FR21, FR22

### Epic 8: Privacy-Preserving, Opt-In Analytics
Users can explicitly enable/disable analytics; the system buffers offline and exposes basic counters without leaking private data.
**FRs covered:** FR34, FR35, FR36, FR37, FR38

### Epic 9: Deferred Features
Deferred work is grouped explicitly so it doesn’t block MVP sequencing.
**FRs covered:** FR27, FR28, FR30, FR31, FR32, FR33

## Epic 1: Open & Organize a Photo Folder

Users can pick a folder, browse a grid, and find photos quickly.

### Story 1.1: Set Up Initial Project from Starter Template

As a Developer,
I want to set up the Fade app from the selected TanStack Start starter baseline,
So that I can implement features with the expected architecture and tooling.

**Implements:** FR11

**Acceptance Criteria:**

**Given** I have the repository checked out locally
**When** I install dependencies and run the Fade dev server
**Then** the app starts successfully and loads the start screen
**And** the start screen provides an “Open Folder” entry point that triggers the system directory picker

**Given** the project is running
**When** I navigate between the primary routes (grid, editor, compare, settings)
**Then** each route renders without runtime errors
**And** feature modules are structured in alignment with the architecture requirements

### Story 1.2: Choose a Folder to Start a Session

As a Photographer,
I want to select a local folder in the browser,
So that I can start working on my photo set.

**Implements:** FR11

**Acceptance Criteria:**

**Given** I am on the app start screen
**When** I click “Open Folder”
**Then** the system directory picker is shown and I can select a folder
**And** after selection, the app enters a folder session state

**Given** the system directory picker is open
**When** I cancel selection
**Then** the app remains in an idle state without starting a folder session
**And** a neutral “Selection cancelled” status is shown

**Given** directory picking is not available (unsupported capability or insecure context)
**When** I attempt to open a folder
**Then** the app shows a clear message about the requirements (Chrome desktop + secure context)
**And** the app remains usable without crashing

### Story 1.3: Scan Folder and Render a Photo Grid

As a Photographer,
I want the app to scan my selected folder and show my photos in a grid,
So that I can quickly pick an image to edit.

**Implements:** FR1, FR12

**Acceptance Criteria:**

**Given** I have selected a folder
**When** scanning begins
**Then** the grid shows photos progressively as they are discovered
**And** the UI remains interactive while scanning continues

**Given** the folder contains many photos (for example, around 300)
**When** scanning is ongoing
**Then** I can scroll and interact with the grid without major stalls
**And** the app shows visible indexing progress (for example, counts or a progress indicator)

**Given** a file cannot be read
**When** the scan reaches that file
**Then** the scan continues for other files
**And** the app surfaces a non-blocking warning that some items could not be indexed

### Story 1.4: Switch Folders

As a Photographer,
I want to switch to a different folder,
So that I can move between shoots.

**Implements:** FR25

**Acceptance Criteria:**

**Given** I am in a folder session
**When** I choose “Switch Folder”
**Then** the system directory picker is shown and I can select a new folder
**And** the grid resets to show only the new folder’s contents

### Story 1.5: Search and Filter Within a Folder

As a Photographer,
I want to search and filter my grid,
So that I can find specific photos quickly.

**Implements:** FR26

**Acceptance Criteria:**

**Given** I am viewing the grid
**When** I enter a filename search term
**Then** the grid filters to matching photos
**And** clearing the search restores the full set

**Given** photos have rating and/or flag state
**When** I apply rating and/or flag filters
**Then** only photos matching those criteria are shown
**And** filters can be combined with filename search

### Story 1.6: Rate and Flag Photos

As a Photographer,
I want to rate and flag photos,
So that I can cull and organize a shoot efficiently.

**Implements:** FR26

**Acceptance Criteria:**

**Given** I am in the grid
**When** I assign a rating or a flag to a photo
**Then** the grid reflects the updated rating or flag state immediately
**And** the rating or flag persists locally for that folder session

**Given** I reopen the app later and select the same folder again
**When** the grid loads
**Then** previously assigned ratings and flags are restored (local-first persistence)

## Epic 2: Edit Photos (Baseline Workflow)

Users can open a photo, adjust baseline controls, and move quickly between photos while staying in flow.

### Story 2.1: Open a Photo in the Editor

As a Photographer,
I want to open a photo from the grid into an editor view,
So that I can start editing it.

**Implements:** FR2

**Acceptance Criteria:**

**Given** I am viewing a grid with at least one photo
**When** I activate a photo (click or keyboard open)
**Then** the app navigates to an editor view for that photo
**And** the editor shows a loading state until the image is ready to render

**Given** the selected photo cannot be rendered
**When** the editor attempts to load it
**Then** the app shows a clear error state for that photo
**And** I can return to the grid without losing the folder session

**Given** WebGPU is unavailable
**When** I attempt to open the editor
**Then** the app shows a clear degraded-mode message describing the limitations
**And** the app remains usable without crashing

### Story 2.2: Apply Baseline Adjustments Non-Destructively

As a Photographer,
I want to adjust baseline lighting and color controls,
So that I can quickly refine a photo without changing the original file.

**Implements:** FR3

**Acceptance Criteria:**

**Given** a photo is open in the editor
**When** I change a baseline adjustment control (exposure, contrast, white balance, saturation)
**Then** the preview updates immediately for interactive use
**And** the original source image is not modified

**Given** I have changed one or more adjustments
**When** I reset adjustments
**Then** all baseline adjustments return to defaults
**And** the preview reflects the reset state

**Given** I am editing a photo
**When** I apply multiple changes quickly (for example, dragging sliders)
**Then** the UI remains responsive without obvious stalls
**And** the latest adjustment state is coherent

### Story 2.3: Navigate Between Photos While Preserving Editor Context

As a Photographer,
I want to move to the next or previous photo while staying in the editor,
So that I can edit a set quickly without losing my workflow context.

**Implements:** FR5

**Acceptance Criteria:**

**Given** I am in the editor on photo A
**When** I navigate to the next or previous photo
**Then** the editor transitions to photo B without returning to the grid
**And** the app preserves the editor context (for example, which panel or tool is open)

**Given** I have edit state in the session for photo A
**When** I navigate away and later return to photo A
**Then** the adjustment state I made for photo A is restored in the editor
**And** there is no leakage of photo A’s adjustments into photo B

### Story 2.4: Persist Baseline Adjustments in Local App State

As a Photographer,
I want my baseline adjustments to be persisted locally in the app’s state model,
So that edits are durable across navigation and refresh.

**Implements:** FR3, FR5

**Acceptance Criteria:**

**Given** I edited photo A’s baseline adjustments
**When** I refresh the page and open photo A again
**Then** the baseline adjustments for photo A are restored
**And** no file paths or private file metadata are stored as part of the persisted adjustment record

## Epic 3: Presets (Fast Starting Points)

Users can apply predefined presets and create and save custom presets locally.

### Story 3.1: Apply a Built-In Preset

As a Photographer,
I want to apply a predefined preset to a photo,
So that I can start from a good baseline look quickly.

**Implements:** FR23

**Acceptance Criteria:**

**Given** a photo is open in the editor
**When** I select a built-in preset
**Then** the preset’s adjustments are applied to the photo
**And** the preview updates immediately to reflect the preset

**Given** I applied a built-in preset
**When** I reset adjustments
**Then** the photo returns to default baseline adjustments
**And** the preset effect is removed

### Story 3.2: Save Current Adjustments as a Custom Preset

As a Photographer,
I want to save my current adjustments as a preset,
So that I can reuse the same look on other photos.

**Implements:** FR24

**Acceptance Criteria:**

**Given** I have a photo with non-default baseline adjustments
**When** I choose “Save Preset” and provide a name
**Then** a new custom preset is created locally
**And** the preset includes the current supported adjustments (exposure, contrast, white balance, saturation at minimum)

**Given** I attempt to save a preset with an empty name
**When** I submit the form
**Then** the preset is not created
**And** I see a validation message prompting for a name

**Given** a custom preset is saved
**When** I refresh the app and reselect a folder and open any photo
**Then** the custom preset is still available for selection
**And** the preset storage does not include file paths or image content

### Story 3.3: Manage Custom Presets (Rename and Delete)

As a Photographer,
I want to rename or delete my custom presets,
So that I can keep my preset list organized.

**Implements:** FR24

**Acceptance Criteria:**

**Given** I have at least one custom preset
**When** I rename the preset to a new valid name
**Then** the preset name is updated everywhere it is shown
**And** the preset’s adjustment values remain unchanged

**Given** I have at least one custom preset
**When** I delete a preset and confirm the action
**Then** the preset is removed from the preset list
**And** the removal persists after refresh

## Epic 4: Branch & Compare Looks

Users can branch edits, switch and promote branches, and compare 2-up or 3-up with fast toggling and keyboard cycling.

### Story 4.1: Create a Branch for Alternative Edits

As a Photographer,
I want to create a branch from my current edit state,
So that I can explore an alternative look without losing my original.

**Implements:** FR6

**Acceptance Criteria:**

**Given** I have a photo open in the editor
**When** I choose “Create Branch”
**Then** a new branch is created for that photo
**And** the new branch starts with the same adjustments as the current branch

**Given** a branch is created
**When** I view the branch selector
**Then** I can see both the original branch and the new branch
**And** the new branch has a distinct identifier and display name

### Story 4.2: Switch Between Branches

As a Photographer,
I want to switch between branches for a photo,
So that I can compare different looks quickly.

**Implements:** FR7

**Acceptance Criteria:**

**Given** a photo has multiple branches
**When** I switch from branch A to branch B
**Then** the editor preview updates to branch B’s adjustments
**And** the perceived response is fast enough to support rapid experimentation

**Given** I switch branches repeatedly
**When** I toggle between branches
**Then** the app remains responsive
**And** the adjustments shown always match the active branch

### Story 4.3: Promote a Branch to Primary

As a Photographer,
I want to promote a branch to become the primary version,
So that my preferred look becomes the default for that photo.

**Implements:** FR8

**Acceptance Criteria:**

**Given** a photo has at least two branches
**When** I promote branch B
**Then** branch B is marked as the primary branch for that photo
**And** the UI reflects the new primary status consistently (grid and editor)

**Given** a branch is promoted
**When** I later reopen the photo
**Then** the promoted branch is selected by default
**And** other branches remain available

### Story 4.4: Enter Compare Mode with 2-up and 3-up Layouts

As a Photographer,
I want a sticky compare mode with 2-up or 3-up layouts,
So that I can evaluate multiple looks side-by-side.

**Implements:** FR4, FR9

**Acceptance Criteria:**

**Given** I am editing a photo
**When** I enter Compare mode
**Then** the UI shows at least a 2-up compare layout
**And** I can switch between 2-up and 3-up layouts without leaving Compare mode

**Given** Compare mode is active
**When** I switch layouts
**Then** the compare framing stays consistent (no unexpected zoom or pan changes)
**And** switching layouts remains responsive

### Story 4.5: Cycle Experiments and Branches via Keyboard in Compare Mode

As a Photographer,
I want to cycle branches using keyboard shortcuts while comparing,
So that I can evaluate many variations quickly.

**Implements:** FR10

**Acceptance Criteria:**

**Given** Compare mode is active and multiple branches exist
**When** I press the “next branch” shortcut
**Then** the compare view updates to show the next branch configuration
**And** the perceived response is fast enough for rapid cycling

**Given** keyboard shortcuts are used in Compare mode
**When** focus is within the editor and compare UI
**Then** the shortcuts work without triggering browser default conflicts
**And** the shortcuts do not interfere with text inputs when an input is focused

## Epic 5: Reliable Saving & Portable TIFF Metadata

Users get continuous debounced `.tiff` outputs and portable embedded metadata that can be read back to reconstruct edits.

### Story 5.1: Define and Validate the Fade XMP Payload Schema

As a Photographer,
I want my edit settings stored in a well-defined metadata schema,
So that edits can be written and read consistently over time.

**Implements:** FR13, FR39, FR41

**Acceptance Criteria:**

**Given** edits are stored in `.tiff` XMP metadata
**When** a metadata payload is written
**Then** it conforms to a versioned `fade:` schema that includes branch identifiers and baseline adjustments
**And** the payload is validated before writing, rejecting invalid payloads safely

**Given** a metadata payload is persisted
**When** the schema is extended in the future
**Then** older payloads remain readable via schema versioning or migration rules
**And** unknown fields do not break parsing

### Story 5.2: Write Debounced TIFF Outputs Without Blocking the UI

As a Photographer,
I want `.tiff` outputs written automatically in the background,
So that my edits are materialized without interrupting editing or comparing.

**Implements:** FR14, FR15

**Acceptance Criteria:**

**Given** I am editing a photo
**When** I adjust sliders repeatedly
**Then** `.tiff` writes are debounced and coalesced
**And** interactive editing and compare remain responsive during background writes

**Given** a `.tiff` write is queued
**When** it is in progress
**Then** I can see non-invasive status feedback (queued, in progress, succeeded, failed)
**And** status does not expose file paths or image contents

### Story 5.3: Atomic Write Semantics for Metadata and TIFF Outputs

As a Photographer,
I want background writes to be atomic,
So that partial writes never corrupt my outputs or metadata.

**Implements:** FR13, FR14

**Acceptance Criteria:**

**Given** a `.tiff` output or metadata update is written
**When** a write occurs
**Then** the system uses a crash-safe atomic write strategy (temp write plus replace semantics)
**And** on interruption, outputs are left in a recoverable state and partial files are not treated as complete

### Story 5.4: Recover and Resume Pending Writes After Restart

As a Photographer,
I want the app to recover from crashes and resume pending writes,
So that I don’t lose work and don’t need to manually repair state.

**Implements:** FR29

**Acceptance Criteria:**

**Given** writes were queued and the app is closed or crashes
**When** I open the app again and select the same folder
**Then** the app detects incomplete or pending operations and resumes them safely
**And** I can see recovery progress and any failures

### Story 5.5: Read Embedded TIFF Metadata to Reconstruct Adjustments

As a Photographer,
I want the app to read embedded metadata from existing `.tiff` outputs,
So that edits can be reconstructed even if app-local state is missing.

**Implements:** FR40, FR41

**Acceptance Criteria:**

**Given** a folder contains Fade-generated `.tiff` outputs
**When** the app indexes the folder
**Then** it reads embedded XMP metadata and reconstructs baseline adjustments and branch identifiers
**And** if metadata is missing, the photo is treated as baseline and unedited

**Given** embedded metadata is read
**When** reconstructed edits are used in the app
**Then** no file paths or image content are derived from or stored in the metadata payload
**And** only normalized adjustments and identifiers are used

### Story 5.6: Best-Effort Lightroom-Compatible XMP Emission (Non-Blocking)

As a Photographer,
I want Fade’s `.tiff` metadata to be as compatible as possible with Lightroom,
So that I can round-trip workflows when feasible.

**Implements:** FR39

**Acceptance Criteria:**

**Given** Fade writes XMP into TIFF
**When** emitting XMP
**Then** it uses standard XMP-in-TIFF embedding patterns and namespaces
**And** any Lightroom-specific mirroring (for example, `crs:` fields) is best-effort and does not affect Fade’s canonical parsing

## Epic 6: Batch Apply (Edit at Scale)

Users can batch-apply edits to a selection, preview deltas, and undo and redo batch operations.

### Story 6.1: Apply a Branch’s Edits to a Selection

As a Photographer,
I want to select multiple photos and apply edits from a chosen branch,
So that I can propagate a consistent look across a shoot.

**Implements:** FR16

**Acceptance Criteria:**

**Given** I have a set of photos in the grid
**When** I select multiple photos and choose “Apply from Branch”
**Then** the system applies the chosen branch’s adjustments to all selected photos
**And** progress is shown during the operation

**Given** the batch apply is running
**When** I continue navigating the app
**Then** the UI remains responsive
**And** I can see batch status updates without blocking my workflow

### Story 6.2: Preview Deltas Before Committing Batch Apply

As a Photographer,
I want to preview what will change before committing a batch apply,
So that I can avoid unintended edits.

**Implements:** FR17

**Acceptance Criteria:**

**Given** I selected photos and a source branch to apply
**When** I open the batch apply preview
**Then** I see a list of adjustment fields that will change and their new values
**And** I can cancel without applying any changes

**Given** the preview is shown
**When** I confirm the batch apply
**Then** the changes are applied deterministically to the selection
**And** the preview accurately reflects what was applied

### Story 6.3: Undo and Redo Batch Apply

As a Photographer,
I want to undo and redo a batch operation,
So that I can quickly back out of mistakes.

**Implements:** FR18

**Acceptance Criteria:**

**Given** I completed a batch apply
**When** I undo the operation
**Then** all affected photos return to their previous adjustment state
**And** undo completes without leaving partial mixed states

**Given** I undid a batch apply
**When** I redo the operation
**Then** the batch apply is re-applied consistently to the same set
**And** the resulting states match the original batch apply result

## Epic 7: Keyboard & Custom Hotkeys

Users can navigate and edit via keyboard, customize bindings, scope shortcuts by context, and reset defaults.

### Story 7.1: Default Keyboard Shortcuts for Core Navigation

As a Photographer,
I want keyboard shortcuts for core navigation,
So that I can work quickly without relying on the mouse.

**Implements:** FR19

**Acceptance Criteria:**

**Given** I am in the grid
**When** I use next and previous navigation shortcuts
**Then** selection moves predictably
**And** the UI remains responsive

**Given** I am in the editor
**When** I use shortcuts to go to next or previous photo
**Then** the editor navigates accordingly
**And** shortcuts do not trigger browser defaults where applicable

**Given** I am in compare mode
**When** I use compare-related shortcuts
**Then** compare responds correctly
**And** shortcuts do not interfere with text inputs when an input is focused

### Story 7.2: Context-Scoped Shortcut Handling

As a Photographer,
I want shortcuts to be scoped by context (grid, editor, compare),
So that keys do the right thing depending on where I am in the app.

**Implements:** FR21

**Acceptance Criteria:**

**Given** I am in the grid context
**When** I press a grid-only shortcut
**Then** it executes the grid command
**And** it does not execute editor or compare commands

**Given** I am in the editor context
**When** I press a shortcut shared across contexts
**Then** it executes the editor-appropriate behavior
**And** the command routing is consistent across app navigation

### Story 7.3: Customize and Persist Key Bindings Locally

As a Photographer,
I want to customize keyboard shortcuts,
So that I can match my preferred workflow.

**Implements:** FR20

**Acceptance Criteria:**

**Given** I open the key bindings settings UI
**When** I remap a command to a new key combination
**Then** the mapping is saved locally
**And** the new shortcut works immediately in the appropriate contexts

**Given** I assign a shortcut that conflicts with an existing binding
**When** I attempt to save
**Then** the app detects the conflict and shows a resolution flow
**And** I can choose which binding to keep

### Story 7.4: Reset Key Bindings to Defaults

As a Photographer,
I want to reset key bindings to defaults,
So that I can recover from a broken keymap quickly.

**Implements:** FR22

**Acceptance Criteria:**

**Given** I have customized key bindings
**When** I click “Reset to defaults” and confirm
**Then** all bindings return to the default set
**And** the defaults persist after refresh

## Epic 8: Privacy-Preserving, Opt-In Analytics

Users can explicitly enable or disable analytics; events buffer offline and flush when enabled; analytics never include image or file identifiers; users can view status and basic counters.

### Story 8.1: Explicit Analytics Opt-In (Default Off)

As a Photographer,
I want analytics to be disabled by default and only enabled by explicit opt-in,
So that my privacy is protected by default.

**Implements:** FR35

**Acceptance Criteria:**

**Given** I am using the app
**When** I open the analytics section in settings
**Then** analytics status is shown as disabled by default
**And** no analytics network requests are made while disabled

**Given** analytics are disabled
**When** I enable analytics explicitly
**Then** the app stores the enabled setting locally
**And** the enabled setting persists after refresh

**Given** analytics are enabled
**When** I disable analytics
**Then** the app immediately stops emitting analytics network requests
**And** the disabled setting persists after refresh

### Story 8.2: Emit Key Analytics Events (Privacy-Safe)

As an Operator,
I want the app to emit analytics events for key user actions,
So that we can measure activation and engagement without collecting private data.

**Implements:** FR34, FR37

**Acceptance Criteria:**

**Given** analytics are enabled
**When** key actions occur (folder open, photo open, edit applied, branch create, branch switch, branch promote, compare enter, compare toggle, batch apply start, batch apply complete, permission or write errors)
**Then** an event is recorded for each action using a stable taxonomy
**And** event properties include only aggregate counts, latencies, and capability flags (no image content, no file names, no file paths)

**Given** a key action occurs
**When** an event payload is created
**Then** the payload excludes any identifiers derived from user filesystem paths
**And** the payload includes only values necessary for actionable insights (for example, selectionSize, branchCount, durationMs, webgpuAvailable)

### Story 8.3: Offline Buffering and Flush When Enabled

As an Operator,
I want analytics events buffered offline and flushed when network is available,
So that analytics are reliable without impacting UX.

**Implements:** FR36

**Acceptance Criteria:**

**Given** analytics are enabled and the network is unavailable
**When** events occur
**Then** events are buffered locally for later delivery
**And** buffering does not block UI interactions

**Given** analytics are enabled and buffered events exist
**When** the network becomes available
**Then** buffered events are flushed in the background
**And** failures retry without causing UI stalls

**Given** analytics are disabled
**When** events occur
**Then** events are not buffered for later sending
**And** no background flush occurs

### Story 8.4: Analytics Status and Session Counters UI

As a Photographer,
I want to see whether analytics are enabled and basic counters for my session,
So that I understand what is being tracked.

**Implements:** FR38

**Acceptance Criteria:**

**Given** I open the analytics section in settings
**When** the page loads
**Then** I see analytics status (enabled or disabled)
**And** I see basic session counters (aggregate counts and selected latencies) for key actions

**Given** counters are displayed
**When** I review them
**Then** they do not include file names, file paths, or image content
**And** they reflect only aggregate totals and latencies since session start

## Epic 9: Deferred Features

Deferred work is grouped explicitly so it doesn’t block MVP sequencing.

### Story 9.1: “Re-open Recent Folder” (Deferred Investigation and Spec)

As a Photographer,
I want to quickly re-open a recent folder,
So that returning to work is fast.

**Implements:** FR25

**Acceptance Criteria:**

**Given** browser filesystem permissions are constrained and inconsistent across sessions
**When** we design “recent folders”
**Then** we produce a concrete technical approach that is honest about limitations (no guaranteed auto-open)
**And** the feature requires explicit user interaction and permission re-authorization where needed

### Story 9.2: Diagnostics and Recovery (Deferred)

As a Photographer,
I want to view diagnostics and recover from write failures,
So that I can resolve issues safely.

**Implements:** FR27, FR28

**Acceptance Criteria:**

**Given** this feature is deferred
**When** the MVP is shipped
**Then** write failures still surface as minimal, non-blocking error messaging
**And** a dedicated diagnostics UI and retry tooling remain out of scope for MVP

### Story 9.3: Cloud Sync of Settings and Edits (Deferred)

As a Photographer,
I want to opt in to cloud sync,
So that my settings and edits can be available across devices.

**Implements:** FR30

**Acceptance Criteria:**

**Given** MVP is local-first
**When** cloud sync is planned
**Then** the sync scope is specified (what syncs, conflict handling, privacy controls)
**And** explicit consent and credential isolation are required before any remote operations

### Story 9.4: Collaboration on Branches (Deferred)

As a Photographer,
I want to collaborate on edits using shared branches,
So that teams can work together on a look.

**Implements:** FR31

**Acceptance Criteria:**

**Given** collaboration is deferred
**When** it is implemented later
**Then** the collaboration model is specified (ownership, permissions, conflict resolution)
**And** collaboration does not weaken local-first privacy defaults

### Story 9.5: AI Edit Suggestions (Deferred)

As a Photographer,
I want optional AI-generated edit suggestions,
So that I can accelerate my workflow while keeping full control.

**Implements:** FR32, FR33

**Acceptance Criteria:**

**Given** AI is deferred
**When** it is implemented later
**Then** AI suggestions are opt in and reversible
**And** users can override and adjust suggestions fully without lock-in

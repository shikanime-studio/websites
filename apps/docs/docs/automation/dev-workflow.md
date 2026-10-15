---
sidebar_position: 3
---

# Dev workflow

Every Shikanime repo runs the same loop: jj workspaces, plain-English
commits with trailers, PRs to protected `main`, squash landing. The loop
is codified in the `sks-*` skill family (`shikanime-labs/skills`) and is
identical for humans and agents.

## Lifecycle

| # | Phase                      | Tool              | Gate                 |
| - | -------------------------- | ----------------- | -------------------- |
| 0 | Discussion (RFC) if open   | Discussion        | entry                |
| 1 | Issue: create → triage     | issue             | —                    |
| 2 | Refine to convergence      | issue refine      | ledger settled       |
| 3 | Branch + implement         | jj workspace      | workspace created    |
| 4 | Commit                     | commit envelope   | commit shape         |
| 5 | Adversarial review         | review lens       | review gate          |
| 6 | PR: open → triage          | `gh pr create`    | —                    |
| 7 | Land (`--squash`)          | `gh pr merge`     | branch protection    |
| 8 | Close issue (N of N)       | issue             | ledger discharged    |

```mermaid
flowchart LR
  I[issue ledger] --> WS["jj workspace add<br/>pinned to main@origin"]
  WS --> ED[edit in isolation]
  ED --> CM["jj describe<br/>subject + body + trailers"]
  CM --> BK["bookmark create + track"]
  BK --> PS["jj git push -b <branch>"]
  PS --> PR["gh pr create --head org:branch"]
  PR --> RV["review (ponytail lens)"]
  RV --> LG["gh pr merge --squash"]
  LG --> CL["verify + close issue"]
```

## jj is the working surface

All org repos are jj-managed. Two rules prevent most damage:

- **Never work in the cloned checkout.** Every unit opens a fresh
  workspace pinned to the remote tip:
  `jj workspace add ../<repo>.<unit> -r 'main@origin'`. Concurrent WIP
  in the checkout never folds into your change.
- **Pushed bookmarks are immutable.** To rebuild a branch: `jj new` off
  `main@origin`, `jj restore --from <old>` only the intended files,
  re-point the bookmark with `--allow-backwards`, push. Always re-diff
  against `main` — `restore` carries over whatever the old commit held.

jj does not auto-track bookmarks: `jj bookmark track <branch>
--remote=origin` before `jj git push`, or the push is rejected. A success
line proves nothing — verify the bookmark moved and the PR head OID
equals local `@`.

## Commit envelope

Plain capitalized title (no conventional-commit prefix), body with
labels (`Design:`, `Related:`, `Issue:` per the repo's `AGENTS.md`), plus
two trailers on agent-assisted commits:

```text
Co-authored-by: Automata <automata@shikanime.studio>
Signed-off-by: <contributor> <email>
```

`manifests` and `skills` enforce `Signed-off-by` via gitlint (CC1) — a
commit without it is rejected at push.

## PRs and landing

- PRs open with `--head <org>:<branch>` (the repo owner, not the login)
  and body sections `# Why` / `## What` / `## References` restating the
  commit. Bodies are written to a file and passed via `--body-file` —
  inline `--body` gets mangled by shell expansion.
- `main` is protected in both orgs: 1 approval, linear history, signed
  commits, squash-only. A verbal "lgtm" is the approval signal; after it,
  `gh pr merge --squash --admin` lands (self-approval is blocked by the
  org "Landing protections" ruleset).
- Duplicate check first: if an open PR already delivers the change, stack
  on its branch instead of opening another. Stacks land in dependency
  order, base first.
- Inside a jj workspace gh has no git remote — pass `-R <org>/<repo>`.

## Branch classes

| Signal                        | Implication                          |
| ----------------------------- | ------------------------------------ |
| `main` protected              | PR mandatory, squash landing         |
| `.jj/` present                | jj bookmark tracking before push     |
| gitlint / DCO hooks           | `Signed-off-by` mandatory            |
| `AGENTS.md` with `Related:`   | follow its conventions               |
| NixOS/infra repo              | `nix eval` / `nix build` before land |

## Formatting

`nix fmt` (treefmt) reformats the whole tree per run — scope it
(`nix fmt apps/<app>`) and restore anything outside your change before
committing. Markdown wraps at 80 columns; never skip the formatter, and
never run it over GitHub issue/PR bodies (free text, exempt).

## Verification before "done"

"Pushed / landed / merged" are claims until checked against real output:
`gh pr view <n> --json state,headRefOid` after create and merge, and
re-measure any file/line count with `jj diff --stat` — GitHub's web diff
pads context and overstates size.

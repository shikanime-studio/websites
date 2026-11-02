---
sidebar_position: 4
---

# Skills

[`shikanime-labs/skills`](https://github.com/shikanime-labs/skills) is
the org's procedural memory: a curated catalog of self-improved agent
skills for Hermes and for compatible agents such as Claude Code, Codex,
and Cursor. The catalog encodes one **issue-first lifecycle**:
discussion → issue → comments → PR.

## Shape

- **47 skills** under `skills/`. The `sks-*` family covers `sks-dev`,
  `sks-pr`, `sks-issue`, `sks-land`, `sks-nix-authoring`,
  `sks-sops-secrets-authoring`, and more. The catalog also carries
  `cpn-release-patch` and `nixpkgs-pr-review`
- **8 profiles** under `profiles/`: coder, commander, debugger,
  designer, neuromancer, releaser, researcher, reviewer
- Bodies are **org-neutral**; per-org facts load on demand from
  `references/shikanime.md` / `references/cloud-pi-native.md` — the
  same skill works in any org
- Doctrine carried by every skill: issue-first, acceptance criteria as
  command-decidable tasklists named "gate ledgers", done-is-proven

## Distribution

The same catalog reaches every runtime four ways:

```mermaid
flowchart LR
  CAT["skills repo<br/>47 skills + 8 profiles"] --> NIX["Nix modules<br/>external_dirs"]
  CAT --> TAP["hermes skills tap add"]
  CAT --> NPM["npm @shikanime-labs/skills"]
  CAT --> REG["skills.sh registry<br/>npx skills add"]
  NIX --> H1["~/.hermes/skills on<br/>NixOS/Home-Manager hosts"]
  TAP --> H2["any Hermes install"]
  NPM --> H3["agents field + skills.json"]
  REG --> H4["third-party agents"]
```

On fleet hosts, `machines`/`skills` Nix modules set
`services.hermes-agent.settings.skills.external_dirs`, mounting the
catalog into `~/.hermes/skills` — which is how the agents documented in
[Automata](./hermes) know the dev loop at all.

## Scripts

Skills that need executable helpers keep them in `scripts/` beside the
`SKILL.md`, written in Python with `argparse`. The shebang is
`#!/usr/bin/env nix-shell` with a `#!nix-shell -i python3 -p …` line
declaring **every runtime dependency** of that script — not just
`python3` but the external tools it drives (`gh`, `jujutsu`, `git`) — so
each script is a self-contained, dependency-isolated unit on any Nix
host. `nix-shell` rather than the new CLI is deliberate: `nix shell`
has no interpreter (`-i`) mode, and on macOS the `env -S` shebang route
chokes on the `#` in `nixpkgs#python3` (BSD env reads it as a comment).
Examples: `sks-curate`'s contrastive
`scripts/probe.py` (grades a reworked skill body against the unchanged
assertion set and fails on any regression) and `sks-gc`'s
`scripts/discover.py` (dry-run GC candidates in a jj repo). The
exception is single `gh api` + `jq` pipelines, which stay shell — Python
would add nothing. Scripts are stdlib-only at the Python level; Python
dependencies beyond the stdlib belong in the repo's Nix tooling instead.

## CI

The repo runs the org workflow grammar: `commands`, `integration`,
`nix`, `release`. The `nix.yaml` workflow runs
Checks + Packages matrix jobs pushing to the `shikanime-studio` Cachix
cache. Commits are gitlint-enforced for `Signed-off-by` under rule CC1.
Local mirror
discipline: `~/.hermes/skills` is a detached clone — resync is fetch +
ff-only `main`, stashing local lessons.

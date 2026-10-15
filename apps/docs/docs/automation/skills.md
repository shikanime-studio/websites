---
sidebar_position: 4
---

# Skills catalog

[`shikanime-labs/skills`](https://github.com/shikanime-labs/skills) is
the org's procedural memory: a curated catalog of self-improved agent
skills for Hermes (and compatible agents — Claude Code, Codex, Cursor)
encoding one **issue-first lifecycle**: discussion → issue → comments →
PR.

## Shape

- **41 skills** under `skills/` — the `sks-*` family
  (`sks-dev`, `sks-pr`, `sks-issue`, `sks-land`, `sks-nix-authoring`,
  `sks-sops-secrets-authoring`, ...) plus `cpn-release-patch` and
  `nixpkgs-pr-review`
- **8 profiles** under `profiles/`: coder, commander, debugger,
  designer, neuromancer, releaser, researcher, reviewer
- Bodies are **org-neutral**; per-org facts load on demand from
  `references/shikanime.md` / `references/cloud-pi-native.md` — the
  same skill works in any org
- Doctrine carried by every skill: issue-first, acceptance criteria as
  command-decidable tasklists ("gate ledgers"), done-is-proven

## Distribution

The same catalog reaches every runtime four ways:

```mermaid
flowchart LR
  CAT["skills repo<br/>41 skills + 8 profiles"] --> NIX["Nix modules<br/>external_dirs"]
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
[Hermes agent fleet](./hermes) know the dev loop at all.

## CI

The repo runs the org workflow grammar (`cleanup`, `commands`,
`integration`, `nix`, `release`, `triage`); `nix.yaml` runs Checks +
Packages matrix jobs pushing to the `shikanime-studio` Cachix cache.
Commits are gitlint-enforced (`Signed-off-by`, CC1). Local mirror
discipline: `~/.hermes/skills` is a detached clone — resync is fetch +
ff-only `main`, stashing local lessons.

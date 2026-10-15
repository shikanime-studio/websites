---
sidebar_position: 5
---

# Repository catalog

Every repository in both orgs, grouped by layer. Local checkouts live at
`~/Source/Repos/github.com/<org>/<repo>`.

## Infrastructure (shikanime-labs)

| Repo         | Purpose                                                        |
| ------------ | -------------------------------------------------------------- |
| `machines`   | Source of truth for all 11 hosts: NixOS, nix-darwin, Home Manager, sops secrets; deploys via comin |
| `manifests`  | All cluster state: Kustomize trees for 31 apps + 18 operators, reconciled by Flux onto nishir/telsha |
| `tailnet`    | GitOps for the tailnet ACL (`policy.hujson`, HuJSON) — tests on PR, apply on merge, no stored keys |
| `knix`       | Opinionated NixOS module set that bootstraps the RKE2 cluster (`services.knix.*`: rke2, canal, coredns, flux, longhorn, multus) |
| `wharf`      | Go CLI building OCI images from Nix flakes; multi-platform + registry push; the Skaffold custom builder |
| `niximgs`    | Bitnami-style image registry from nixpkgs → `ghcr.io/shikanime/<app>` (jellyfin, postgresql, radarr, sonarr, syncthing, vaultwarden, whisparr, mlflow) |
| `dashboards` | Grafana dashboard JSON pulled by grafana-operator at pinned tags (blackbox, blocky, halogen-flash, llama-cpp) |
| `identities` | Persona data (name, email, signing keys) in sops; emits git includes + jj conf.d fragments for 3 personas (shikanime, gouv, automata) |

## Products (shikanime-studio)

| Repo       | Purpose                                                          |
| ---------- | ---------------------------------------------------------------- |
| `websites` | The pnpm monorepo: www, links, reiya, fade, docs (+ accounts in flight) on Cloudflare Workers — see [Web properties](../products/web-properties) |
| `hakurei`  | The Touhou MMO: deterministic Rust core, authoritative gRPC server, Bevy thin client — see [Hakurei](../products/hakurei) |
| `tailscale-gateway` | Kubernetes controller wiring Gateway API → Tailscale Serve |

## Automation & tooling (shikanime-labs)

| Repo                | Purpose                                                       |
| ------------------- | ------------------------------------------------------------- |
| `skills`            | The agent skill catalog — see [Skills catalog](../automation/skills) |
| `actions`           | Reusable actions + org workflows: `.land`/`.rebase`/`.close`/`.backport` comment commands, nix/pnpm/skaffold/flux integration actions |
| `automata`          | Go CLI for repo/cluster hygiene: kustomize image tags, workflow bumps, `update.sh`, flake/k0sctl updates |
| `automata-action`   | Action that updates a flake and lands via Sapling/ghstack (archived) |
| `devlib`            | Nix flake-module library: devenv profiles (nix, rust, python, ...), home modules, workflow/config generators (ghstack, sops, renovate, ...) |
| `minishells`        | Per-org dev shells (cloud-pi-native family) over devlib |
| `sapling-navigator` | Browser extension: stack-aware PR navbar for ghstack/Sapling PRs |
| `xqbit`             | qBittorrent hygiene (`qbittorrent-cleanup`: reaps missing/errored torrents) |
| `features`          | Dev Container features (direnv, home-manager, tailscale, ...) — archived |
| `setup-nix-action` / `direnv-action` | Standard Nix/direnv setup actions — archived |

## Process & personal

| Repo       | Purpose                                                        |
| ---------- | -------------------------------------------------------------- |
| `enhancements` | Cross-org KEP-style SEP process (`seps/<org>/NNNN-*/sep.yaml`); freshly scaffolded |
| `platform-api` | Announced CRD-oriented DevSecOps platform trunk (Cluster API provider model, Gateway API policy extension) — README-only intent so far |
| `apeiron`  | AI Discord bot for Baguetto (Mistral) — archived                |
| `colemak`  | Colemak layout Nix modules; NEUI-cluster navigation keymaps for helix/zed/neovim |
| `dotfiles` | chezmoi + Nix personal config, including Hermes agent config    |
| `algorithm` | Algorithm challenges in C++/Elixir/JS/OCaml/Python              |
| `gitignore` | .gitignore templates (Astro, Devenv, MLflow, Wrangler, LaTeX)  |
| `langchain-vertexai-extended` | LangChain VertexAI extension — archived       |
| `.github` (×2) | Org profiles and community health files for both orgs        |

## The dependency spine

```mermaid
flowchart BT
  DEVLIB[devlib] --> WS[websites] & MACHINES[machines]
  ID[identities] --> MACHINES
  KNIX[knix] --> MACHINES
  WHARF[wharf] --> NIXIMG[niximgs]
  NIXIMG -- "ghcr.io images" --> MAN[manifests]
  MACHINES -- "RKE2 hosts" --> MAN
  MAN -- "GrafanaDashboard CRs" --> DASH[dashboards]
  DASH -- "dashboards by tag" --> MAN
  TAIL[tailnet ACL] -. gates .-> MAN
  SKILLS[skills] -- "external_dirs" --> MACHINES
  ACTIONS[actions] -. CI grammar .-> WS & MACHINES & MAN
```

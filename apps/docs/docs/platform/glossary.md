---
sidebar_position: 6
---

# Glossary

The platform's vocabulary, defined once. Terms are expanded at first
use elsewhere. This page is the reference.

## Infrastructure

| Term | Meaning |
| ---- | ------- |
| **tailnet** | The private Tailscale mesh network (`*.taila659a.ts.net`) joining every host; the only admin plane into the fleet |
| **A2A** | Agent-to-agent protocol — how Hermes agents talk to each other over the `:9900` API and `:8642` A2A on the tailnet |
| **RKE2** | Rancher's hardened Kubernetes distribution; what the nishir cluster nodes run, installed by the `knix` Nix module |
| **knix** | Shikanime Studio's NixOS module set that turns a Nix host into an RKE2 node (`services.knix.*`) |
| **comin** | Declarative NixOS deployment: each host polls its Git branch and re-activates when it moves |
| **Flux** | Pull-based, self-healing GitOps operator reconciling the `manifests` repo onto the cluster |
| **sops / sops-nix** | Encrypted-secrets tooling: secrets live age-encrypted in Git (`*.enc.yaml`), decrypted to env at activation time |
| **Hermes Agent** | The Nous Research AI agent runtime, running as a service on every host; agents operate the platform through the same Git/PR gates as humans |
| **KubeVirt** | Kubernetes virtualization; runs the `automata` VM, the A2A hub, as a pod-backed VM |
| **Longhorn** | Replicated block storage for the cluster; cannot shrink a bound PVC |
| **Envoy Gateway / Gateway API** | Typed Kubernetes CRs for ingress; one `Gateway` per exposed app, each holding its own tailnet IP |
| **Envoy AI Gateway** | Envoy Gateway extension for LLM routing: model-based routing, token auth, provider fallback |

## Compute

| Term | Meaning |
| ---- | ------- |
| **Strix Halo** | AMD APU in the two inference minis kushira and sashina — Radeon 8060S iGPU with 128 GiB **unified** memory |
| **GTT** | Graphics Translation Table — the AMD mechanism letting the iGPU address host RAM; on Halo it IS the memory budget, with no VRAM split |
| **w4b** | halogen-flash's weight format, a 4-bit weights checkpoint; the qwen3.8-flash file pins ~68 GiB |
| **MTP** | Multi-token prediction — generates several tokens per step; ships as a sidecar in the halogen checkpoint |
| **TTFT** | Time-to-first-token; the latency users feel. halogen's 13× TTFT win is why it replaced the RPC pair |
| **prefill** | Processing the prompt before generation begins; the bandwidth-bound phase on unified-memory APUs |
| **KV cache** | Per-conversation attention state; shares the GTT pool with weights, so context length trades against model size |
| **RPC pair** | Retired: two llama.cpp processes bridged over RPC to pool both Halo nodes for one model. Removed Oct 2026 |

## Process

| Term | Meaning |
| ---- | ------- |
| **jj** | Jujutsu, the version-control front end used in all repos; workspaces and bookmarks instead of branches/stash |
| **SEP** | Shikanime Studio Enhancement Proposal — KEP-style cross-org design doc in `shikanime-labs/enhancements` |
| **ghstack** | Stacked-PR tooling; `sks-*` skill family encodes the org's issue→PR lifecycle for humans and agents |
| **gitlint CC1** | Commit-lint rule requiring `Signed-off-by`, enforced on `manifests` and `skills` |
| **wharf / niximgs** | OCI image supply chain: wharf builds images from Nix flakes; niximgs is the app-image catalog (`ghcr.io/shikanime`) |
| **automata** | Overloaded: the KubeVirt VM that is the A2A hub, the Go CLI for repo/cluster hygiene, and the agent signing persona. Context disambiguates |

## Products

| Term | Meaning |
| ---- | ------- |
| **Touhou / Gensokyo** | The fan-work universe hakurei is set in, © ZUN / Team Shanghai Alice. "Dofus-like" refers to its tactical, AP/MP-budgeted combat |
| **better-auth** | Auth library powering the accounts IdP and reiya in the web identity mesh |
| **D1** | Cloudflare's SQLite database service; reiya's and accounts' datastore |

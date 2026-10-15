---
sidebar_position: 3
---

# Fleet

[`shikanime-labs/machines`](https://github.com/shikanime-labs/machines) is
the source of truth for every host. Layout:

- `hosts/<name>/configuration.nix` — per-host NixOS definition
- `hosts/telsha/darwin-configuration.nix` — the nix-darwin host
- `hosts/<name>/users/<user>/home-configuration.nix` — per-host Home Manager
- `hosts/<name>/facter.json` — hardware facts from `nixos-facter`
- `modules/nixos/` — shared Linux profiles: `base`, `workstation`,
  `follower`, `distributed`, `nishir`, `ai`
- `modules/darwin/`, `modules/home/`, `modules/flake/` — darwin, Home
  Manager, and flake-parts glue
- `secrets/*.enc.yaml` — sops-nix encrypted secrets, decrypted at
  activation time; some hosts materialize fragments via `sops.templates`

Key profiles: `ai.nix` runs the `hermes-agent` service fleet-wide and wires
computer-use automation. The `cua-driver` binary for AT-SPI/D-Bus is
installed via `flake/nixos.nix` so hermes' `computer-use` extra can drive
the desktop. `nishir.nix` is the cluster node profile every RKE2 node
imports, and `distributed.nix` holds remote builders and build offload
settings.

Flake outputs: `nixosConfigurations.{ashira,manash,nalsha,fushi,minish,nemishi,sashina,kushira,nixtar}`,
`darwinConfigurations.telsha`, and `packages.<system>.*`. The packages
include the `automata` containerdisk.

## Container images

Two sibling repos build the fleet's OCI images from Nix: `wharf` builds
OCI images from Nix flakes, and `niximgs` is a Bitnami-style registry
of Nix-built images.

`knix` provides the opinionated RKE2 deployment module used to stand the
cluster up on the Nix hosts.

---
sidebar_position: 1
---

# Catalog

The `apps/` tree in manifests deploys the self-hosted service catalog on
the `nishir` cluster:

## Identity & security

| App          | Purpose                                            |
| ------------ | -------------------------------------------------- |
| `authelia`   | SSO / OIDC provider for the fleet                  |
| `lldap`      | Lightweight LDAP with GraphQL admin on port 17170   |
| `vaultwarden`| Bitwarden-compatible server                        |

## Collaboration

| App              | Purpose                                        |
| ---------------- | ---------------------------------------------- |
| `forgejo`        | Git forge running the codeberg rootless image     |
| `gitea-mirror`   | Repository mirroring                           |
| `synapse`        | Matrix homeserver (`matrix.taila659a.ts.net`)  |
| `mautrix`        | Matrix bridges                                 |
| `copyparty`      | File sharing server                            |
| `syncthing`      | File sync                                      |

## Media

| App                | Purpose                                       |
| ------------------ | --------------------------------------------- |
| `jellyfin`         | Media server                                  |
| `qbittorrent`      | Torrent client (`xqbit` tooling, `qbittorrent-cleanup`) |
| *arr stack         | `prowlarr`, `bazarr`, `seerr`, `servarr`, `metatube`, `maintainerr` |
| `immich`           | Photos (`immich-ml`, `immich-postgres`, `immich-valkey`) |

## AI & data

| App               | Purpose                                          |
| ----------------- | ------------------------------------------------ |
| `inference`       | mTLS inference gateway (Envoy AI Gateway)        |
| `llama-cpp`       | llama.cpp embedding server (Qwen3-Embedding-8B)  |
| `halogen-flash`   | Strix Halo LLM engine running qwen3.8-flash w4b — see [AI infrastructure](./ai-infrastructure) |
| `honcho`          | Agent memory (`honcho-postgres`, `honcho-deriver`) |
| `automata`        | Agent VM plane — see [Automation](../automation/hermes) |

## Observability & ops

| App                     | Purpose                                    |
| ----------------------- | ------------------------------------------ |
| `blackbox`              | Blackbox SLO probes                        |
| `grafana-image-renderer`| Grafana rendering backend                  |
| `blocky`                | DNS                                        |

Dashboards are pinned by tag from `shikanime-labs/dashboards`. Alerting
flows VictoriaMetrics → vmalert → VMAlertmanager receivers under
GitOps.

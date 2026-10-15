---
sidebar_position: 1
---

# Cluster services

The `apps/` tree in manifests deploys the self-hosted service catalog on
the `nishir` cluster:

## Identity & security

| App          | Purpose                                            |
| ------------ | -------------------------------------------------- |
| `authelia`   | SSO / OIDC provider for the fleet                  |
| `lldap`      | Lightweight LDAP (GraphQL admin on port 17170)     |
| `vaultwarden`| Bitwarden-compatible server                        |

## Collaboration

| App              | Purpose                                        |
| ---------------- | ---------------------------------------------- |
| `forgejo`        | Git forge (shares one image digest with `gitea-mirror`) |
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
| `llama-cpp`       | llama.cpp serving (LWS router mode on Halo nodes) |
| `honcho`          | Agent memory (`honcho-postgres`, `honcho-deriver`) |
| `automata`        | Agent VM plane — see [Automation](../automation/hermes) |

## Observability & ops

| App                     | Purpose                                    |
| ----------------------- | ------------------------------------------ |
| `blackbox`              | Blackbox SLO probes                        |
| `grafana-image-renderer`| Grafana rendering backend                  |
| `halogen-flash`         | Fleet flash/dashboard tooling              |
| `blocky`                | DNS                                        |

Dashboards are pinned by tag from `shikanime-labs/dashboards`; alerting
flows VictoriaMetrics → vmalert → VMAlertmanager receivers (GitOps).

---
sidebar_position: 3
---

# Quick links

The fleet's operational surface, one table. Every URL is tailnet-only:
reach it from a tailnet device, authenticate with the fleet SSO where
the app asks.

| Component    | URL                                | What it is                     |
| ------------ | ---------------------------------- | ------------------------------ |
| Forgejo      | [https://forgejo.i.shikanime.studio](https://forgejo.i.shikanime.studio) | Git forge                      |
| Grafana      | [https://grafana.i.shikanime.studio](https://grafana.i.shikanime.studio) | Dashboards                     |
| Logs         | [https://logs.i.shikanime.studio](https://logs.i.shikanime.studio)    | VictoriaLogs query             |
| Metrics      | [https://metrics.i.shikanime.studio](https://metrics.i.shikanime.studio) | VictoriaMetrics                |
| Flux         | [https://flux.i.shikanime.studio](https://flux.i.shikanime.studio)    | GitOps reconcile state         |
| Honcho       | [https://honcho.i.shikanime.studio](https://honcho.i.shikanime.studio)  | Agent memory server            |
| Inference    | [https://inference.i.shikanime.studio](https://inference.i.shikanime.studio) | LLM gateway, mTLS and API key |
| Automata     | [https://automata.i.shikanime.studio](https://automata.i.shikanime.studio) | Agent hub VM                  |
| Vaultwarden  | [https://vaultwarden.i.shikanime.studio](https://vaultwarden.i.shikanime.studio) | Interactive secrets        |
| Authelia     | [https://authelia.i.shikanime.studio](https://authelia.i.shikanime.studio) | Fleet SSO                     |
| LLDAP        | [https://lldap.i.shikanime.studio](https://lldap.i.shikanime.studio)   | Directory admin                |
| Blocky       | [https://dns.i.shikanime.studio](https://dns.i.shikanime.studio)     | DNS sinkhole                   |
| Longhorn     | [https://longhorn.i.shikanime.studio](https://longhorn.i.shikanime.studio) | Storage                       |

Media and collaboration apps follow the same pattern — jellyfin,
immich, synapse, copyparty, the *arr stack all live under
`*.i.shikanime.studio`. Pages that go deeper: [Catalog](../services/catalog)
for the full service list, [Observability](../services/observability)
for the metrics pipeline, [Gateways](../networking/gateway-dns) for
how these names resolve.

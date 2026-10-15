---
sidebar_position: 7
---

# Dataflow

How bytes actually move: commits to running systems, requests to
services, metrics to dashboards, prompts to tokens.

## Git → runtime: reconciliation

```mermaid
flowchart LR
  subgraph commit["commit lands on main"]
    M[machines]
    MF[manifests]
    W[websites]
  end
  M -->|"comin poll (minutes)"| H["host activation<br/>nixos-rebuild switch"]
  MF -->|"Flux poll (minutes)"| K["kustomize build<br/>helm install/upgrade"]
  W -->|"push event (seconds)"| C["Workers build<br/>wrangler deploy"]
```

Each path is pull-based except the edge: hosts and the cluster poll
Git, so a partitioned node converges the moment it reconnects. The
edge is push-triggered but immutable per deployment.

## User request paths

**Public web for anonymous users:**

```mermaid
flowchart LR
  B[browser] -->|HTTPS| CF[Cloudflare zone<br/>shikanime.studio]
  CF --> WRK["Worker<br/>www/links/reiya/fade/docs"]
  WRK --> A["Workers static assets<br/>(ASSETS binding)"]
  REIYA[reiya] --> D1[(D1 reiya)]
  FADE[fade] -->|WebGPU local| GPU[client GPU]
```

- The static-heavy apps www, links, and docs serve from the ASSETS
  binding. The Worker is a thin shell.
- fade does its heavy lifting **client-side**: files never leave the
  machine. EXIF and RAF parsing, demosaic, and rendering run in WebGPU
  shaders and in Web Workers from the darkroom package.
- reiya is the only main-branch app with a database, D1 `reiya`,
  reached through drizzle-orm.

**Tailnet service for the operator:**

```mermaid
flowchart LR
  O[operator on tailnet] -->|100.x| GW[per-app Gateway<br/>TLS cert-manager]
  GW --> HR[HTTPRoute] --> S[service pods]
  S --> P[(Longhorn PVC)]
```

**Agent mesh over A2A:**

```mermaid
flowchart LR
  A1[agent manash] -->|":9900 plain http<br/>tailnet-only"| HUB
  A2[agent telsha] -->|":8642 plain http<br/>hub trust"| HUB["automata VM hub<br/>a2a.automata.i"]
  HUB -->|relay| A2
  A1 -.->|"direct machine→ws DENIED by ACL"| A2
```

## Media pipeline: servarr

```mermaid
flowchart LR
  IDX["prowlarr<br/>indexer queries"]
  REQ["seerr / sonarr·radarr·whisparr<br/>request → search → grab"]
  IDX --> REQ
  REQ --> QBT["qbittorrent<br/>downloads to /mnt/patchouli"]
  QBT -->|"import + rename"| ARR["*arr library<br/>Longhorn PVC"]
  XQ[xqbit cleanup<br/>reaps missing/errored] -.-> QBT
  BAQ[bazarr subtitles] -.-> ARR
  MT[metatube metadata] -.-> ARR
  MNT[maintainerr] -.-> ARR
  ARR --> JF[jellyfin]
  JF -->|HLS transcode| USER[clients]
  IM["immich (+ml, postgres, valkey)<br/>photos"] --> USER
```

- Indexing: prowlarr feeds the *arr apps tracker results.
- Acquisition: qbittorrent downloads. The xqbit job,
  `qbittorrent-cleanup`, reaps `missingFiles` and resumes recoverable
  errored torrents.
- Organization: the *arr apps import, rename, and manage the library;
  bazarr/metatube/maintainerr attach subtitles, metadata, and cleanup.
- Consumption: jellyfin streams, with transcoding on the x86 nodes.
  immich serves photos with ML tagging from its own model pod.

## Inference path: prompt → tokens

```mermaid
flowchart LR
  C[client/agent] -->|"mTLS required<br/>bare probe = 000"| EGW["Envoy AI Gateway<br/>AIGatewayRoute"]
  EGW -->|"x-ai-eg-model"| HF["halogen-flash-0/1<br/>one per Halo node"]
  EGW -->|"fallback tier"| REM["nous · openrouter"]
  EGW -->|embeddings| LC["llama-cpp-0<br/>Qwen3-Embedding-8B"]
```

Model selection is the x-ai-eg-model header; each route is a backend
chain with remote-provider fallback tiers. The binding constraint is the
Halo unified GTT pool shared between weights and KV cache — full story
in [AI infrastructure](../services/ai-infrastructure).

## Observability path: signal → dashboard

```mermaid
flowchart LR
  P[pods/nodes] -->|"vmagent scrape"| VM[(VictoriaMetrics)]
  P -->|"vlagent → vlinsert"| VL[(VictoriaLogs)]
  VM --> VMA[vmalert] --> AMA[VMAlertmanager<br/>receivers]
  VM & VL --> G[Grafana]
  D["dashboards repo<br/>tag-pinned CRs"] --> G
  BB[blackbox probes] --> VM
```

## Secret flow: sops

```mermaid
flowchart LR
  S["secrets/*.enc.yaml<br/>age-encrypted"] -->|comin| HN[sops.templates]
  S -->|"Flux reconcile"| K8S["k8s secret<br/>(sops-decrypted)"]
  HN --> SVC["services.env"]
  K8S --> POD[pod env]
```

Secrets are never stored plaintext anywhere except the target's memory
at activation time; rotation = re-encrypt + commit + reconcile.

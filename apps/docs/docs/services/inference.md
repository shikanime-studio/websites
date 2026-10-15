---
sidebar_position: 3
---

# Inference platform

Local LLM inference runs on the two **Strix Halo** nodes (`kushira`,
`sashina` — Minisforum MS-S1 Max, AMD Radeon 8060S iGPU, gfx1151).

## Serving path

```mermaid
flowchart TB
  C[Clients / agents] --> GW
  subgraph gw["apps/inference — Envoy AI Gateway"]
    GW[AIGatewayRoute] --> BSP[BackendSecurityPolicy<br/>mTLS]
    BSP --> BE[Backend] --> AIB[AIServiceBackend]
    F[HTTPRouteFilter<br/>preset routing]
  end
  BE --> L
  subgraph lws["apps/llama-cpp — LeaderWorkerSet router mode"]
    L[rpc-head / router] --> W1[worker kushira]
    L --> W2[worker sashina]
  end
  W1 --> G1[8060S iGPU<br/>128 GiB GTT cap]
  W2 --> G2[8060S iGPU<br/>128 GiB GTT cap]
```

- **`apps/inference`** — Envoy AI Gateway fronting the inference plane with
  mTLS; a bare probe returns `000` **by design** (mTLS is required). CRs:
  `AIGatewayRoute`, `AIServiceBackend`, `Backend`,
  `BackendSecurityPolicy`, `HTTPRoute`, `HTTPRouteFilter`.
- **`apps/llama-cpp`** — llama.cpp in LeaderWorkerSet (LWS) router mode;
  capacity is bounded by the Halo nodes' memory (the 128 GiB GTT cap
  bounds model/KV headroom).
- Model selection and preset wiring live in a ConfigMap consumed by the
  gateway (`Backend` / `AIServiceBackend` CRs).

## Capacity model

```mermaid
flowchart LR
  T[128 GiB GTT] --> M[model weights]
  T --> KV[KV cache]
  T --> O[overhead]
  M --> B1[bounded context × concurrency]
  KV --> B1
```

The binding constraint is unified GTT memory shared between weights and
KV cache: bigger context or more concurrent sessions trades directly
against model size. Measure VRAM/KV headroom before routing new presets.

## Ops notes

- OOMKilled `rpc-head`/`strict-local` pods on llama.cpp: recover per the
  runbook (drop caches, restart, verify KV headroom before re-routing).
- HF-cache download wedges in router mode: clear the cache and re-pull.
- Strix Halo nodes also serve as `build-x86` remote builders when idle.

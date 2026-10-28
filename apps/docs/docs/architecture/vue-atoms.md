---
sidebar_position: 9
---

# ADR: Effect atoms implemented in Vue

Decision recorded on 2026-10-28. Status: accepted.

## Context

The hikari, reiya, and fade apps are migrating to an Effect-based
architecture where reactivity is expressed as Effect atoms — an `Atom`
value combined with `useAtomValue`, `useAtomRefresh`, and `AsyncResult`.
The Effect reactivity package is renderer-agnostic: it knows nothing about
React, so its hooks (`useAtomValue`, `useAtomRefresh`) need a renderer
binding, and the apps currently carry that binding through the React
tree (providers and context) of TanStack Router and TanStack Start.

Three forces constrain the choice of that binding layer:

- The Effect `Atom` primitive itself stays pure TypeScript. Whatever
  renderer hosts it must add re-render scheduling on top, not redefine
  what an atom is.
- The apps already standardize on TanStack Start, whose React adapter is
  the only first-class one; other view layers get only community
  bindings of unproven SSR quality.
- Astryx design primitives arrive already as Vue single-file components.
  The current React apps consume them through a shim that re-implements
  component internals in React, and every Astryx release widens that
  translation surface.

## Decision

Implement the renderer binding for Effect atoms in Vue 3: a `VueAtomRoot`
provider that tracks atom dependencies for reactivity and remounts
subtrees on `Atom` invalidation, with a composable set
(`useAtomValue`, `useAtomRefresh`) mirroring the existing hook
signatures.

The Effect atom layer remains the single reactivity model — Vue is
adopted only as its renderer: it renders components, it does not own
state. App state continues to live in Effect `Atom`s; Vue's own
reactive primitives stay internal to the binding.

## Consequences

- The Astryx shim disappears: Vue single-file components are consumed
  directly, removing a per-release translation surface.
- The React adapter of TanStack Start is replaced by a community Vue
  binding (e.g. Vindez) for SSR and file-based routing. This is the
  largest risk: SSR behavior is verified per release rather than
  guaranteed upstream, and route-level state hydration needs explicit
  verification that server and client render the same atom snapshot.
- Existing React components are rewritten to Vue single-file
  components during the migration, not wrapped — a wrapper would keep
  two runtimes and both providers mounted.
- `useAtomValue`/`useAtomRefresh` signatures are preserved, so
  call-site churn concentrates in imports and template syntax rather
  than state-access patterns.
- React leaves the dependency tree entirely (`react`, `react-dom`,
  `@vitejs/plugin-react`, `@types/react`, TanStack React packages);
  bundle size drops by the React runtime weight.

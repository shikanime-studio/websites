# Contributing to websites

Shikanime Studio web properties as a pnpm monorepo, deployed to Cloudflare Workers

## Workflow

Fork, branch off `main`, open a PR against `main`. One logical change per PR.

## Environment

```sh
nix develop
```

## Validation

`pnpm build && pnpm test` green in the affected workspace.

Security issues: see [SECURITY.md](SECURITY.md).

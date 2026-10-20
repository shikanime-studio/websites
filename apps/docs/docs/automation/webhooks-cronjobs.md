---
sidebar_position: 6
---

# Webhooks and cronjobs

The automata agent reacts to GitHub events and runs the fleet's
recurring audits. Both surfaces are declared in
`shikanime-labs/machines` under `hosts/automata/configuration.nix` —
the host filesystem is ephemeral, so nothing is registered at runtime.

## Webhook routes

The webhook platform listens on port `8644`, guarded by the
`hermes-agent-webhook-secret` sops secret, with a rate limit of 120
requests per minute. Every route delivers to the Hermes log only.

- `github-issue` — events `issues` and `issue_comment`; fires when the
  payload is not a pull request and the sender is `shikanime` or
  `yorha-operator`. Runs the `sks-triage` skill.
- `github-pr` — event `pull_request`; fires on actions `opened`,
  `reopened`, and `synchronize` from senders `shikanime` or
  `yorha-operator`. Runs the `sks-pr-review` skill.

Each route carries a short triage or review prompt and runs with the
`terminal`, `file`, `web`, and `skills` toolsets.

## Scheduled jobs

Jobs are declared in `hermesHomeFiles."cron/jobs.json"` and all deliver
locally to the Hermes log.

- `daily-grafana-alert-triage` (`0 8 * * *`; `sks-issue`,
  `sks-fastlane`) — firing alerts on the nishir fleet.
- `daily-flux-triage` (`15 8 * * *`; `sks-issue`, `sks-fastlane`) —
  Flux Kustomizations and HelmReleases with `Ready=False`.
- `daily-github-actions-failure-sweep` (`30 8 * * *`; `sks-issue`,
  `sks-fastlane`) — CI failures across both orgs in the last 24 hours.
- `daily-documentation-verify` (`45 8 * * *`; `sks-issue`,
  `sks-fastlane`) — docs.shikanime.studio claims against manifests and
  live cluster state.
- `weekly-a2a-cluster-efficiency` (`0 9 * * 1`) — efficiency proposals
  gathered from A2A peers; top 3 filed as issues.
- `daily-security-audit` (`15 9 * * *`; `sks-issue`, `sks-fastlane`) —
  code-scanning, secret-scanning, and dependabot alerts.
- `daily-github-triage` (`30 9 * * *`; `sks-triage`) — labels,
  assignment, and first replies on open issues and PRs.
- `daily-github-cleanup` (`45 9 * * *`) — deletion of fully-merged
  branches idle for 7 days or more.
- `daily-github-notification-sweep` (`0 10 * * *`; `sks-triage`) —
  unread GitHub notifications, answered as `yorha-operator`.

The issue-filing jobs share one contract:

- Deduplicate against open issues in the target repo; tracked findings
  are listed, never re-filed.
- Findings land as issues in `shikanime-labs/manifests`,
  `shikanime-studio/websites`, or the affected repo, assigned
  `yorha-operator` when eligible.
- Small fixes may take the fastlane path: at most 5 files and 100
  changed lines, nothing matching
  `lock|secret|.enc.|auth|iam|cert|token`, no schema or API change,
  checks green on the exact head, merged with
  `gh pr merge --squash --admin --match-head-commit` and a receipt
  comment, at most 3 fastlanes per run. Pending or red checks leave the
  PR open for the next run.
- Nothing closes automatically; resolved items are noted only.

## Deployment

Routes and jobs reach the fleet only through a containerdisk rebuild of
the automata image; editing the live agent changes nothing. The
`hermes-agent-events-env` sops template injects the webhook port and
secret into the service environment, and a rebuild restarts
`hermes-agent.service` with the new declarations.

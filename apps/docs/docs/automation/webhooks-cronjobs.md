---
sidebar_position: 6
---

# Webhooks and cronjobs

The automata agent reacts to GitHub events and runs the fleet's
recurring audits. Both surfaces are declared in
`shikanime-labs/machines` under
`modules/nixos/profiles/automata.nix` — the host filesystem is
ephemeral, so nothing is registered at runtime.

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

Jobs live in VCS: `hermesHomeFiles."cron/jobs.json"` in the automata
profile, all delivering locally to the Hermes log. Schedules sit in a
00:00–02:45 UTC night window, staggered in 15-minute steps, so triage
writes land while the European working day is asleep.

| Job | Schedule | Scope |
|---|---|---|
| `daily-grafana-alert-triage` | `0 0 * * *` | Firing alerts on the nishir fleet. |
| `daily-flux-failure-triage` | `15 0 * * *` | Flux Kustomizations and HelmReleases with `Ready=False`. |
| `daily-github-actions-failure-triage` | `30 0 * * *` | CI failures across both studios orgs and cloud-pi-native. |
| `daily-documentation-sync` | `45 0 * * *` | docs.shikanime.studio claims verified against manifests and live cluster state; drift filed in this repo, small factual fixes fastlaned. |
| `weekly-a2a-cluster-efficiency-audit` | `0 1 * * 1` | Efficiency proposals from A2A peers; top 3 filed as issues. |
| `daily-security-audit` | `15 1 * * *` | Code-scanning, secret-scanning, and Dependabot alerts. |
| `daily-github-triage` | `30 1 * * *` | Labels, assignment, and first replies on open issues and PRs. |
| `daily-github-cleanup` | `45 1 * * *` | Deletion of fully-merged branches idle 7 days or more. |
| `daily-github-notification-sweep` | `0 2 * * *` | Unread GitHub notifications, answered as `yorha-operator`. |
| `daily-security-redteam` | `15 2 * * *` | Offensive probe for both studios orgs; re-verifies previously found attack paths before hunting new ones. |
| `daily-renovate-landing` | `30 2 * * *` | Landing pass over open renovate PRs. |
| `daily-kubernetes-events-triage` | `45 2 * * *` | Kubernetes warning events, grouped and deduplicated. |

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

## Workstation jobs

The operator's workstation runs a second set outside VCS, declared in
`~/.hermes/cron/jobs.json` of the local Hermes profile. Schedules
mirror the hub's night-window convention in local time (CET/CEST),
again staggered in 15-minute steps.

| Job | Schedule | Scope |
|---|---|---|
| `daily-cpn-docs-sync` | `0 0 * * *` | Reflects `author:shikanime` commits across cloud-pi-native into the org's documentation repos. |
| `daily-github-notification-sweep` | `15 0 * * *` | Unread notifications for shikanime-labs and shikanime-studio. |
| `daily-cpn-github-sweep` | `30 0 * * *` | Open cloud-pi-native items authored by `shikanime`. |
| `daily-cpn-github-triage` | `45 0 * * *` | Triage of those items: labels, milestones, first replies. |
| `daily-cpin-github-actions-failure-triage` | `0 1 * * *` | Failed Actions runs on work authored by `shikanime`. |
| `weekly-veille-technologique` | `15 0 * * 1` | Technology watch plus skills-catalog consolidation for the profile. |
| `weekly-cpin-security-audit` | `0 1 * * 2` | Code-scanning, secret-scanning, and Dependabot alerts, plus security-bot comments, on repos touched by `shikanime`'s open work. Read-only: never dismisses alerts, never opens fix PRs. |
| `weekly-cpin-security-redteam` | `15 1 * * 3` | Findings tracker over the cloud-pi-native red-team ledger issue (`Constats red team passive cpin-hp + formation` in `documentation-interne-socle`); statuses each finding open, in-flight, pending verification, or verified, and reports the unremediated count and oldest age. Read-only: remediation closure is deliberate, N-of-N verified, human-confirmed. |
| `monthly-org-process-improvement` | `30 1 1 * *` | Proposals-only process sweep across both studios orgs: recurring CI failure causes, stale AGENTS.md, workflow drift, jobs in error state, review-starved PRs, aging issues. Files at most 3 issues in `shikanime-labs/manifests` per run against the previous run's ledger; a clean sweep reports one line. |

The two weekly cloud-pi-native security jobs carry one deliberate
exception in their prompts: console's unsalted SHA-256 token hash is
required design, not a finding — salting would invalidate every shared
token — and bot comments anchoring to old commits must be re-checked
against the file at HEAD before reporting.

## Deployment

Routes and jobs reach the fleet only through a containerdisk rebuild of
the automata image; editing the live agent changes nothing. The
`hermes-agent-events-env` sops template injects the webhook port and
secret into the service environment, and a rebuild restarts
`hermes-agent.service` with the new declarations. Workstation jobs take
effect on save — the local scheduler picks up `jobs.json` without a
restart.

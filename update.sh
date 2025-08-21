#!/usr/bin/env bash

set -o errexit
set -o nounset
set -o pipefail

# Update gitignore
gitnr create \
  ghc:Nix \
  repo:shikanime/gitignore/refs/heads/main/Devenv.gitignore \
  tt:astro \
  tt:node \
  tt:jetbrains+all \
  tt:linux \
  tt:macos \
  tt:terraform \
  tt:vim \
  tt:visualstudiocode \
  tt:windows >.gitignore

# Update workflows
bash "$(dirname "$0")"/.github/workflows/update.sh 2>&1 |
  sed 's/^/['workflows'] /'

for dir in "$(dirname "$0")"/packages/*; do
  if [ -f "$dir/update.sh" ]; then
    bash "$dir/update.sh" 2>&1 |
      sed 's/^/['"$(basename "$(dirname "$dir")")"'] /' &
  fi
done

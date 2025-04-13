#!/usr/bin/env bash

set -o errexit
set -o nounset
set -o pipefail

# Get the directory containing this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Fetch D1 database ID from Terraform output
D1_ID=$(cd "$SCRIPT_DIR/../../infra" && tofu output -json d1s | jq -r '.[0]')

# Update wrangler.toml with the new D1 database ID
sed -i '' "s/database_id = \"[^\"]*\"/database_id = \"$D1_ID\"/" "$SCRIPT_DIR/wrangler.toml"

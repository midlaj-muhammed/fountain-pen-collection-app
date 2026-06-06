#!/usr/bin/env bash
# Wrapper around `npm run build` in the functions/ directory. The
# Firebase CLI runs predeploy commands via `/bin/sh -c`, and `npm`
# options starting with `--` get mis-parsed as shell flags. Running
# through a script sidesteps the issue.
set -euo pipefail
cd "$(dirname "$0")/../functions"
npm run build

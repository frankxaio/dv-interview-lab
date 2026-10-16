#!/usr/bin/env bash
# Rebuild the question bank, then start the DV Interview Lab server.
set -euo pipefail
cd "$(dirname "$0")"
python3 scripts/build_questions.py | tail -1
exec node server.js

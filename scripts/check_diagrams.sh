#!/usr/bin/env bash
# Render-test every Mermaid/WaveDrom diagram via headless Chrome (server must be running).
set -euo pipefail
URL="http://127.0.0.1:${DVLAB_PORT:-8080}/check.html"
google-chrome --headless=new --no-sandbox --disable-gpu --no-proxy-server --virtual-time-budget=180000 --dump-dom "$URL" 2>/dev/null \
  | python3 -c '
import sys, re, html
match = re.search(r"<pre id=\"out\">(.*?)</pre>", sys.stdin.read(), re.S)
report = html.unescape(match.group(1)) if match else "ERROR: no diagram-check result"
print(report)
summary = re.match(r"CHECKED (\d+) diagrams, (\d+) failed", report)
sys.exit(0 if summary and int(summary[1]) > 0 and int(summary[2]) == 0 else 1)
'

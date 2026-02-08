#!/bin/bash
set -e

REPO_DIR="${DATA_DASHBOARD_REPO:-/home/moltbot/data-dashboard}"
DB_DIR="/home/moltbot/clawd/briefing_collect/db"
DATE="${1:-$(date +%Y-%m-%d)}"

export BRIEFING_DB="/home/moltbot/clawd/briefing_collect/briefing.db"
export COMPILED_DIR="/home/moltbot/clawd/briefing_collect/compiled"
export OUTPUT_DIR="${REPO_DIR}/data"

cd "$DB_DIR"
NODE_PATH="$DB_DIR/node_modules" node "${REPO_DIR}/scripts/export-daily.js" "$DATE"

cd "$REPO_DIR"
git add "data/${DATE}/"
if git diff --cached --quiet; then
    echo "No changes for ${DATE}"
    exit 0
fi
git commit -m "data: ${DATE}"
git push origin main

echo "Pushed data for ${DATE}"

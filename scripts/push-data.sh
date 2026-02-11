#!/bin/bash
set -e

REPO_DIR="${DATA_DASHBOARD_REPO:-/home/moltbot/data-dashboard}"
DB_DIR="/home/moltbot/clawd/briefing_collect/db"
DATE="${1:-$(date +%Y-%m-%d)}"
SKIP_ANALYZE="${SKIP_ANALYZE:-0}"

export BRIEFING_DB="/home/moltbot/clawd/briefing_collect/briefing.db"
export COMPILED_DIR="/home/moltbot/clawd/briefing_collect/compiled"
export OUTPUT_DIR="${REPO_DIR}/data"

cd "$DB_DIR"
NODE_PATH="$DB_DIR/node_modules" node "${REPO_DIR}/scripts/export-daily.js" "$DATE"

if [ "$SKIP_ANALYZE" != "1" ]; then
    echo "Running analysis pipeline..."
    node "${REPO_DIR}/scripts/analyze-daily.js" "$DATE" || echo "Analysis failed (non-fatal), continuing with raw data"
fi

cd "$REPO_DIR"
git add "data/${DATE}/" "data/weekly/" "data/monthly/" 2>/dev/null || true
if git diff --cached --quiet; then
    echo "No changes for ${DATE}"
    exit 0
fi
git commit -m "data: ${DATE}"
git push origin main

echo "Pushed data for ${DATE}"

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

    # Weekly analysis: run on Sundays (day of week = 0)
    DOW=$(date -d "$DATE" +%w 2>/dev/null || date -j -f "%Y-%m-%d" "$DATE" +%w 2>/dev/null || echo "")
    if [ "$DOW" = "0" ]; then
        WEEK=$(date -d "$DATE" +%G-W%V 2>/dev/null || date -j -f "%Y-%m-%d" "$DATE" +%G-W%V 2>/dev/null || echo "")
        if [ -n "$WEEK" ]; then
            echo "Sunday detected — running weekly analysis for $WEEK..."
            FORCE=1 node "${REPO_DIR}/scripts/analyze-weekly.js" "$WEEK" || echo "Weekly analysis failed (non-fatal)"
        fi
    fi

    # Monthly analysis: run only on the 1st, analyzing previous month
    DOM=$(date -d "$DATE" +%d 2>/dev/null || date -j -f "%Y-%m-%d" "$DATE" +%d 2>/dev/null || echo "")
    if [ "$DOM" = "01" ]; then
        MONTH=$(date -d "$DATE - 1 day" +%Y-%m 2>/dev/null || date -j -v-1d -f "%Y-%m-%d" "$DATE" +%Y-%m 2>/dev/null || echo "")
        if [ -n "$MONTH" ]; then
            echo "1st of month — running monthly analysis for $MONTH..."
            FORCE=1 node "${REPO_DIR}/scripts/analyze-monthly.js" "$MONTH" || echo "Monthly analysis failed (non-fatal)"
        fi
    fi
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

#!/usr/bin/env node
/**
 * generate-manifest.js
 *
 * Scans data/ directory and generates data/index.json manifest.
 * Used by the Next.js app for fast lookups instead of filesystem scanning.
 *
 * Usage: node scripts/generate-manifest.js
 *
 * Output: data/index.json
 * {
 *   "generatedAt": "2026-02-14T...",
 *   "dates": ["2026-02-11", "2026-02-10", ...],
 *   "weeks": ["2026-W06", ...],
 *   "months": ["2026-02", ...],
 *   "latestDateWithData": "2026-02-11",
 *   "dateMeta": {
 *     "2026-02-11": { "hasMarket": true, "hasNews": true, "hasHn": true, "hasX": true, "hasStockNews": true, "hasBriefingAm": true, "hasBriefingPm": false, "hasAnalysis": true }
 *   }
 * }
 */

const fs = require("fs");
const path = require("path");

const DATA_DIR = process.env.OUTPUT_DIR || path.join(__dirname, "..", "data");

function scanDates() {
  try {
    const entries = fs.readdirSync(DATA_DIR, { withFileTypes: true });
    return entries
      .filter((e) => e.isDirectory() && /^\d{4}-\d{2}-\d{2}$/.test(e.name))
      .map((e) => e.name)
      .sort()
      .reverse();
  } catch {
    return [];
  }
}

function scanWeeks() {
  const weeklyDir = path.join(DATA_DIR, "weekly");
  try {
    const entries = fs.readdirSync(weeklyDir, { withFileTypes: true });
    return entries
      .filter((e) => e.isFile() && /^\d{4}-W\d{2}\.json$/.test(e.name))
      .map((e) => e.name.replace(".json", ""))
      .sort()
      .reverse();
  } catch {
    return [];
  }
}

function scanMonths() {
  const monthlyDir = path.join(DATA_DIR, "monthly");
  try {
    const entries = fs.readdirSync(monthlyDir, { withFileTypes: true });
    return entries
      .filter((e) => e.isFile() && /^\d{4}-\d{2}\.json$/.test(e.name))
      .map((e) => e.name.replace(".json", ""))
      .sort()
      .reverse();
  } catch {
    return [];
  }
}

function fileExists(filePath) {
  try {
    fs.accessSync(filePath, fs.constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

function readJsonSafe(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return null;
  }
}

function getDateMeta(date) {
  const dir = path.join(DATA_DIR, date);

  const market = readJsonSafe(path.join(dir, "market.json"));
  const news = readJsonSafe(path.join(dir, "news.json"));
  const hn = readJsonSafe(path.join(dir, "hn.json"));
  const x = readJsonSafe(path.join(dir, "x.json"));
  const stockNews = readJsonSafe(path.join(dir, "stock-news.json"));

  const newsCount =
    (news?.us?.length ?? 0) + (news?.kr?.length ?? 0);
  const hnCount = hn?.posts?.length ?? 0;
  const xCount = x?.posts?.length ?? 0;
  const stockNewsCount = stockNews?.articles?.length ?? 0;

  return {
    hasMarket: market !== null,
    hasNews: newsCount > 0,
    hasHn: hnCount > 0,
    hasX: xCount > 0,
    hasStockNews: stockNewsCount > 0,
    hasBriefingAm: fileExists(path.join(dir, "briefing-am.json")),
    hasBriefingPm: fileExists(path.join(dir, "briefing-pm.json")),
    hasAnalysis: !!market?.analysis,
    totalItems: newsCount + hnCount + xCount + stockNewsCount,
  };
}

function findLatestDateWithData(dates, dateMeta) {
  for (const date of dates) {
    if ((dateMeta[date]?.totalItems ?? 0) > 0) {
      return date;
    }
  }
  return dates.length > 0 ? dates[0] : null;
}

// ── Main ──

const dates = scanDates();
const weeks = scanWeeks();
const months = scanMonths();

const dateMeta = {};
for (const date of dates) {
  dateMeta[date] = getDateMeta(date);
}

const latestDateWithData = findLatestDateWithData(dates, dateMeta);

const manifest = {
  generatedAt: new Date().toISOString(),
  dates,
  weeks,
  months,
  latestDateWithData,
  dateMeta,
};

const outputPath = path.join(DATA_DIR, "index.json");
fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2) + "\n");

console.log(`Manifest generated: ${outputPath}`);
console.log(`  dates: ${dates.length}, weeks: ${weeks.length}, months: ${months.length}`);
console.log(`  latestDateWithData: ${latestDateWithData}`);

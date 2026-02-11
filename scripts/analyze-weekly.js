#!/usr/bin/env node
/**
 * analyze-weekly.js — JJ News 자비스 주간 분석 파이프라인 v1
 *
 * 파이프라인:
 *   data/YYYY-MM-DD/*.json (일별 enriched 데이터)
 *   → analyze-weekly.js (주간 집계 + OpenAI)
 *   → data/weekly/YYYY-Www.json
 *
 * 환경변수:
 *   OPENAI_API_KEY  — OpenAI API key (필수)
 *   OUTPUT_DIR      — data 디렉토리 (default: ../data)
 *   MODEL           — OpenAI model (default: gpt-4o-mini)
 *   DRY_RUN         — 1이면 API 호출 없이 프롬프트만 출력
 *   FORCE           — 1이면 기존 output 덮어쓰기
 */

const fs = require('fs');
const path = require('path');

// ─── Config ───

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OUTPUT_DIR = process.env.OUTPUT_DIR || path.join(__dirname, '..', 'data');
const MODEL = process.env.MODEL || 'gpt-4o-mini';
const DRY_RUN = process.env.DRY_RUN === '1';
const FORCE = process.env.FORCE === '1';
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 2000;

const targetWeek = process.argv[2] || getCurrentISOWeek();
const dateRange = getISOWeekDateRange(targetWeek);
const weeklyDir = path.join(OUTPUT_DIR, 'weekly');
const outputPath = path.join(weeklyDir, `${targetWeek}.json`);

// ─── OpenAI API ───

async function callOpenAI(systemPrompt, userPrompt, options = {}) {
  const { temperature = 0.3, maxTokens = 4096 } = options;

  if (DRY_RUN) {
    console.log('\n[DRY RUN] System:', systemPrompt.slice(0, 100) + '...');
    console.log('[DRY RUN] User:', userPrompt.slice(0, 200) + '...');
    return null;
  }

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature,
          max_tokens: maxTokens,
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`OpenAI API error: ${response.status} ${err}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      return JSON.parse(content);
    } catch (err) {
      if (attempt < MAX_RETRIES) {
        console.warn(`  Retry ${attempt + 1}/${MAX_RETRIES}: ${err.message}`);
        await sleep(RETRY_DELAY_MS * (attempt + 1));
      } else {
        console.error(`  FAILED after ${MAX_RETRIES + 1} attempts: ${err.message}`);
        return null;
      }
    }
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── Date helpers ───

function formatDateUTC(date) {
  return date.toISOString().slice(0, 10);
}

function parseISOWeek(weekStr) {
  const match = /^(\d{4})-W(\d{2})$/.exec(weekStr);
  if (!match) {
    throw new Error(`Invalid week format: ${weekStr} (expected YYYY-Www)`);
  }
  const year = Number(match[1]);
  const week = Number(match[2]);
  if (week < 1 || week > 53) {
    throw new Error(`Invalid ISO week number: ${week}`);
  }
  return { year, week };
}

function getISOWeekDateRange(weekStr) {
  const { year, week } = parseISOWeek(weekStr);
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7;
  const week1Monday = new Date(jan4);
  week1Monday.setUTCDate(jan4.getUTCDate() - (jan4Day - 1));

  const start = new Date(week1Monday);
  start.setUTCDate(week1Monday.getUTCDate() + (week - 1) * 7);

  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);

  return {
    start: formatDateUTC(start),
    end: formatDateUTC(end)
  };
}

function getCurrentISOWeek() {
  const now = new Date();
  const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);

  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

function enumerateDates(startDate, endDate) {
  const out = [];
  const cur = new Date(`${startDate}T00:00:00.000Z`);
  const end = new Date(`${endDate}T00:00:00.000Z`);
  while (cur <= end) {
    out.push(formatDateUTC(cur));
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return out;
}

// ─── File helpers ───

function readJSON(filepath) {
  if (!fs.existsSync(filepath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
  } catch {
    console.warn(`  Failed to read ${path.relative(OUTPUT_DIR, filepath)}`);
    return null;
  }
}

function writeJSON(filepath, data) {
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
}

// ─── System prompts ───

const SYSTEM_BASE = `당신은 JJ News의 AI 분석가 "자비스"입니다.
역할: 금융/기술 데이터를 분석하고 한국어로 인사이트를 제공합니다.

분석 원칙:
- 간결하고 날카로운 분석 (요약 1-2문장, 분석 2-3문장)
- 한국어로만 작성
- 객관적 사실 기반 + 자비스의 관점/의견 분리
- sentiment: "bullish" (강세), "bearish" (약세), "neutral" (중립)
- relevance: "high" (핵심), "medium" (참고), "low" (배경)
- impact: "positive" (긍정), "negative" (부정), "neutral" (중립)
- jarvis_take: 자비스의 개인적 관점/의견 (틀려도 됨, 대담하게)
- HTML entity 사용 금지 — 유니코드 직접 사용`;

// ─── Aggregation ───

function buildMarketRecap(dailyRecords) {
  const marketDays = dailyRecords
    .filter(r => Array.isArray(r.market?.quotes) && r.market.quotes.length > 0)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (marketDays.length === 0) {
    return {
      market_recap: { best_performers: [], worst_performers: [] },
      changes: [],
      start_values: {},
      end_values: {}
    };
  }

  const startQuotes = marketDays[0].market.quotes;
  const endQuotes = marketDays[marketDays.length - 1].market.quotes;

  const startMap = {};
  const endMap = {};

  for (const q of startQuotes) {
    if (q?.symbol && typeof q.price === 'number') {
      startMap[q.symbol] = q.price;
    }
  }

  for (const q of endQuotes) {
    if (q?.symbol && typeof q.price === 'number') {
      endMap[q.symbol] = q.price;
    }
  }

  const changes = [];
  for (const symbol of Object.keys(startMap)) {
    const startPrice = startMap[symbol];
    const endPrice = endMap[symbol];
    if (!startPrice || endPrice == null) continue;
    const changePercent = Number((((endPrice - startPrice) / startPrice) * 100).toFixed(2));
    changes.push({ symbol, change_percent: changePercent });
  }

  const sorted = [...changes].sort((a, b) => b.change_percent - a.change_percent);

  return {
    market_recap: {
      best_performers: sorted.slice(0, 5),
      worst_performers: [...sorted].reverse().slice(0, 5)
    },
    changes,
    start_values: startMap,
    end_values: endMap
  };
}

function aggregateWeeklyContext(dailyRecords) {
  const context = [];

  const marketData = buildMarketRecap(dailyRecords);
  if (marketData.changes.length) {
    context.push(`[시장 주간 변화]\n${marketData.changes.map(c => `- ${c.symbol}: ${c.change_percent > 0 ? '+' : ''}${c.change_percent}%`).join('\n')}`);
    context.push(`[시장 베스트]\n${marketData.market_recap.best_performers.map(p => `- ${p.symbol}: ${p.change_percent}%`).join('\n')}`);
    context.push(`[시장 워스트]\n${marketData.market_recap.worst_performers.map(p => `- ${p.symbol}: ${p.change_percent}%`).join('\n')}`);
  }

  const newsSummaries = [];
  const newsHighlights = [];
  for (const day of dailyRecords) {
    if (day.news?.analysis?.summary_kr) {
      newsSummaries.push(`- ${day.date}: ${day.news.analysis.summary_kr}`);
    }
    const allNews = [...(day.news?.us || []), ...(day.news?.kr || [])]
      .filter(n => n?.summary_kr && (n.relevance === 'high' || n.relevance == null))
      .slice(0, 6)
      .map(n => `- ${day.date}: ${n.summary_kr}`);
    newsHighlights.push(...allNews);
  }
  if (newsSummaries.length) context.push(`[뉴스 일별 요약]\n${newsSummaries.slice(0, 20).join('\n')}`);
  if (newsHighlights.length) context.push(`[핵심 뉴스 하이라이트]\n${newsHighlights.slice(0, 40).join('\n')}`);

  const xSummaries = [];
  for (const day of dailyRecords) {
    const lines = (day.x?.posts || [])
      .filter(p => p?.summary_kr)
      .slice(0, 8)
      .map(p => `- ${day.date} @${p.username}: ${p.summary_kr}`);
    xSummaries.push(...lines);
  }
  if (xSummaries.length) context.push(`[X 포스트 요약]\n${xSummaries.slice(0, 60).join('\n')}`);

  const hnSummaries = [];
  const hnTrends = [];
  for (const day of dailyRecords) {
    const posts = (day.hn?.posts || [])
      .filter(p => p?.summary_kr)
      .slice(0, 8)
      .map(p => `- ${day.date}: ${p.summary_kr}`);
    hnSummaries.push(...posts);
    if (Array.isArray(day.hn?.analysis?.trends)) {
      hnTrends.push(...day.hn.analysis.trends.map(t => `- ${day.date}: ${t}`));
    }
  }
  if (hnSummaries.length) context.push(`[해커뉴스 요약]\n${hnSummaries.slice(0, 60).join('\n')}`);
  if (hnTrends.length) context.push(`[해커뉴스 트렌드]\n${hnTrends.slice(0, 30).join('\n')}`);

  const stockSummaries = [];
  for (const day of dailyRecords) {
    const items = (day.stockNews?.articles || [])
      .filter(a => a?.summary_kr)
      .slice(0, 10)
      .map(a => `- ${day.date} [${a.symbol}]: ${a.summary_kr}`);
    stockSummaries.push(...items);
  }
  if (stockSummaries.length) context.push(`[종목 뉴스 요약]\n${stockSummaries.slice(0, 80).join('\n')}`);

  const briefingSummaries = [];
  for (const day of dailyRecords) {
    if (day.briefingPm?.tldr?.length) {
      briefingSummaries.push(`- ${day.date}: ${day.briefingPm.tldr.slice(0, 3).join(' / ')}`);
    }
  }
  if (briefingSummaries.length) context.push(`[일일 PM 브리핑 TL;DR]\n${briefingSummaries.join('\n')}`);

  return {
    context,
    marketRecap: marketData.market_recap,
    startValues: marketData.start_values,
    endValues: marketData.end_values
  };
}

function normalizeWeeklyResult(raw, week, start, end, marketRecap, startValues, endValues) {
  const normalizeEvents = Array.isArray(raw?.key_events)
    ? raw.key_events
      .filter(e => e && e.title && e.detail)
      .map(e => ({
        title: String(e.title),
        detail: String(e.detail),
        category: String(e.category || 'news'),
        date: String(e.date || start)
      }))
    : [];

  const out = {
    week,
    date_range: { start, end },
    summary_kr: String(raw?.summary_kr || ''),
    key_events: normalizeEvents,
    market_recap: {
      start_values: startValues,
      end_values: endValues,
      best_performers: Array.isArray(raw?.market_recap?.best_performers) ? raw.market_recap.best_performers : marketRecap.best_performers,
      worst_performers: Array.isArray(raw?.market_recap?.worst_performers) ? raw.market_recap.worst_performers : marketRecap.worst_performers
    },
    top_themes: Array.isArray(raw?.top_themes) ? raw.top_themes.map(String) : [],
    analysis: String(raw?.analysis || ''),
    outlook: String(raw?.outlook || ''),
    jarvis_take: String(raw?.jarvis_take || ''),
    generated_at: raw?.generated_at || new Date().toISOString()
  };

  if (raw?.title) out.title = String(raw.title);

  return out;
}

async function generateWeeklyBriefing(week, start, end, aggregatedContext, marketRecap, startValues, endValues) {
  console.log('▶ Generating weekly briefing...');

  const result = await callOpenAI(
    SYSTEM_BASE,
    `당신은 JJ News의 AI 분석가 "자비스"입니다.
이번 주(${week}, ${start}~${end}) 데이터를 종합하여 주간 브리핑을 작성해주세요.

집계 데이터:
${aggregatedContext.join('\n\n')}

JSON 형식:
{
  "week": "${week}",
  "date_range": { "start": "${start}", "end": "${end}" },
  "title": "주간 헤드라인 (한 줄)",
  "summary_kr": "이번 주 종합 요약 3-5문장",
  "key_events": [
    { "title": "이벤트 제목", "detail": "상세 1-2문장", "category": "market|dev|news|x|hn|stock", "date": "YYYY-MM-DD" }
  ],
  "market_recap": {
    "best_performers": [{ "symbol": "XXX", "change_percent": 0.0 }],
    "worst_performers": [{ "symbol": "XXX", "change_percent": 0.0 }]
  },
  "top_themes": ["테마1", "테마2", "테마3"],
  "analysis": "자비스의 이번 주 분석 3-5문장",
  "outlook": "다음 주 전망 2-3문장",
  "jarvis_take": "자비스의 개인적 관점/의견 3-5문장 (대담하게)",
  "generated_at": "ISO timestamp"
}

중요:
- 반드시 JSON만 출력
- summary_kr, analysis, outlook, jarvis_take는 충분히 구체적으로 작성
- key_events는 최소 5개, 날짜 포함
- market_recap은 집계 데이터와 숫자 일관성 유지`,
    { maxTokens: 6144 }
  );

  if (!result) return null;

  return normalizeWeeklyResult(result, week, start, end, marketRecap, startValues, endValues);
}

// ─── Main ───

async function main() {
  console.log(`\n╔══════════════════════════════════════╗`);
  console.log(`║  JJ News — 자비스 주간 분석 파이프라인   ║`);
  console.log(`╚══════════════════════════════════════╝`);
  console.log(`Week: ${targetWeek}`);
  console.log(`Range: ${dateRange.start} ~ ${dateRange.end}`);
  console.log(`Model: ${MODEL}`);
  console.log(`Dir: ${OUTPUT_DIR}`);
  if (DRY_RUN) console.log('⚠️  DRY RUN MODE');
  if (FORCE) console.log('⚠️  FORCE MODE (overwrite enabled)');
  console.log('');

  if (fs.existsSync(outputPath) && !FORCE) {
    console.log(`weekly/${targetWeek}.json: already exists, skipping (set FORCE=1 to overwrite)`);
    process.exit(0);
  }

  if (!OPENAI_API_KEY && !DRY_RUN) {
    console.error('ERROR: OPENAI_API_KEY is required');
    process.exit(1);
  }

  const dates = enumerateDates(dateRange.start, dateRange.end);
  const dailyRecords = [];

  console.log('▶ Loading daily data...');
  for (const date of dates) {
    const dateDir = path.join(OUTPUT_DIR, date);
    if (!fs.existsSync(dateDir)) {
      console.log(`  ${date}: missing directory, skipping`);
      continue;
    }

    const record = {
      date,
      market: readJSON(path.join(dateDir, 'market.json')),
      news: readJSON(path.join(dateDir, 'news.json')),
      x: readJSON(path.join(dateDir, 'x.json')),
      hn: readJSON(path.join(dateDir, 'hn.json')),
      stockNews: readJSON(path.join(dateDir, 'stock-news.json')),
      briefingPm: readJSON(path.join(dateDir, 'briefing-pm.json'))
    };

    const count = {
      market: record.market?.quotes?.length || 0,
      news: (record.news?.us?.length || 0) + (record.news?.kr?.length || 0),
      x: record.x?.posts?.length || 0,
      hn: record.hn?.posts?.length || 0,
      stock: record.stockNews?.articles?.length || 0,
      briefing: record.briefingPm?.tldr?.length || 0
    };

    console.log(`  ${date}: ${JSON.stringify(count)}`);
    dailyRecords.push(record);
  }

  if (dailyRecords.length === 0) {
    console.log('No daily data directories found for this week. Exiting.');
    process.exit(0);
  }

  console.log('\n▶ Aggregating weekly context...');
  const aggregated = aggregateWeeklyContext(dailyRecords);
  if (aggregated.context.length === 0) {
    console.log('No analyzable weekly context found. Exiting.');
    process.exit(0);
  }

  const weekly = await generateWeeklyBriefing(
    targetWeek,
    dateRange.start,
    dateRange.end,
    aggregated.context,
    aggregated.marketRecap,
    aggregated.startValues,
    aggregated.endValues
  );

  if (!weekly) {
    if (DRY_RUN) {
      console.log('\n✅ DRY RUN complete! (no API call, no file written)');
      process.exit(0);
    }
    console.error('Failed to generate weekly briefing.');
    process.exit(1);
  }

  fs.mkdirSync(weeklyDir, { recursive: true });
  writeJSON(outputPath, weekly);

  console.log('\n✅ Weekly analysis complete!');
  console.log(`   Week: ${targetWeek}`);
  console.log(`   Date range: ${dateRange.start} ~ ${dateRange.end}`);
  console.log(`   Key events: ${weekly.key_events.length}`);
  console.log(`   Themes: ${weekly.top_themes.length}`);
  console.log(`   Output: ${path.relative(OUTPUT_DIR, outputPath)}`);
}

main().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});

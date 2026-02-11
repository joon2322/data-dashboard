#!/usr/bin/env node
/**
 * analyze-monthly.js — JJ News 자비스 월간 분석 파이프라인 v1
 *
 * 파이프라인:
 *   data/YYYY-MM-DD/*.json (일별 enriched 데이터)
 *   + data/weekly/YYYY-Www.json (주간 요약)
 *   → analyze-monthly.js (월간 집계 + OpenAI)
 *   → data/monthly/YYYY-MM.json
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

const targetMonth = process.argv[2] || getCurrentMonth();
const monthRange = getMonthDateRange(targetMonth);
const monthlyDir = path.join(OUTPUT_DIR, 'monthly');
const outputPath = path.join(monthlyDir, `${targetMonth}.json`);

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

function getCurrentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function getMonthDateRange(monthStr) {
  const match = /^(\d{4})-(\d{2})$/.exec(monthStr);
  if (!match) {
    throw new Error(`Invalid month format: ${monthStr} (expected YYYY-MM)`);
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  if (month < 1 || month > 12) {
    throw new Error(`Invalid month: ${month}`);
  }

  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 0));

  return {
    start: formatDateUTC(start),
    end: formatDateUTC(end),
    year,
    month
  };
}

function enumerateMonthDates(year, month) {
  const dates = [];
  const cur = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 0));
  while (cur <= end) {
    dates.push(formatDateUTC(cur));
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return dates;
}

function getISOWeekFromDate(dateStr) {
  const date = new Date(`${dateStr}T00:00:00.000Z`);
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
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

function buildMonthlyMarketRecap(dailyRecords) {
  const marketDays = dailyRecords
    .filter(r => Array.isArray(r.market?.quotes) && r.market.quotes.length > 0)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (marketDays.length === 0) {
    return {
      start_values: {},
      end_values: {},
      monthly_change: {}
    };
  }

  const startMap = {};
  const endMap = {};

  for (const q of marketDays[0].market.quotes) {
    if (q?.symbol && typeof q.price === 'number') {
      startMap[q.symbol] = q.price;
    }
  }

  for (const q of marketDays[marketDays.length - 1].market.quotes) {
    if (q?.symbol && typeof q.price === 'number') {
      endMap[q.symbol] = q.price;
    }
  }

  const monthlyChange = {};
  for (const symbol of Object.keys(startMap)) {
    const startPrice = startMap[symbol];
    const endPrice = endMap[symbol];
    if (!startPrice || endPrice == null) continue;
    monthlyChange[symbol] = Number((((endPrice - startPrice) / startPrice) * 100).toFixed(2));
  }

  return {
    start_values: startMap,
    end_values: endMap,
    monthly_change: monthlyChange
  };
}

function aggregateMonthlyContext(dailyRecords, weeklySummaries) {
  const context = [];

  const marketRecap = buildMonthlyMarketRecap(dailyRecords);
  const marketChanges = Object.entries(marketRecap.monthly_change)
    .sort((a, b) => b[1] - a[1])
    .map(([symbol, change]) => `- ${symbol}: ${change > 0 ? '+' : ''}${change}%`);
  if (marketChanges.length) {
    context.push(`[월간 시장 변화]\n${marketChanges.join('\n')}`);
  }

  const dailyMarketAnalysis = dailyRecords
    .filter(d => d.market?.analysis?.summary_kr)
    .map(d => `- ${d.date}: ${d.market.analysis.summary_kr}`);
  if (dailyMarketAnalysis.length) {
    context.push(`[일별 시장 요약]\n${dailyMarketAnalysis.slice(0, 31).join('\n')}`);
  }

  const newsDaily = dailyRecords
    .filter(d => d.news?.analysis?.summary_kr)
    .map(d => `- ${d.date}: ${d.news.analysis.summary_kr}`);
  if (newsDaily.length) {
    context.push(`[일별 뉴스 요약]\n${newsDaily.slice(0, 31).join('\n')}`);
  }

  const highNews = [];
  for (const day of dailyRecords) {
    const allNews = [...(day.news?.us || []), ...(day.news?.kr || [])]
      .filter(n => n?.summary_kr && (n.relevance === 'high' || n.relevance == null))
      .slice(0, 6)
      .map(n => `- ${day.date}: ${n.summary_kr}`);
    highNews.push(...allNews);
  }
  if (highNews.length) {
    context.push(`[고중요 뉴스]\n${highNews.slice(0, 120).join('\n')}`);
  }

  const xSummary = [];
  for (const day of dailyRecords) {
    const lines = (day.x?.posts || [])
      .filter(p => p?.summary_kr)
      .slice(0, 5)
      .map(p => `- ${day.date} @${p.username}: ${p.summary_kr}`);
    xSummary.push(...lines);
  }
  if (xSummary.length) {
    context.push(`[X 요약]\n${xSummary.slice(0, 120).join('\n')}`);
  }

  const hnSummary = [];
  const hnTrends = [];
  for (const day of dailyRecords) {
    const lines = (day.hn?.posts || [])
      .filter(p => p?.summary_kr)
      .slice(0, 5)
      .map(p => `- ${day.date}: ${p.summary_kr}`);
    hnSummary.push(...lines);
    if (Array.isArray(day.hn?.analysis?.trends)) {
      hnTrends.push(...day.hn.analysis.trends.map(t => `- ${day.date}: ${t}`));
    }
  }
  if (hnSummary.length) context.push(`[해커뉴스 요약]\n${hnSummary.slice(0, 120).join('\n')}`);
  if (hnTrends.length) context.push(`[해커뉴스 트렌드]\n${hnTrends.slice(0, 60).join('\n')}`);

  const stockSummary = [];
  for (const day of dailyRecords) {
    const lines = (day.stockNews?.articles || [])
      .filter(a => a?.summary_kr)
      .slice(0, 8)
      .map(a => `- ${day.date} [${a.symbol}]: ${a.summary_kr}`);
    stockSummary.push(...lines);
  }
  if (stockSummary.length) context.push(`[종목 뉴스 요약]\n${stockSummary.slice(0, 160).join('\n')}`);

  if (weeklySummaries.length) {
    const weeklyText = weeklySummaries.map(w => {
      const themes = Array.isArray(w.top_themes) ? w.top_themes.join(', ') : '';
      return `- ${w.week}: ${w.summary_kr || ''}${themes ? ` (themes: ${themes})` : ''}`;
    });
    context.push(`[주간 요약]\n${weeklyText.join('\n')}`);
  }

  return {
    context,
    marketRecap
  };
}

function normalizeMonthlyResult(raw, month, marketRecap) {
  const notable = Array.isArray(raw?.notable_events)
    ? raw.notable_events
      .filter(e => e && e.title && e.detail)
      .map(e => ({
        date: String(e.date || `${month}-01`),
        title: String(e.title),
        detail: String(e.detail)
      }))
    : [];

  const out = {
    month,
    summary_kr: String(raw?.summary_kr || ''),
    key_themes: Array.isArray(raw?.key_themes) ? raw.key_themes.map(String) : [],
    market_recap: {
      start_values: marketRecap.start_values,
      end_values: marketRecap.end_values,
      monthly_change: marketRecap.monthly_change
    },
    notable_events: notable,
    analysis: String(raw?.analysis || ''),
    outlook: String(raw?.outlook || ''),
    jarvis_take: String(raw?.jarvis_take || ''),
    generated_at: raw?.generated_at || new Date().toISOString()
  };

  if (raw?.title) out.title = String(raw.title);

  return out;
}

async function generateMonthlyBriefing(month, aggregatedContext, marketRecap) {
  console.log('▶ Generating monthly briefing...');

  const result = await callOpenAI(
    SYSTEM_BASE,
    `당신은 JJ News의 AI 분석가 "자비스"입니다.
이번 달(${month}) 데이터를 종합하여 월간 브리핑을 작성해주세요.

집계 데이터:
${aggregatedContext.join('\n\n')}

JSON 형식:
{
  "month": "${month}",
  "title": "월간 헤드라인 (한 줄)",
  "summary_kr": "이번 달 종합 요약 5-8문장",
  "key_themes": ["테마1", "테마2", "테마3"],
  "market_recap": {
    "start_values": { "symbol": 0.0 },
    "end_values": { "symbol": 0.0 },
    "monthly_change": { "symbol": 0.0 }
  },
  "notable_events": [
    { "date": "YYYY-MM-DD", "title": "이벤트", "detail": "상세" }
  ],
  "analysis": "자비스의 이번 달 분석 5-8문장",
  "outlook": "다음 달 전망 3-5문장",
  "jarvis_take": "자비스의 개인적 관점/의견 3-5문장",
  "generated_at": "ISO timestamp"
}

중요:
- 반드시 JSON만 출력
- summary_kr, analysis, outlook, jarvis_take는 충분히 구체적으로 작성
- notable_events는 최소 6개, 날짜 포함
- market_recap 수치는 집계 데이터와 일치
- key_themes는 중복 없이 핵심만`,
    { maxTokens: 8192 }
  );

  if (!result) return null;

  return normalizeMonthlyResult(result, month, marketRecap);
}

// ─── Main ───

async function main() {
  console.log(`\n╔══════════════════════════════════════╗`);
  console.log(`║  JJ News — 자비스 월간 분석 파이프라인   ║`);
  console.log(`╚══════════════════════════════════════╝`);
  console.log(`Month: ${targetMonth}`);
  console.log(`Range: ${monthRange.start} ~ ${monthRange.end}`);
  console.log(`Model: ${MODEL}`);
  console.log(`Dir: ${OUTPUT_DIR}`);
  if (DRY_RUN) console.log('⚠️  DRY RUN MODE');
  if (FORCE) console.log('⚠️  FORCE MODE (overwrite enabled)');
  console.log('');

  if (fs.existsSync(outputPath) && !FORCE) {
    console.log(`monthly/${targetMonth}.json: already exists, skipping (set FORCE=1 to overwrite)`);
    process.exit(0);
  }

  if (!OPENAI_API_KEY && !DRY_RUN) {
    console.error('ERROR: OPENAI_API_KEY is required');
    process.exit(1);
  }

  const dates = enumerateMonthDates(monthRange.year, monthRange.month);
  const dailyRecords = [];

  console.log('▶ Loading daily data...');
  for (const date of dates) {
    const dateDir = path.join(OUTPUT_DIR, date);
    if (!fs.existsSync(dateDir)) continue;

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
      stock: record.stockNews?.articles?.length || 0
    };

    console.log(`  ${date}: ${JSON.stringify(count)}`);
    dailyRecords.push(record);
  }

  if (dailyRecords.length === 0) {
    console.log('No daily data found for this month. Exiting.');
    process.exit(0);
  }

  console.log('\n▶ Loading weekly summaries...');
  const weekKeys = [...new Set(dailyRecords.map(r => getISOWeekFromDate(r.date)))].sort();
  const weeklySummaries = [];
  for (const week of weekKeys) {
    const weeklyPath = path.join(OUTPUT_DIR, 'weekly', `${week}.json`);
    const weekly = readJSON(weeklyPath);
    if (weekly) {
      weeklySummaries.push(weekly);
      console.log(`  weekly/${week}.json: loaded`);
    } else {
      console.log(`  weekly/${week}.json: missing`);
    }
  }

  console.log('\n▶ Aggregating monthly context...');
  const aggregated = aggregateMonthlyContext(dailyRecords, weeklySummaries);
  if (aggregated.context.length === 0) {
    console.log('No analyzable monthly context found. Exiting.');
    process.exit(0);
  }

  const monthly = await generateMonthlyBriefing(targetMonth, aggregated.context, aggregated.marketRecap);
  if (!monthly) {
    if (DRY_RUN) {
      console.log('\n✅ DRY RUN complete! (no API call, no file written)');
      process.exit(0);
    }
    console.error('Failed to generate monthly briefing.');
    process.exit(1);
  }

  fs.mkdirSync(monthlyDir, { recursive: true });
  writeJSON(outputPath, monthly);

  console.log('\n✅ Monthly analysis complete!');
  console.log(`   Month: ${targetMonth}`);
  console.log(`   Themes: ${monthly.key_themes.length}`);
  console.log(`   Notable events: ${monthly.notable_events.length}`);
  console.log(`   Output: ${path.relative(OUTPUT_DIR, outputPath)}`);
}

main().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});

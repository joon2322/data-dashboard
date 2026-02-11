#!/usr/bin/env node
/**
 * analyze-daily.js — JJ News 자비스 분석 파이프라인 v2
 *
 * 파이프라인:
 *   export-daily.js (DB → raw JSON)
 *   → analyze-daily.js (raw JSON + OpenAI → enriched JSON)
 *   → git push (enriched → GitHub → Vercel)
 *
 * 환경변수:
 *   OPENAI_API_KEY  — OpenAI API key (필수)
 *   OUTPUT_DIR      — data 디렉토리 (default: ../data)
 *   MODEL           — OpenAI model (default: gpt-4o-mini)
 *   DRY_RUN         — 1이면 API 호출 없이 프롬프트만 출력
 */

const fs = require('fs');
const path = require('path');

// ─── Config ───

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OUTPUT_DIR = process.env.OUTPUT_DIR || path.join(__dirname, '..', 'data');
const MODEL = process.env.MODEL || 'gpt-4o-mini';
const DRY_RUN = process.env.DRY_RUN === '1';
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 2000;

const targetDate = process.argv[2] || new Date().toISOString().split('T')[0];
const dateDir = path.join(OUTPUT_DIR, targetDate);

if (!OPENAI_API_KEY && !DRY_RUN) {
  console.error('ERROR: OPENAI_API_KEY is required');
  process.exit(1);
}

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

// ─── File helpers ───

function readJSON(filename) {
  const filepath = path.join(dateDir, filename);
  if (!fs.existsSync(filepath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
  } catch {
    console.warn(`  Failed to read ${filename}`);
    return null;
  }
}

function writeJSON(filename, data) {
  fs.writeFileSync(path.join(dateDir, filename), JSON.stringify(data, null, 2));
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

// ─── 1. Market Analysis ───

async function analyzeMarket(data) {
  if (!data || !data.quotes || data.quotes.length === 0) return data;
  if (data.analysis) { console.log('  market: already analyzed, skipping'); return data; }

  console.log(`  market: ${data.quotes.length} quotes`);

  const quoteSummary = data.quotes
    .filter(q => q.price != null)
    .map(q => `${q.symbol}(${q.name}): $${q.price} ${q.change_percent > 0 ? '+' : ''}${q.change_percent}%`)
    .join('\n');

  const result = await callOpenAI(
    SYSTEM_BASE,
    `오늘(${data.date}) 시장 데이터를 분석해주세요.

데이터:
${quoteSummary}

JSON 형식으로 응답:
{
  "summary_kr": "시장 전체 요약 1-2문장",
  "sentiment": "bullish|bearish|neutral",
  "key_drivers": ["핵심 동인1", "핵심 동인2", "핵심 동인3"],
  "key_points": ["주요 포인트1 (TL;DR용)", "주요 포인트2", "주요 포인트3"],
  "outlook": "향후 전망 1-2문장",
  "market_mood": "시장 분위기 한 줄",
  "jarvis_take": "자비스의 개인적 관점/의견 2-3문장"
}`
  );

  if (result) {
    data.analysis = result;
    writeJSON('market.json', data);
  }
  return data;
}

// ─── 2. News Analysis ───

async function analyzeNews(data) {
  if (!data) return data;
  const allNews = [...(data.us || []), ...(data.kr || [])];
  if (allNews.length === 0) return data;

  if (data.us?.[0]?.summary_kr || data.analysis) {
    console.log('  news: already analyzed, skipping');
    return data;
  }

  console.log(`  news: ${data.us?.length || 0} US + ${data.kr?.length || 0} KR`);

  const newsText = allNews.slice(0, 25).map((n, i) =>
    `[${i}] ${n.title} (${n.source || 'unknown'}, ${n.category || ''})`
  ).join('\n');

  const result = await callOpenAI(
    SYSTEM_BASE,
    `오늘(${data.date}) 뉴스 목록을 분석해주세요. 각 뉴스에 한국어 요약과 분석을 달아주세요.

뉴스 목록:
${newsText}

JSON 형식으로 응답:
{
  "items": [
    {
      "index": 0,
      "summary_kr": "한국어 1-2문장 요약",
      "analysis": "자비스 분석 2-3문장",
      "sentiment": "bullish|bearish|neutral",
      "relevance": "high|medium|low",
      "tags": ["태그1", "태그2"]
    }
  ],
  "overall": {
    "summary_kr": "오늘 뉴스 전체 요약 1-2문장",
    "top_themes": ["테마1", "테마2", "테마3"],
    "jarvis_take": "자비스의 종합 의견 2-3문장"
  }
}

참고: 뉴스가 한국어면 summary_kr은 핵심 요약만, 영어면 한국어 번역 요약.`,
    { maxTokens: 8192 }
  );

  if (result) {
    const usCount = data.us?.length || 0;
    for (const item of (result.items || [])) {
      const idx = item.index;
      let target;
      if (idx < usCount) {
        target = data.us[idx];
      } else {
        target = data.kr?.[idx - usCount];
      }
      if (target) {
        target.summary_kr = item.summary_kr;
        target.analysis = item.analysis;
        target.sentiment = item.sentiment;
        target.relevance = item.relevance;
        target.tags = item.tags;
      }
    }

    if (result.overall) {
      data.analysis = result.overall;
    }

    writeJSON('news.json', data);
  }
  return data;
}

// ─── 3. X Posts Analysis ───

async function analyzeX(data) {
  if (!data || !data.posts || data.posts.length === 0) return data;
  if (data.posts[0]?.summary_kr || data.analysis) {
    console.log('  x: already analyzed, skipping');
    return data;
  }

  console.log(`  x: ${data.posts.length} posts`);

  const postsText = data.posts.slice(0, 20).map((p, i) =>
    `[${i}] @${p.username}: "${p.text.slice(0, 200)}" (❤️${p.like_count} 🔁${p.retweet_count})`
  ).join('\n');

  const result = await callOpenAI(
    SYSTEM_BASE,
    `오늘(${data.date}) X(트위터) 포스트를 분석해주세요.

포스트 목록:
${postsText}

JSON 형식으로 응답:
{
  "items": [
    {
      "index": 0,
      "summary_kr": "포스트의 핵심 내용 한국어 요약 1-2문장",
      "analysis": "이 포스트의 의미/영향 분석 2-3문장",
      "relevance": "high|medium|low",
      "tags": ["태그1", "태그2"]
    }
  ],
  "overall": {
    "summary_kr": "오늘 X 포스트 전체 요약 1-2문장",
    "jarvis_take": "자비스의 종합 의견 2-3문장"
  }
}

참고: RT는 원문 맥락 포함하여 분석. 영어 포스트는 한국어로 번역 요약.`,
    { maxTokens: 6144 }
  );

  if (result) {
    for (const item of (result.items || [])) {
      const post = data.posts[item.index];
      if (post) {
        post.summary_kr = item.summary_kr;
        post.analysis = item.analysis;
        post.relevance = item.relevance;
        post.tags = item.tags;
      }
    }
    if (result.overall) {
      data.analysis = result.overall;
    }
    writeJSON('x.json', data);
  }
  return data;
}

// ─── 4. HackerNews Analysis ───

async function analyzeHN(data) {
  if (!data || !data.posts || data.posts.length === 0) return data;
  if (data.posts[0]?.summary_kr || data.analysis) {
    console.log('  hn: already analyzed, skipping');
    return data;
  }

  console.log(`  hn: ${data.posts.length} posts`);

  const hnText = data.posts.slice(0, 20).map((p, i) =>
    `[${i}] "${p.title}" (score:${p.score}, comments:${p.comments}) - ${p.url || 'no url'}`
  ).join('\n');

  const result = await callOpenAI(
    SYSTEM_BASE,
    `오늘(${data.date}) 해커뉴스 상위 글을 분석해주세요.

글 목록:
${hnText}

JSON 형식으로 응답:
{
  "items": [
    {
      "index": 0,
      "summary_kr": "글의 핵심 내용 한국어 요약 1-2문장",
      "why_important": "왜 중요한지, 개발자/투자자에게 시사점 1문장",
      "tags": ["태그1", "태그2"]
    }
  ],
  "overall": {
    "summary_kr": "오늘 해커뉴스 트렌드 요약 1-2문장",
    "trends": ["트렌드1", "트렌드2", "트렌드3"],
    "jarvis_take": "자비스의 종합 의견 2-3문장"
  }
}

참고: 기술 용어는 한국어 설명 병기 (예: "MCP(Model Context Protocol)").`,
    { maxTokens: 6144 }
  );

  if (result) {
    for (const item of (result.items || [])) {
      const post = data.posts[item.index];
      if (post) {
        post.summary_kr = item.summary_kr;
        post.why_important = item.why_important;
        post.tags = item.tags;
      }
    }
    if (result.overall) {
      data.analysis = result.overall;
    }
    writeJSON('hn.json', data);
  }
  return data;
}

// ─── 5. Stock News Analysis ───

async function analyzeStockNews(data) {
  if (!data || !data.articles || data.articles.length === 0) return data;
  if (data.articles[0]?.summary_kr || data.analysis) {
    console.log('  stock-news: already analyzed, skipping');
    return data;
  }

  console.log(`  stock-news: ${data.articles.length} articles`);

  const articlesText = data.articles.slice(0, 20).map((a, i) =>
    `[${i}] [${a.symbol}] ${a.title} (${a.source || 'unknown'})`
  ).join('\n');

  const result = await callOpenAI(
    SYSTEM_BASE,
    `오늘(${data.date}) 종목 뉴스를 분석해주세요.

기사 목록:
${articlesText}

JSON 형식으로 응답:
{
  "items": [
    {
      "index": 0,
      "summary_kr": "한국어 1-2문장 요약",
      "impact": "positive|negative|neutral",
      "analysis": "해당 종목에 미치는 영향 분석 1-2문장"
    }
  ],
  "overall": {
    "summary_kr": "오늘 종목 뉴스 전체 요약 1-2문장",
    "jarvis_take": "자비스의 종합 의견 2-3문장"
  }
}`,
    { maxTokens: 6144 }
  );

  if (result) {
    for (const item of (result.items || [])) {
      const article = data.articles[item.index];
      if (article) {
        article.summary_kr = item.summary_kr;
        article.impact = item.impact;
        article.analysis = item.analysis;
      }
    }
    if (result.overall) {
      data.analysis = result.overall;
    }
    writeJSON('stock-news.json', data);
  }
  return data;
}

// ─── 6. Structured Briefing (AM/PM JSON) ───

async function generateBriefingJSON(marketData, newsData, xData, hnData, stockNewsData, period) {
  const filename = `briefing-${period}.json`;
  if (fs.existsSync(path.join(dateDir, filename))) {
    const existing = readJSON(filename);
    if (existing && existing.tldr) {
      console.log(`  ${filename}: already exists, skipping`);
      return existing;
    }
  }

  const hasData = marketData?.quotes?.length || newsData?.us?.length || xData?.posts?.length || hnData?.posts?.length;
  if (!hasData) {
    console.log(`  ${filename}: no data to summarize`);
    return null;
  }

  console.log(`  ${filename}: generating...`);

  const context = [];

  if (marketData?.analysis) {
    context.push(`[시장] ${marketData.analysis.summary_kr}`);
    if (marketData.analysis.key_points) {
      context.push(`주요 포인트: ${marketData.analysis.key_points.join(', ')}`);
    }
  }

  if (newsData?.analysis) {
    context.push(`[뉴스] ${newsData.analysis.summary_kr}`);
    if (newsData.analysis.top_themes) {
      context.push(`핵심 테마: ${newsData.analysis.top_themes.join(', ')}`);
    }
  }

  const topNews = [...(newsData?.us || []), ...(newsData?.kr || [])]
    .filter(n => n.relevance === 'high' || n.summary_kr)
    .slice(0, 10)
    .map(n => `- ${n.summary_kr || n.title}`);
  if (topNews.length) context.push(`[핵심 뉴스]\n${topNews.join('\n')}`);

  if (xData?.analysis) {
    context.push(`[X] ${xData.analysis.summary_kr}`);
  }

  const topX = (xData?.posts || [])
    .filter(p => p.summary_kr)
    .slice(0, 5)
    .map(p => `- @${p.username}: ${p.summary_kr}`);
  if (topX.length) context.push(`[주요 X 포스트]\n${topX.join('\n')}`);

  if (hnData?.analysis) {
    context.push(`[해커뉴스] ${hnData.analysis.summary_kr}`);
  }

  if (stockNewsData?.analysis) {
    context.push(`[종목뉴스] ${stockNewsData.analysis.summary_kr}`);
  }

  const result = await callOpenAI(
    SYSTEM_BASE + `\n\n당신은 지금 ${period === 'am' ? '오전(AM)' : '오후(PM)'} 브리핑을 작성합니다.
TL;DR은 가장 핵심적인 3-5개 항목만. 간결하고 임팩트 있게.
sections는 데이터가 있는 카테고리만 포함합니다.`,
    `오늘(${targetDate}) ${period.toUpperCase()} 브리핑을 구조화된 JSON으로 생성해주세요.

분석된 데이터:
${context.join('\n\n')}

JSON 형식:
{
  "date": "${targetDate}",
  "period": "${period}",
  "tldr": ["핵심 사항 1", "핵심 사항 2", "핵심 사항 3"],
  "sections": [
    {
      "title": "섹션 제목",
      "category": "market|news|x|dev|hn|stock",
      "items": [
        {
          "headline": "한 줄 제목",
          "detail": "상세 설명 1-2문장",
          "source": "@계정 또는 출처",
          "sentiment": "bullish|bearish|neutral"
        }
      ]
    }
  ],
  "jarvis_take": "자비스의 오늘 하루 종합 관점 2-3문장",
  "generated_at": "${new Date().toISOString()}"
}

섹션 순서: 시장 → X/Elon → 뉴스 → 종목뉴스 → 해커뉴스/Dev`,
    { maxTokens: 6144 }
  );

  if (result) {
    result.date = targetDate;
    result.period = period;
    result.generated_at = result.generated_at || new Date().toISOString();
    writeJSON(filename, result);
  }
  return result;
}

// ─── Main ───

async function main() {
  console.log(`\n╔══════════════════════════════════════╗`);
  console.log(`║  JJ News — 자비스 분석 파이프라인 v2  ║`);
  console.log(`╚══════════════════════════════════════╝`);
  console.log(`Date: ${targetDate}`);
  console.log(`Model: ${MODEL}`);
  console.log(`Dir: ${dateDir}`);
  if (DRY_RUN) console.log('⚠️  DRY RUN MODE');
  console.log('');

  if (!fs.existsSync(dateDir)) {
    console.error(`ERROR: Directory not found: ${dateDir}`);
    process.exit(1);
  }

  let market = readJSON('market.json');
  let news = readJSON('news.json');
  let x = readJSON('x.json');
  let hn = readJSON('hn.json');
  let stockNews = readJSON('stock-news.json');

  const stats = {
    market: market?.quotes?.length || 0,
    news_us: news?.us?.length || 0,
    news_kr: news?.kr?.length || 0,
    x: x?.posts?.length || 0,
    hn: hn?.posts?.length || 0,
    stock_news: stockNews?.articles?.length || 0
  };
  console.log('Raw data:', JSON.stringify(stats));
  console.log('');

  const totalItems = Object.values(stats).reduce((a, b) => a + b, 0);
  if (totalItems === 0) {
    console.log('No data to analyze. Exiting.');
    process.exit(0);
  }

  // ─── Analyze each data type ───
  console.log('▶ Analyzing market...');
  market = await analyzeMarket(market);

  console.log('▶ Analyzing news...');
  news = await analyzeNews(news);

  console.log('▶ Analyzing X posts...');
  x = await analyzeX(x);

  console.log('▶ Analyzing HackerNews...');
  hn = await analyzeHN(hn);

  console.log('▶ Analyzing stock news...');
  stockNews = await analyzeStockNews(stockNews);

  const hour = new Date().getHours();
  const period = hour < 12 ? 'am' : 'pm';

  console.log(`\n▶ Generating ${period.toUpperCase()} briefing JSON...`);
  await generateBriefingJSON(market, news, x, hn, stockNews, period);

  // ─── Summary ───
  console.log('\n✅ Analysis complete!');
  console.log(`   Date: ${targetDate}`);
  console.log(`   Market analysis: ${market?.analysis ? '✓' : '✗'}`);
  console.log(`   News analysis: ${news?.analysis ? '✓' : '✗'}`);
  console.log(`   X analysis: ${x?.analysis ? '✓' : '✗'}`);
  console.log(`   HN analysis: ${hn?.analysis ? '✓' : '✗'}`);
  console.log(`   Stock news analysis: ${stockNews?.analysis ? '✓' : '✗'}`);
  console.log(`   Briefing JSON: ${fs.existsSync(path.join(dateDir, `briefing-${period}.json`)) ? '✓' : '✗'}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

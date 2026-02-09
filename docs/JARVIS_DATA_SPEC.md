# JJ News — 자비스 데이터 스펙 v2

> 자비스가 data.jinkojoon.com에 데이터를 push할 때 따라야 할 JSON 형식 정의서

---

## 개요

자비스는 매일 데이터를 수집하고, **분석/요약/의견**을 추가하여 GitHub에 push합니다.
push하면 Vercel이 자동으로 빌드/배포합니다.

### 파이프라인

```
자비스 데이터 수집 → 분석/요약 생성 → JSON 파일 저장 → git push
→ GitHub → Vercel 자동 빌드 → data.jinkojoon.com 반영
```

### 파일 구조

```
data/
├── 2026-02-08/              # 일별 데이터
│   ├── market.json          # 시장 데이터 + 분석
│   ├── news.json            # 뉴스 + 한국어 요약/분석
│   ├── x.json               # X 포스트 + 요약/분석
│   ├── hn.json              # 해커뉴스 + 한국어 요약
│   ├── stock-news.json      # 종목 뉴스 + 요약/영향도
│   ├── briefing-am.html     # AM 브리핑 (기존 HTML)
│   ├── briefing-pm.html     # PM 브리핑 (기존 HTML)
│   ├── briefing-am.json     # AM 브리핑 (구조화된 JSON) ★ NEW
│   └── briefing-pm.json     # PM 브리핑 (구조화된 JSON) ★ NEW
├── weekly/
│   └── 2026-W06.json        # 주간 브리핑 ★ NEW
└── monthly/
    └── 2026-02.json         # 월간 브리핑 ★ NEW
```

---

## 공통 규칙

### 하위 호환

모든 v2 필드는 **선택(optional)**입니다. 없으면 홈페이지에서 해당 섹션이 안 보일 뿐 에러 없음.
기존 v1 형식 JSON도 정상 동작합니다.

### 값 규칙

| 필드 | 허용 값 |
|------|---------|
| `sentiment` | `"bullish"`, `"bearish"`, `"neutral"` |
| `relevance` | `"high"`, `"medium"`, `"low"` |
| `impact` | `"positive"`, `"negative"`, `"neutral"` |
| 날짜 | ISO 형식: `"2026-02-08"` |
| 주차 | ISO 주차: `"2026-W06"` |
| 월 | `"2026-02"` |

### 한국어 텍스트

- 모든 `summary_kr`, `analysis`, `jarvis_take`는 **한국어**로 작성
- HTML entity 사용 금지 (`&lsquo;` 등) — 유니코드 직접 사용
- 간결하게: 요약은 1-2문장, 분석은 2-3문장

---

## 일별 데이터

### market.json

```json
{
  "date": "2026-02-08",
  "quotes": [
    {
      "symbol": "AAPL",
      "name": "Apple",
      "category": "tech",
      "price": 278.12,
      "change_percent": 0.8,
      "volume": 50050812,
      "captured_at": "2026-02-08 15:01:11"
    }
  ],
  "analysis": {
    "summary_kr": "미국 증시 전반 강세 마감. 기술주 중심 반등하며 S&P 500 +1.97%.",
    "sentiment": "bullish",
    "key_drivers": ["기술주 반등", "고용지표 호조", "AMZN 실적 실망"],
    "key_points": ["S&P 500 +1.97%, 나스닥 +2.18%", "COIN +13% 최대 상승"],
    "outlook": "다음 주 CPI 발표 앞두고 변동성 확대 예상",
    "market_mood": "낙관적이나 실적 시즌 경계감 공존",
    "jarvis_take": "전반적으로 긍정적이나, AMZN 급락은 빅테크 실적에 대한 높은 기대치를 보여줌."
  }
}
```

`analysis` 필드 설명:
- `summary_kr`: 시장 전체 요약 (1-2문장)
- `sentiment`: 전체 시장 방향
- `key_drivers`: 핵심 동인 (배열)
- `key_points`: 주요 포인트 (배열, 홈페이지 TL;DR에 사용)
- `outlook`: 향후 전망
- `market_mood`: 시장 분위기 한 줄
- `jarvis_take`: 자비스의 개인 의견/관점

---

### news.json

```json
{
  "date": "2026-02-08",
  "us": [
    {
      "title": "Bitcoin loses Trump-era gains...",
      "url": "https://...",
      "snippet": null,
      "source": "reuters.com",
      "category": "crypto_market",
      "fetched_at": "2026-02-08T15:03:29.221Z",
      "summary_kr": "비트코인이 트럼프 시대 상승분을 모두 반납. 크립토 변동성이 불확실성 시사.",
      "analysis": "단기 조정이지만 ETF 유입량 감소가 더 우려됨. 규제 명확성 확보 전까지 횡보 예상.",
      "sentiment": "bearish",
      "relevance": "high",
      "tags": ["crypto", "bitcoin", "regulation"]
    }
  ],
  "kr": [
    {
      "title": "레버리지 ETF에 뛰어드는 개미들...일주일간 7000억 '사자'",
      "url": "https://...",
      "source": "한국경제",
      "category": "finance_main",
      "published_at": "2026-02-08T09:30:00Z",
      "summary_kr": "개인투자자들이 레버리지 ETF에 일주일간 7000억원을 순매수. 위험 선호 심리 확대.",
      "analysis": "레버리지 ETF 쏠림은 과거에도 시장 과열 신호였음. 주의 필요.",
      "sentiment": "neutral",
      "relevance": "medium",
      "tags": ["ETF", "개인투자자", "레버리지"]
    }
  ],
  "analysis": {
    "summary_kr": "글로벌 뉴스의 핵심은 AI 도구 경쟁 본격화와 크립토 조정.",
    "top_themes": ["AI 에이전트 도구 경쟁", "비트코인 조정", "빅테크 실적 분화"],
    "jarvis_take": "AI 관련 뉴스가 압도적. 크립토는 단기 조정이지만 장기 방향성은 유효."
  }
}
```

항목별 v2 필드:
- `summary_kr`: 해당 기사의 한국어 1-2문장 요약
- `analysis`: 자비스의 분석/의견 (2-3문장)
- `sentiment`: 해당 기사의 시장 영향 방향
- `relevance`: 중요도 (`high`=핵심, `medium`=참고, `low`=배경)
- `tags`: 관련 키워드 (검색/분류용)

---

### x.json

```json
{
  "date": "2026-02-08",
  "posts": [
    {
      "id": "2020202496547844312",
      "username": "elonmusk",
      "text": "True. Once the solar energy generation...",
      "created_at": "2026-02-07T18:26:23.000Z",
      "source_type": "elon_tweets",
      "like_count": 51753,
      "retweet_count": 6370,
      "url": null,
      "summary_kr": "태양광 에너지 → 로봇 제조 → 칩 제작 → AI의 순환 루프가 닫히면 기존 화폐는 마찰이 될 것. 와트와 톤만이 중요해질 것이라는 주장.",
      "analysis": "에너지-AI 순환론은 장기적으로 유효한 관점. 다만 화폐 대체 시나리오는 극단적. 테슬라의 에너지 사업 확장과 연결지어 봐야 함.",
      "relevance": "high",
      "tags": ["에너지", "AI", "테슬라"]
    }
  ],
  "analysis": {
    "summary_kr": "일론 머스크가 에너지-AI 루프와 화폐의 미래에 대한 견해를 밝힘.",
    "jarvis_take": "거시적 관점은 흥미롭지만 실현까지 상당한 시간 필요. 테슬라 투자자에겐 장기 비전 확인 신호."
  }
}
```

---

### hn.json

```json
{
  "date": "2026-02-08",
  "posts": [
    {
      "id": 46924426,
      "title": "Software factories and the agentic moment",
      "url": "https://factory.strongdm.ai/",
      "score": 162,
      "author": "mellosouls",
      "comments": 319,
      "posted_at": "2026-02-07 15:05:56",
      "summary_kr": "소프트웨어 팩토리와 에이전트 시대의 도래에 대한 분석. 에이전트 기반 개발이 소프트웨어 생산의 패러다임을 바꿀 것이라는 주장.",
      "why_important": "AI 에이전트가 '도구'에서 '생산 시스템'으로 진화하는 트렌드의 핵심 글.",
      "tags": ["AI", "에이전트", "소프트웨어개발"]
    }
  ],
  "analysis": {
    "summary_kr": "해커뉴스에서 AI 에이전트/도구 관련 글이 상위권을 독차지.",
    "trends": ["AI 에이전트 도구화", "개발자 생산성", "AI 슬롭 우려"],
    "jarvis_take": "에이전트 관련 논의가 주류가 된 것 자체가 기술 패러다임 전환의 신호."
  }
}
```

---

### stock-news.json

```json
{
  "date": "2026-02-08",
  "articles": [
    {
      "symbol": "PLTR",
      "title": "Why Palantir Technologies (PLTR) Is Down 7.3%...",
      "url": "https://...",
      "source": "Simply Wall St.",
      "summary": null,
      "published_at": "2026-02-08T12:07:11.000Z",
      "summary_kr": "Palantir가 AI 도입 확대와 Cognizant 파트너십에도 -7.3% 하락. 밸류에이션 부담이 원인.",
      "impact": "negative",
      "analysis": "AI 수요는 확실하지만 P/E 200배 이상의 밸류에이션은 실적 서프라이즈 없이 유지 어려움."
    }
  ],
  "analysis": {
    "summary_kr": "종목별 뉴스는 AI 관련 종목(PLTR, AMD, NVDA)에 집중.",
    "jarvis_take": "AI 종목들의 밸류에이션이 부담스러운 구간. 선별적 접근 필요."
  }
}
```

---

### briefing-am.json / briefing-pm.json (신규)

기존 HTML 브리핑과 **별도로** 구조화된 JSON 브리핑을 생성합니다.

```json
{
  "date": "2026-02-08",
  "period": "am",
  "tldr": [
    "Elon: 에너지→로봇→칩→AI 루프 완성 시 기존 화폐는 마찰이 될 것",
    "Claude Code 릴리즈 관련 글 다수 — 에이전트 워크플로우 전환 신호",
    "미국장 강세 마감: COIN +13%, AMD +8%, NVDA +8% / AMZN -5.5%"
  ],
  "sections": [
    {
      "title": "X / Elon",
      "category": "x",
      "items": [
        {
          "headline": "에너지→AI 루프 닫히면 기존 화폐는 마찰",
          "detail": "태양광 → 로봇 → 칩 → AI 순환 루프 완성 시 달러보다 와트와 톤이 중요해질 것이라는 주장.",
          "source": "@elonmusk",
          "url": "https://x.com/elonmusk/status/...",
          "sentiment": "neutral"
        }
      ]
    },
    {
      "title": "시장 동향",
      "category": "market",
      "items": [
        {
          "headline": "미 증시 전반 강세, 기술주 반등",
          "detail": "S&P 500 +1.97%, 나스닥 +2.18%. COIN +13% 최대 상승, AMZN -5.55% 급락.",
          "sentiment": "bullish"
        }
      ]
    },
    {
      "title": "뉴스 하이라이트",
      "category": "news",
      "items": [...]
    },
    {
      "title": "Dev / Tech",
      "category": "dev",
      "items": [...]
    },
    {
      "title": "해커뉴스",
      "category": "hn",
      "items": [...]
    }
  ],
  "jarvis_take": "기술주 반등은 긍정적이나 AMZN 급락에서 보듯 실적 기대치가 매우 높음. AI 에이전트 워크플로우가 메인스트림 진입하는 신호가 뚜렷함.",
  "generated_at": "2026-02-08T06:00:00Z"
}
```

`sections` 카테고리 값: `"x"`, `"market"`, `"news"`, `"dev"`, `"hn"`, `"stock"`, `"crypto"`
자비스가 섹션을 자유롭게 추가/제거 가능. 홈페이지는 있는 섹션만 표시.

---

## 주간 브리핑 (신규)

파일: `data/weekly/2026-W06.json`

매주 일요일 또는 월요일에 자비스가 지난 주를 분석하여 생성.

```json
{
  "week": "2026-W06",
  "date_range": { "start": "2026-02-03", "end": "2026-02-09" },
  "title": "AI 에이전트 본격화 & 빅테크 실적 분화",
  "summary_kr": "이번 주는 AI 에이전트 도구들의 시장 진입과 빅테크 실적 분화가 핵심 테마...",
  "key_events": [
    {
      "title": "Claude Code Fast Mode 출시",
      "detail": "Anthropic이 개발자 생산성 도구 경쟁 본격화",
      "category": "dev",
      "date": "2026-02-07"
    }
  ],
  "market_recap": {
    "best_performers": [
      { "symbol": "COIN", "change_percent": 13.0 }
    ],
    "worst_performers": [
      { "symbol": "AMZN", "change_percent": -5.55 }
    ]
  },
  "top_themes": ["AI 에이전트 도구 경쟁", "빅테크 실적 분화", "크립토 변동성"],
  "analysis": "AI 에이전트가 프로토타입에서 프로덕션으로 전환되는 신호가 명확...",
  "outlook": "다음 주 CPI 발표가 최대 변수...",
  "jarvis_take": "AI 에이전트 생태계가 빠르게 성숙하고 있어 관련 종목에 관심 유지 필요...",
  "generated_at": "2026-02-09T18:00:00Z"
}
```

---

## 월간 브리핑 (신규)

파일: `data/monthly/2026-02.json`

매월 말에 자비스가 해당 월을 분석하여 생성.

```json
{
  "month": "2026-02",
  "title": "AI 에이전트 시대 개막 & 크립토 조정",
  "summary_kr": "2월은 AI 에이전트 도구들의 메인스트림 진입이 가장 큰 테마...",
  "key_themes": ["AI 에이전트 메인스트림 진입", "빅테크 실적 분화", "크립토 조정"],
  "market_recap": {
    "start_values": { "^GSPC": 6800.00, "^IXIC": 22500.00 },
    "end_values": { "^GSPC": 6932.30, "^IXIC": 23031.21 },
    "monthly_change": { "^GSPC": 1.94, "^IXIC": 2.36 }
  },
  "notable_events": [
    {
      "date": "2026-02-07",
      "title": "Claude Code Fast Mode",
      "detail": "Anthropic이 Claude Code에 빠른 모드를 추가"
    }
  ],
  "analysis": "AI 도구 생태계의 성숙이 가속화되면서 패러다임이 변화 중...",
  "outlook": "3월에는 AI 컨퍼런스와 신제품 발표 예정...",
  "jarvis_take": "AI 에이전트가 '도구'에서 '동료'로 진화하는 과정에 있음...",
  "generated_at": "2026-02-28T18:00:00Z"
}
```

---

## 자비스 구현 가이드

### 우선순위

| 순위 | 작업 | 설명 |
|------|------|------|
| 1 | 기존 데이터에 v2 필드 추가 | `summary_kr` + `analysis` + `sentiment` + `relevance` |
| 2 | `briefing-am.json` 생성 | HTML 브리핑 생성 시 JSON도 함께 생성 |
| 3 | 주간 브리핑 생성 | 매주 일요일 저녁, 그 주의 데이터 종합 분석 |
| 4 | 월간 브리핑 생성 | 매월 말일, 해당 월 종합 분석 |

### export-daily.js 수정 필요

현재 `scripts/export-daily.js`는 DB에서 로우 데이터만 추출합니다.
v2에서는 자비스가 **브리핑 생성 시점에** 분석 필드를 함께 생성하고 JSON에 포함해야 합니다.

방법 2가지:
1. 자비스가 브리핑 생성 시 각 항목의 분석도 함께 생성 → DB에 저장 → export가 포함
2. export-daily.js가 추출 후 자비스가 별도 "분석 패스"를 돌려서 필드 추가

**방법 1 권장** — 브리핑 생성과 데이터 분석을 하나의 프로세스로 통합.

### Cron 스케줄 제안

```
# 기존 (유지)
10 7,18 * * *   push-data.sh       # AM/PM 브리핑 발송 후 10분에 push

# 신규 추가
0 22 * * 0      push-weekly.sh     # 매주 일요일 22시에 주간 브리핑 push
0 23 1 * *      push-monthly.sh    # 매월 1일 23시에 월간 브리핑 push
```

---

## 참고: 현재 vs 목표 비교

| 항목 | 현재 (v1) | 목표 (v2) |
|------|-----------|-----------|
| market.json | 종가/변동률만 | + 시장 분석, 드라이버, 전망, 자비스 의견 |
| news.json | 제목/URL만 | + 한국어 요약, 분석, 감성, 중요도, 태그 |
| x.json | 원문만 | + 한국어 요약, 분석, 중요도 |
| hn.json | 제목/점수만 | + 한국어 요약, 왜 중요한지 |
| stock-news.json | 제목/URL만 | + 한국어 요약, 영향도, 분석 |
| briefing JSON | 없음 | 구조화된 TL;DR + 섹션별 정리 |
| 주간 브리핑 | 없음 | 주간 종합 분석 + 전망 |
| 월간 브리핑 | 없음 | 월간 종합 분석 + 전망 |

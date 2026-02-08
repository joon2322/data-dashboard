#!/usr/bin/env node
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const DB_PATH = process.env.BRIEFING_DB || '/home/moltbot/clawd/briefing_collect/briefing.db';
const COMPILED_DIR = process.env.COMPILED_DIR || '/home/moltbot/clawd/briefing_collect/compiled';
const OUTPUT_DIR = process.env.OUTPUT_DIR || '/home/moltbot/data-dashboard/data';

const targetDate = process.argv[2] || new Date().toISOString().split('T')[0];

function exportDay(db, date) {
    const dir = path.join(OUTPUT_DIR, date);
    fs.mkdirSync(dir, { recursive: true });

    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    const nextDateStr = nextDate.toISOString().split('T')[0];

    const market = db.prepare(`
        SELECT symbol, price, change_percent, volume, market_cap, captured_at
        FROM stock_quotes WHERE captured_at >= ? AND captured_at < ?
        ORDER BY captured_at DESC
    `).all(date, nextDateStr);

    const latestBySymbol = {};
    for (const q of market) {
        if (!latestBySymbol[q.symbol]) latestBySymbol[q.symbol] = q;
    }

    const watchlist = db.prepare('SELECT symbol, name, category FROM watchlist').all();
    fs.writeFileSync(path.join(dir, 'market.json'), JSON.stringify({
        date,
        quotes: watchlist.map(w => {
            const q = latestBySymbol[w.symbol];
            return {
                symbol: w.symbol, name: w.name, category: w.category,
                price: q ? q.price : null,
                change_percent: q ? q.change_percent : null,
                volume: q ? q.volume : null,
                captured_at: q ? q.captured_at : null
            };
        })
    }, null, 2));

    const newsUs = db.prepare(`
        SELECT title, url, one_line as snippet, source, category, fetched_at
        FROM news_items WHERE region = 'us' AND inserted_at >= ? AND inserted_at < ?
        ORDER BY inserted_at DESC LIMIT 30
    `).all(date, nextDateStr);

    const newsKrNaver = db.prepare(`
        SELECT title, url, source, category, published_at
        FROM naver_news WHERE inserted_at >= ? AND inserted_at < ?
        ORDER BY inserted_at DESC LIMIT 30
    `).all(date, nextDateStr);

    const newsKrGeneral = db.prepare(`
        SELECT title, url, one_line as snippet, source, category, fetched_at
        FROM news_items WHERE region = 'kr' AND inserted_at >= ? AND inserted_at < ?
        ORDER BY inserted_at DESC LIMIT 20
    `).all(date, nextDateStr);

    fs.writeFileSync(path.join(dir, 'news.json'), JSON.stringify({
        date, us: newsUs, kr: [...newsKrNaver, ...newsKrGeneral]
    }, null, 2));

    const xPosts = db.prepare(`
        SELECT id, username, text, created_at, source_type, like_count, retweet_count, url
        FROM x_posts WHERE inserted_at >= ? AND inserted_at < ?
        ORDER BY like_count DESC LIMIT 30
    `).all(date, nextDateStr);
    fs.writeFileSync(path.join(dir, 'x.json'), JSON.stringify({ date, posts: xPosts }, null, 2));

    const hn = db.prepare(`
        SELECT id, title, url, score, author, comments, datetime(post_time, 'unixepoch') as posted_at
        FROM hn_posts WHERE inserted_at >= ? AND inserted_at < ?
        ORDER BY score DESC LIMIT 30
    `).all(date, nextDateStr);
    fs.writeFileSync(path.join(dir, 'hn.json'), JSON.stringify({ date, posts: hn }, null, 2));

    const stockNews = db.prepare(`
        SELECT symbol, title, url, source, summary, published_at
        FROM stock_news WHERE inserted_at >= ? AND inserted_at < ?
        ORDER BY inserted_at DESC LIMIT 30
    `).all(date, nextDateStr);
    fs.writeFileSync(path.join(dir, 'stock-news.json'), JSON.stringify({ date, articles: stockNews }, null, 2));

    const amPath = path.join(COMPILED_DIR, `AM_${date}.html`);
    const pmPath = path.join(COMPILED_DIR, `PM_${date}.html`);
    if (fs.existsSync(amPath)) fs.copyFileSync(amPath, path.join(dir, 'briefing-am.html'));
    if (fs.existsSync(pmPath)) fs.copyFileSync(pmPath, path.join(dir, 'briefing-pm.html'));

    const counts = {
        market: Object.keys(latestBySymbol).length,
        news_us: newsUs.length,
        news_kr: newsKrNaver.length + newsKrGeneral.length,
        x: xPosts.length,
        hn: hn.length,
        stock_news: stockNews.length,
        briefing_am: fs.existsSync(amPath),
        briefing_pm: fs.existsSync(pmPath)
    };
    console.log(`${date}:`, JSON.stringify(counts));
    return counts;
}

const db = new Database(DB_PATH);
try {
    exportDay(db, targetDate);
} finally {
    db.close();
}

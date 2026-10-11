#!/usr/bin/env node
/**
 * build-book.mjs — 把 Enterprise_Agent_Engineering 的 13 个 Part 生成博客可读的多页站点。
 *
 * 用法：
 *   node tools/build-book.mjs --parts=0      # 只渲染样张 part-00
 *   node tools/build-book.mjs --parts=0,1    # 渲染指定几个 Part
 *   node tools/build-book.mjs --all          # 全量渲染 13 个 Part + 落地文章
 *
 * 产出：public/book/enterprise-agent-engineering/
 *   index.html · part-00..12.html · assets/book.css · assets/nav.js
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { createHighlighter } from 'shiki';

const require = createRequire('C:/Users/Qianchang/.workbuddy/binaries/node/workspace/');
const MarkdownIt = require('markdown-it');

const SRC = 'C:/Users/Qianchang/Desktop/Enterprise_Agent_Engineering_Part0-12_Final_Candidate_v0.4/Enterprise_Agent_Engineering_Part0-12_Final_Candidate_v0.4';
const SITE = 'D:/olivercqc.github.io';
const OUT = path.join(SITE, 'public/book/enterprise-agent-engineering');
const PUBLIC_URL = '/book/enterprise-agent-engineering/';

const BOOK_TITLE = 'Enterprise Agent Engineering';
const BOOK_SUBTITLE = '企业级 Agent 工程';
const VERSION = 'v0.4';

const LANGS = ['text', 'python', 'bash', 'json', 'http', 'sql', 'yaml', 'powershell', 'markdown', 'diff', 'sh', 'shell'];

// 阅读地图：按依赖顺序分组
const MAP = [
  { title: '起步：先判断，再动手', from: 0, to: 1, note: '拿到需求先问「到底需不需要 Agent」，再把 LLM 当成一个有契约的软件组件。' },
  { title: '构造输入与能力边界', from: 2, to: 4, note: 'Context / Tools & Harness / RAG & Memory —— 决定模型能看到什么、能做什么、记得住什么。' },
  { title: '架构抉择与验证', from: 5, to: 6, note: 'Workflow 还是 Agent；以及如何从「看起来不错」走到「有证据证明」。' },
  { title: '上线与进阶', from: 7, to: 8, note: '让 Agent 敢上线，以及当简单 Agent 不够用时的进阶模式。' },
  { title: '专项：编码、多智能体与演化', from: 9, to: 11, note: 'Coding Agent、Multi-Agent 编排，以及让 Agent 持续变好。' },
  { title: '收束：迁移到新领域', from: 12, to: 12, note: '把前面建立的可迁移工程判断，用到陌生领域。' },
];

// 各 Part 的一句话简介（取自正文 H1 副题，忠实原文）
const BLURBS = {
  0: '先判断一件事：这个问题到底需不需要 Agent。',
  1: '把 LLM 当成一个真正的软件组件，明确调用的边界与契约。',
  2: 'Context Engineering —— 决定模型每次决策到底能看到什么。',
  3: 'Tools 与 Agent Harness —— 让模型在受控边界内与真实世界交互。',
  4: 'RAG 与 Memory —— 让 Agent 获得知识，并记住真正值得记住的东西。',
  5: 'Workflow → Agent —— 什么时候真的需要 Agent，控制权该交给谁。',
  6: 'Evaluation Engineering —— 从「看起来不错」到「有证据证明」。',
  7: 'Production Agent Engineering —— 让能跑的 Agent 变成敢上线的 Agent。',
  8: 'Advanced Agent Patterns —— 当简单 Agent 已经不够用。',
  9: 'Coding Agent —— 让 Agent 真正参与软件开发。',
  10: 'Multi-Agent Engineering —— 当一个 Agent 不再够用。',
  11: 'Agent Evolution —— 让 Agent 不只是上线，而是持续变好。',
  12: 'Agent Application Architecture —— 把工程能力迁移到陌生领域。',
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function makeId(text, idx, used) {
  const m = String(text).match(/^(\d+(?:\.\d+)*)[\s、．.]/);
  let base;
  if (m) {
    base = 'sec-' + m[1].replace(/\./g, '-');
  } else {
    const latin = String(text).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    base = latin ? 'sec-' + latin.slice(0, 40) : 'sec-x' + idx;
  }
  let id = base, n = 2;
  while (used.has(id)) id = base + '-' + n++;
  used.add(id);
  return id;
}

function scanParts() {
  const files = fs.readdirSync(SRC).filter((f) => /^Part_(\d+)_Manuscript_.*\.md$/.test(f));
  return files
    .map((f) => {
      const num = Number(f.match(/^Part_(\d+)_/)[1]);
      return { num, file: f, raw: fs.readFileSync(path.join(SRC, f), 'utf8') };
    })
    .sort((a, b) => a.num - b.num)
    .map((p) => {
      const h1 = (p.raw.match(/^#\s+(.+)$/m) || [, 'Part ' + p.num])[1].trim();
      const parts = h1.split(/[｜|]/);
      const name = parts.length > 1 ? parts.slice(1).join('｜').trim() : h1;
      return { ...p, h1, name, label: 'Part ' + p.num, slug: 'part-' + String(p.num).padStart(2, '0') };
    });
}

let highlighter;
function highlight(code, lang) {
  let l = (lang || '').trim().toLowerCase();
  if (!l) l = 'text';
  if (l === 'plaintext') l = 'text';
  const loaded = highlighter.getLoadedLanguages();
  if (!loaded.includes(l)) l = 'text';
  try {
    return highlighter.codeToHtml(code, { lang: l, theme: 'github-light' });
  } catch {
    return '<pre class="shiki fallback"><code>' + esc(code) + '</code></pre>';
  }
}

function renderPart(md, raw) {
  const tokens = md.parse(raw, {});
  const used = new Set();
  const toc = [];
  let idx = 0;
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.type !== 'heading_open') continue;
    const level = Number(t.tag.slice(1));
    const inline = tokens[i + 1];
    const text = inline && inline.type === 'inline' ? inline.content : '';
    idx++;
    if (level === 1) continue;
    const id = makeId(text, idx, used);
    t.attrSet('id', id);
    if (level === 2 || level === 3) toc.push({ level, text, id });
  }
  const html = md.renderer.render(tokens, md.options, {});
  return { html, toc };
}

function buildSidebar(parts, activeNum) {
  const items = parts.map((p) => {
    const isActive = p.num === activeNum;
    let s = '<li class="part' + (isActive ? ' is-active' : '') + '">';
    s += '<a class="part-link" href="' + p.slug + '.html">'
      + '<span class="part-no">' + p.num + '</span>'
      + '<span class="part-name">' + esc(p.name) + '</span></a>';
    if (isActive && p.toc && p.toc.length) {
      s += '<ul class="secs">';
      for (const h of p.toc) {
        s += '<li class="lvl' + h.level + '"><a class="sec" href="#' + h.id + '" data-id="' + h.id + '">' + esc(h.text) + '</a></li>';
      }
      s += '</ul>';
    }
    s += '</li>';
    return s;
  }).join('\n');
  return '<nav class="book-nav">'
    + '<div class="book-nav-head"><a class="bn-title" href="index.html">' + esc(BOOK_TITLE) + '</a>'
    + '<span class="bn-ver">' + VERSION + '</span></div>'
    + '<ol class="parts">' + items + '</ol>'
    + '<div class="bn-foot"><a href="index.html">全书目录</a></div>'
    + '</nav>';
}

function topbar() {
  return '<header class="topbar">'
    + '<button class="toc-toggle" id="tocToggle" aria-label="打开目录" aria-controls="sidebar">'
    + '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/></svg>'
    + '</button>'
    + '<a class="brand" href="index.html"><span class="brand-title">' + esc(BOOK_TITLE) + '</span>'
    + '<span class="brand-sub">' + esc(BOOK_SUBTITLE) + '</span></a>'
    + '<span class="ver">' + VERSION + '</span>'
    + '</header>';
}

function buildPartPage(parts, part, bodyHtml, toc) {
  const i = parts.findIndex((p) => p.num === part.num);
  const prev = parts[i - 1], next = parts[i + 1];
  let pager = '<nav class="pager">';
  pager += prev
    ? '<a class="pg prev" href="' + prev.slug + '.html"><span class="pg-dir">上一部分</span><span class="pg-name">' + esc(prev.label + '｜' + prev.name) + '</span></a>'
    : '<span class="pg empty"></span>';
  pager += next
    ? '<a class="pg next" href="' + next.slug + '.html"><span class="pg-dir">下一部分</span><span class="pg-name">' + esc(next.label + '｜' + next.name) + '</span></a>'
    : '<a class="pg next" href="index.html"><span class="pg-dir">已到末尾</span><span class="pg-name">返回全书目录</span></a>';
  pager += '</nav>';

  const title = part.label + '｜' + part.name;
  const desc = (BLURBS[part.num] || part.name) + ' —— ' + BOOK_TITLE + ' ' + VERSION;

  const head = '<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n'
    + '<meta charset="utf-8">\n'
    + '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
    + '<title>' + esc(title) + ' · ' + esc(BOOK_TITLE) + '</title>\n'
    + '<meta name="description" content="' + esc(desc) + '">\n'
    + '<meta property="og:title" content="' + esc(title) + '">\n'
    + '<meta property="og:type" content="article">\n'
    + '<link rel="stylesheet" href="assets/book.css">\n'
    + '</head>\n<body>\n<a class="skip-link" href="#content">跳到正文</a>\n';

  const open = topbar() + '\n<div class="layout">\n'
    + '<aside class="sidebar" id="sidebar">' + buildSidebar(parts, part.num) + '</aside>\n'
    + '<main class="content" id="content">\n'
    + '<article class="prose">\n' + bodyHtml + '\n</article>\n'
    + pager + '\n'
    + '<footer class="book-foot"><span>' + esc(BOOK_TITLE) + '</span><span>' + VERSION + '</span>'
    + '<span>文本校审候选，非出版定稿</span></footer>\n'
    + '</main>\n</div>\n'
    + '<div class="scrim" id="scrim"></div>\n'
    + '<script src="assets/nav.js"></script>\n</body>\n</html>\n';

  return { html: head + open, toc };
}

function buildIndex(parts, stats) {
  const cards = parts.map((p) => {
    return '<a class="card" href="' + p.slug + '.html">'
      + '<div class="card-no">Part ' + p.num + '</div>'
      + '<div class="card-name">' + esc(p.name) + '</div>'
      + '<div class="card-blurb">' + esc(BLURBS[p.num] || '') + '</div>'
      + '<div class="card-meta">' + (p.h2count || 0) + ' 节</div>'
      + '</a>';
  }).join('\n');

  const map = MAP.map((g) => {
    const items = parts.filter((p) => p.num >= g.from && p.num <= g.to)
      .map((p) => '<li><a href="' + p.slug + '.html"><b>Part ' + p.num + '</b> · ' + esc(p.name) + '</a></li>').join('');
    const range = g.from === g.to ? ('Part ' + g.from) : ('Part ' + g.from + '–' + g.to);
    return '<div class="map-group"><div class="map-range">' + range + '</div>'
      + '<h3>' + esc(g.title) + '</h3><p>' + esc(g.note) + '</p><ul>' + items + '</ul></div>';
  }).join('\n');

  return '<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n'
    + '<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n'
    + '<title>' + esc(BOOK_TITLE) + ' · 全书目录</title>\n'
    + '<meta name="description" content="' + esc(BOOK_SUBTITLE + '：13 个部分、' + stats.h2 + ' 个编号章节，从后端工程师到企业级 Agent 工程。') + '">\n'
    + '<link rel="stylesheet" href="assets/book.css">\n'
    + '</head>\n<body class="home">\n'
    + '<header class="topbar home-top"><a class="brand" href="index.html"><span class="brand-title">' + esc(BOOK_TITLE) + '</span>'
    + '<span class="brand-sub">' + esc(BOOK_SUBTITLE) + '</span></a><span class="ver">' + VERSION + '</span></header>\n'
    + '<main class="home">\n'
    + '<section class="hero"><h1>' + esc(BOOK_SUBTITLE) + '</h1>'
    + '<p class="hero-sub">' + esc(BOOK_TITLE) + ' · ' + VERSION + '</p>'
    + '<p class="hero-lead">从「这个问题到底需不需要 Agent」开始，一路走到可评估、可上线、可演化的企业级 Agent 工程。全书按依赖顺序组织：先判断，再构造输入与能力边界，然后做架构抉择与验证，最后上线、进阶并把工程判断迁移到新领域。</p>'
    + '<div class="stats">'
    + '<div class="stat"><b>' + parts.length + '</b><span>个部分</span></div>'
    + '<div class="stat"><b>' + stats.h2 + '</b><span>个编号章节</span></div>'
    + '<div class="stat"><b>' + stats.code.toLocaleString('en-US') + '</b><span>个代码示例</span></div>'
    + '</div>'
    + '<p class="hero-cta"><a class="btn" href="part-00.html">从 Part 0 开始阅读 →</a></p>'
    + '<p class="hero-note">本页为 v0.4 文本校审候选版本，尚未经过独立学习者试用验证。全文为静态页面，支持侧栏目录与逐部分阅读。</p>'
    + '</section>\n'
    + '<section class="map"><h2 class="sec-h">阅读地图</h2><p class="map-lead">各部分存在明确的承接关系，建议按下列顺序推进；已有后端经验的读者可从 Part 1 切入。</p>'
    + '<div class="map-grid">' + map + '</div></section>\n'
    + '<section class="cards-sec"><h2 class="sec-h">全部部分</h2><div class="cards">' + cards + '</div></section>\n'
    + '<footer class="book-foot home-foot"><span>文本结构与一致性机器校验 PASS</span><span>' + VERSION + '</span><span>非独立学习者试用后的出版定稿</span></footer>\n'
    + '</main>\n</body>\n</html>\n';
}

const CSS = `:root{
  --bg:#ffffff; --bg-soft:#f7f8fa; --bg-sunken:#f1f3f6;
  --fg:#1f2328; --fg-muted:#59636e; --fg-faint:#8b949e;
  --border:#d8dee4; --border-soft:#e8ebef;
  --accent:#1f6feb; --accent-soft:#e8f1fd;
  --topbar-h:56px; --sidebar-w:308px;
  --font-sans:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Hiragino Sans GB","Microsoft YaHei","Source Han Sans SC","Noto Sans CJK SC",sans-serif;
  --font-mono:"SFMono-Regular",Consolas,"Liberation Mono",Menlo,monospace;
}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:var(--bg);color:var(--fg);font-family:var(--font-sans);font-size:16px;line-height:1.75;-webkit-font-smoothing:antialiased}
a{color:var(--accent);text-decoration:none}
a:hover{text-decoration:underline}
.skip-link{position:absolute;left:-9999px}
.skip-link:focus{left:12px;top:8px;background:#fff;padding:6px 10px;border:1px solid var(--border);border-radius:6px;z-index:100}
.topbar{position:sticky;top:0;z-index:50;height:var(--topbar-h);display:flex;align-items:center;gap:12px;padding:0 18px;background:rgba(255,255,255,.92);backdrop-filter:saturate(180%) blur(8px);border-bottom:1px solid var(--border-soft)}
.brand{display:flex;align-items:baseline;gap:10px;color:var(--fg)}
.brand:hover{text-decoration:none}
.brand-title{font-weight:600;font-size:15px;letter-spacing:.01em}
.brand-sub{color:var(--fg-faint);font-size:13px}
.topbar .ver{margin-left:auto;font-size:12px;color:var(--fg-faint);border:1px solid var(--border);border-radius:999px;padding:2px 9px}
.toc-toggle{display:none;background:none;border:1px solid var(--border);border-radius:8px;color:var(--fg);width:34px;height:34px;align-items:center;justify-content:center;cursor:pointer}
.layout{display:flex;align-items:flex-start;max-width:1440px;margin:0 auto}
.sidebar{position:sticky;top:var(--topbar-h);height:calc(100vh - var(--topbar-h));overflow-y:auto;flex:0 0 var(--sidebar-w);width:var(--sidebar-w);border-right:1px solid var(--border-soft);padding:18px 12px 80px 18px;background:var(--bg-soft)}
.book-nav-head{display:flex;align-items:center;gap:8px;padding:4px 8px 12px}
.bn-title{font-weight:600;font-size:13.5px;color:var(--fg)}
.bn-ver{font-size:11px;color:var(--fg-faint);border:1px solid var(--border);border-radius:999px;padding:1px 7px}
.parts{list-style:none;margin:0;padding:0}
.part{margin:1px 0}
.part-link{display:flex;gap:9px;align-items:flex-start;padding:7px 9px;border-radius:8px;color:var(--fg-muted);font-size:14px;line-height:1.5}
.part-link:hover{background:var(--bg-sunken);text-decoration:none;color:var(--fg)}
.part-no{flex:0 0 auto;min-width:20px;height:20px;border-radius:6px;background:var(--bg-sunken);color:var(--fg-muted);font-size:12px;display:inline-flex;align-items:center;justify-content:center;margin-top:1px}
.part.is-active>.part-link{background:var(--accent-soft);color:var(--accent);font-weight:600}
.part.is-active .part-no{background:var(--accent);color:#fff}
.secs{list-style:none;margin:2px 0 8px;padding:0 0 0 12px;border-left:1px solid var(--border)}
.secs .sec{display:block;padding:4px 8px;font-size:13px;color:var(--fg-muted);border-radius:6px;line-height:1.5}
.secs .sec:hover{background:var(--bg-sunken);color:var(--fg);text-decoration:none}
.secs .lvl3 .sec{padding-left:18px;font-size:12.5px;color:var(--fg-faint)}
.secs .sec.is-current{background:var(--accent-soft);color:var(--accent);font-weight:600}
.bn-foot{margin-top:10px;padding:10px 9px 0;border-top:1px solid var(--border-soft)}
.bn-foot a{font-size:13px}
.content{flex:1 1 auto;min-width:0;padding:44px 40px 120px}
.prose{max-width:788px;margin:0 auto}
.prose h1{font-size:30px;line-height:1.35;margin:.2em 0 .8em;font-weight:600;letter-spacing:-.01em}
.prose h2{font-size:23px;line-height:1.4;margin:2.4em 0 .7em;padding-top:.35em;font-weight:600;border-top:1px solid var(--border-soft);padding-top:1.1em}
.prose h3{font-size:18.5px;margin:1.9em 0 .5em;font-weight:600}
.prose h4{font-size:16px;margin:1.5em 0 .4em;font-weight:600;color:var(--fg-muted)}
.prose h2,h3,h4{scroll-margin-top:74px}
.prose p{margin:0 0 1.05em}
.prose ul,.prose ol{margin:0 0 1.1em;padding-left:1.5em}
.prose li{margin:.28em 0}
.prose li>ul,.prose li>ol{margin:.3em 0}
.prose blockquote{margin:1.3em 0;padding:.7em 1.1em;border-left:3px solid var(--accent);background:var(--accent-soft);border-radius:0 8px 8px 0;color:var(--fg-muted)}
.prose blockquote p:last-child{margin-bottom:0}
.prose hr{border:none;border-top:1px solid var(--border-soft);margin:2.4em 0}
.prose strong{font-weight:600}
.prose code{font-family:var(--font-mono);font-size:.88em;background:var(--bg-sunken);padding:.15em .38em;border-radius:5px;border:1px solid var(--border-soft)}
.prose pre{margin:1.25em 0;padding:14px 16px;border:1px solid var(--border-soft);border-radius:10px;overflow-x:auto;font-size:13.5px;line-height:1.6;background:var(--bg-soft)}
.prose pre code{background:none;border:none;padding:0;font-size:13.5px}
.prose .shiki{background:var(--bg-soft)!important}
.prose table{width:100%;border-collapse:collapse;margin:1.3em 0;font-size:14.5px;display:block;overflow-x:auto}
.prose th,.prose td{border:1px solid var(--border);padding:8px 12px;text-align:left}
.prose th{background:var(--bg-soft);font-weight:600}
.prose img{max-width:100%}
.pager{display:flex;gap:14px;max-width:788px;margin:48px auto 0;padding-top:24px;border-top:1px solid var(--border-soft)}
.pg{flex:1 1 0;display:flex;flex-direction:column;gap:3px;padding:14px 16px;border:1px solid var(--border);border-radius:10px;color:var(--fg)}
.pg:hover{border-color:var(--accent);text-decoration:none;background:var(--accent-soft)}
.pg.next{text-align:right}
.pg.empty{border:none;background:none}
.pg-dir{font-size:12px;color:var(--fg-faint)}
.pg-name{font-size:14px;font-weight:600;line-height:1.45}
.book-foot{display:flex;gap:14px;flex-wrap:wrap;max-width:788px;margin:36px auto 0;padding-top:16px;border-top:1px solid var(--border-soft);color:var(--fg-faint);font-size:12.5px}
.scrim{display:none;position:fixed;inset:var(--topbar-h) 0 0;background:rgba(31,35,40,.35);z-index:39}
.scrim.show{display:block}
body.home{background:var(--bg)}
.home-top{max-width:1440px;margin:0 auto}
main.home{max-width:960px;margin:0 auto;padding:56px 22px 100px}
.hero{padding:8px 0 40px;border-bottom:1px solid var(--border-soft)}
.hero h1{font-size:40px;line-height:1.25;margin:0 0 .18em;font-weight:600;letter-spacing:-.02em}
.hero-sub{color:var(--fg-faint);font-size:16px;margin:0 0 1.1em;font-family:var(--font-sans)}
.hero-lead{font-size:17px;color:var(--fg-muted);max-width:720px;margin:0 0 1.6em}
.stats{display:flex;gap:34px;margin:0 0 1.8em;flex-wrap:wrap}
.stat{display:flex;flex-direction:column}
.stat b{font-size:28px;font-weight:600;color:var(--fg);line-height:1.2}
.stat span{font-size:13px;color:var(--fg-faint)}
.hero-cta{margin:0 0 1em}
.btn{display:inline-block;background:var(--accent);color:#fff;padding:11px 20px;border-radius:9px;font-weight:600;font-size:15px}
.btn:hover{text-decoration:none;background:#1a5fd0}
.hero-note{color:var(--fg-faint);font-size:13px;margin:0;max-width:720px}
.sec-h{font-size:22px;font-weight:600;margin:0 0 .3em}
.map{padding:44px 0 12px}
.map-lead{color:var(--fg-muted);margin:0 0 1.6em}
.map-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.map-group{border:1px solid var(--border-soft);border-radius:12px;padding:16px 18px;background:var(--bg-soft)}
.map-range{font-size:12px;color:var(--accent);font-weight:600;letter-spacing:.02em}
.map-group h3{font-size:16px;margin:.35em 0 .35em;font-weight:600}
.map-group p{font-size:13.5px;color:var(--fg-muted);margin:0 0 .7em}
.map-group ul{list-style:none;margin:0;padding:0}
.map-group li{margin:.3em 0;font-size:13.5px}
.cards-sec{padding:36px 0 0}
.cards{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;margin-top:1.2em}
.card{display:block;border:1px solid var(--border);border-radius:12px;padding:16px;color:var(--fg);transition:border-color .15s,background .15s}
.card:hover{border-color:var(--accent);background:var(--accent-soft);text-decoration:none}
.card-no{font-size:12px;color:var(--accent);font-weight:600}
.card-name{font-size:15.5px;font-weight:600;margin:.3em 0 .45em;line-height:1.45}
.card-blurb{font-size:13px;color:var(--fg-muted);line-height:1.6}
.card-meta{font-size:12px;color:var(--fg-faint);margin-top:.7em}
.home-foot{max-width:960px}
@media (max-width:1080px){.cards{grid-template-columns:1fr 1fr}}
@media (max-width:960px){
  .toc-toggle{display:inline-flex}
  .sidebar{position:fixed;top:var(--topbar-h);left:0;z-index:40;background:var(--bg);transform:translateX(-100%);transition:transform .22s ease;box-shadow:0 8px 30px rgba(0,0,0,.08)}
  .sidebar.open{transform:none}
  .content{padding:28px 20px 100px}
  .prose h1{font-size:25px}
  .prose h2{font-size:20px}
}
@media (max-width:680px){
  .map-grid{grid-template-columns:1fr}
  .cards{grid-template-columns:1fr}
  .hero h1{font-size:30px}
  .stats{gap:22px}
  .pager{flex-direction:column}
  .pg.next{text-align:left}
}
`;

const NAVJS = `(function(){
  var sb=document.getElementById('sidebar');
  var scrim=document.getElementById('scrim');
  var btn=document.getElementById('tocToggle');
  function close(){ if(sb) sb.classList.remove('open'); if(scrim) scrim.classList.remove('show'); }
  if(btn&&sb&&scrim){
    btn.addEventListener('click',function(){ sb.classList.toggle('open'); scrim.classList.toggle('show'); });
    scrim.addEventListener('click',close);
  }
  var links=Array.prototype.slice.call(document.querySelectorAll('.secs .sec'));
  if(links.length){
    var map={};
    links.forEach(function(a){ map[a.getAttribute('data-id')]=a; });
    var active=null;
    function setActive(id){
      if(!map[id]||active===id) return;
      if(active&&map[active]) map[active].classList.remove('is-current');
      active=id; map[id].classList.add('is-current');
      var r=map[id].getBoundingClientRect();
      if(r.top<90||r.bottom>window.innerHeight-40){
        map[id].scrollIntoView({block:'center'});
      }
    }
    var io=new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting) setActive(e.target.id); });
    },{rootMargin:'-64px 0px -72% 0px',threshold:0});
    document.querySelectorAll('.prose h2[id], .prose h3[id]').forEach(function(h){ io.observe(h); });
    if(links[0]) setActive(links[0].getAttribute('data-id'));
    document.querySelectorAll('.secs .sec').forEach(function(a){
      a.addEventListener('click',function(){ if(window.innerWidth<=960) close(); });
    });
  }
})();
`;

async function main() {
  const args = process.argv.slice(2);
  const allFlag = args.includes('--all');
  const partsArg = (args.find((a) => a.startsWith('--parts=')) || '').split('=')[1];
  const only = allFlag ? null : (partsArg ? partsArg.split(',').map((n) => Number(n.trim())) : [0]);

  highlighter = await createHighlighter({ themes: ['github-light'], langs: LANGS });
  const md = new MarkdownIt({ html: true, linkify: false, breaks: false, typographer: false, highlight });
  // 书稿用 `---` 作分隔线；当其紧贴段落文字（中间无空行）时，CommonMark 的 Setext
  // 规则会把上一行误判为 H2 标题。全书标题均用 `#` 语法，故直接禁用该规则。
  md.block.ruler.disable('lheading');

  const parts = scanParts();
  let totalH2 = 0, totalCode = 0;
  for (const p of parts) {
    const r = renderPart(md, p.raw);
    p.toc = r.toc;
    p.body = r.html;
    p.h2count = r.toc.filter((h) => h.level === 2 && /^\d+\.\d+/.test(h.text)).length;
    totalH2 += p.h2count;
    totalCode += (p.raw.match(/^```/gm) || []).length / 2;
  }

  fs.mkdirSync(path.join(OUT, 'assets'), { recursive: true });
  fs.writeFileSync(path.join(OUT, 'assets/book.css'), CSS, 'utf8');
  fs.writeFileSync(path.join(OUT, 'assets/nav.js'), NAVJS, 'utf8');

  const targets = only ? parts.filter((p) => only.includes(p.num)) : parts;
  for (const p of targets) {
    const page = buildPartPage(parts, p, p.body, p.toc);
    fs.writeFileSync(path.join(OUT, p.slug + '.html'), page.html, 'utf8');
    console.log('  ✓ ' + p.slug + '.html  (' + p.toc.length + ' 条目录, ' + Math.round(p.raw.length / 1024) + 'KB 原文)');
  }

  const stats = { h2: totalH2, code: Math.round(totalCode) };
  fs.writeFileSync(path.join(OUT, 'index.html'), buildIndex(parts, stats), 'utf8');
  console.log('  ✓ index.html  (' + parts.length + ' 个部分, ' + stats.h2 + ' 节, ' + stats.code + ' 代码块)');
  console.log('\n输出目录: ' + OUT);
  console.log('本地预览: ' + PUBLIC_URL + 'index.html');
}

main().catch((e) => { console.error(e); process.exit(1); });

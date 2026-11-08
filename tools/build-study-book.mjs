#!/usr/bin/env node
/**
 * Build the static web edition of 《系统架构设计师（高级）备考学习手册》.
 *
 * Source files (Desktop) are READ ONLY. Every transformation happens on a copy
 * under public/book/system-architect-designer/. Re-run this script whenever the
 * manuscript is updated; no manual editing of the published HTML is needed.
 *
 * Usage:
 *   node tools/build-study-book.mjs [sourceDir]
 */

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = process.argv[2] || path.join(os.homedir(), "Desktop", "学习手册");
const OUT = path.join(ROOT, "public", "book", "system-architect-designer");
const BOOK_TITLE = "系统架构设计师备考学习手册";
const BOOK_SUB = "按考点重组的 11 章正文 + 857 道随堂题";
const VERSION = "2026-11";

// sections / quiz counts come from the manuscript README.md and K0 preface.
const CHAPTERS = [
  {
    n: 0,
    file: "K0-前言.html",
    title: "前言",
    sections: 0,
    quiz: 0,
    group: "开篇",
    blurb: "全书定位、结构、七段体例、标注约定与读法。先花五分钟读完这一页。",
  },
  {
    n: 1,
    file: "K1-计算机系统基础.html",
    title: "计算机系统基础",
    sections: 13,
    quiz: 113,
    group: "地基 K1–K4",
    blurb: "硬件、操作系统、数据库与文件系统、网络、语言、多媒体、系统工程与性能。",
  },
  {
    n: 2,
    file: "K2-信息系统与信息安全.html",
    title: "信息系统与信息安全",
    sections: 10,
    quiz: 91,
    group: "地基 K1–K4",
    blurb: "信息系统类型与建设、信息安全技术，含官方口径与常见说法的冲突提醒。",
  },
  {
    n: 3,
    file: "K3-软件工程与可靠性.html",
    title: "软件工程与可靠性",
    sections: 13,
    quiz: 107,
    group: "地基 K1–K4",
    blurb: "过程模型、需求工程、分析与设计、测试、项目管理、可靠性、MDA 与 AI 测试。",
  },
  {
    n: 4,
    file: "K4-数据库设计.html",
    title: "数据库设计",
    sections: 9,
    quiz: 70,
    group: "地基 K1–K4",
    blurb: "数据模型、三级模式、关系运算、范式、NoSQL、向量数据库与多模数据库。",
  },
  {
    n: 5,
    file: "K5-架构基础与架构风格.html",
    title: "架构基础与架构风格",
    sections: 11,
    quiz: 87,
    group: "架构主线 K5–K8",
    blurb: "架构定义与视图、五大类风格、分层与 MVC、ABSD、复用与 DSSA、EDA、六边形架构。",
  },
  {
    n: 6,
    file: "K6-质量属性与架构评估.html",
    title: "质量属性与架构评估",
    sections: 13,
    quiz: 96,
    group: "架构主线 K5–K8",
    blurb: "质量属性场景、SAAM/ATAM/CBAM、高并发手段、性能测试、负载均衡与秒杀。",
  },
  {
    n: 7,
    file: "K7-演化与维护.html",
    title: "演化与维护",
    sections: 10,
    quiz: 69,
    group: "架构主线 K5–K8",
    blurb: "演化四维度与四时期、18 条原则、网站十阶段、架构维护、DevOps 与 AIOps。",
  },
  {
    n: 8,
    file: "K8-信息系统架构.html",
    title: "信息系统架构",
    sections: 6,
    quiz: 47,
    group: "架构主线 K5–K8",
    blurb: "物理/逻辑结构、四种架构模型、四视角框架、ADM 与层次式架构三层。",
  },
  {
    n: 9,
    file: "K9-云原生与SOA.html",
    title: "云原生与 SOA",
    sections: 10,
    quiz: 77,
    group: "现代架构 K9–K10",
    blurb: "SOA 与协议、云原生七原则、容器/微服务/Serverless/网格、分布式事务与企业集成。",
  },
  {
    n: 10,
    file: "K10-嵌入式通信与安全架构.html",
    title: "嵌入式、通信与安全架构",
    sections: 6,
    quiz: 42,
    group: "现代架构 K9–K10",
    blurb: "嵌入式两种模式、实时设计、通信网络、安全模型与 WPDRRC。",
  },
  {
    n: 11,
    file: "K11-大数据与未来技术.html",
    title: "大数据与未来技术",
    sections: 9,
    quiz: 58,
    group: "前沿 K11",
    blurb: "CPS、AI、机器人、边缘计算、数字孪生、大数据栈、Lambda/Kappa、RAG 与数据湖。",
  },
];

const slug = n => `k${String(n).padStart(2, "0")}.html`;
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/* ---------------------------------------------------------------- nav CSS */
const NAV_CSS = `
<style id="book-nav-css">
#book-nav{position:sticky;top:0;z-index:100;background:rgba(251,250,247,.96);backdrop-filter:blur(8px);border-bottom:1px solid #e6e3dd;font:14px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif}
#bar{z-index:101!important}
#book-nav .bn-in{max-width:1060px;margin:0 auto;padding:9px 20px;display:flex;align-items:center;gap:14px;flex-wrap:wrap}
#book-nav a{color:#1f4e79;text-decoration:none;white-space:nowrap}
#book-nav a:hover{text-decoration:underline}
#book-nav .bn-home{font-weight:700}
#book-nav .bn-cur{color:#1f2328;font-weight:600;flex:1;min-width:180px;text-align:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#book-nav .bn-step{background:#fff;border:1px solid #e6e3dd;border-radius:999px;padding:3px 11px;font-size:13px}
#book-nav .bn-step.disabled{opacity:.38;pointer-events:none}
#book-nav .bn-prog{color:#6b7280;font-size:12.5px;white-space:nowrap;font-variant-numeric:tabular-nums}
.book-foot-nav{max-width:760px;margin:0 auto;padding:0 20px 80px;font:15px/1.7 -apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif}
.book-foot-nav .bf-box{border-top:2px solid #e6e3dd;padding-top:22px;display:flex;justify-content:space-between;gap:14px;flex-wrap:wrap;align-items:center}
.book-foot-nav a{color:#1f4e79;text-decoration:none}
.book-foot-nav a:hover{text-decoration:underline}
.book-foot-nav .bf-next{background:#1f4e79;color:#fff!important;border-radius:10px;padding:9px 18px;font-weight:600}
.book-foot-nav .bf-next:hover{text-decoration:none;background:#163c5e}
.book-foot-nav .bf-note{color:#6b7280;font-size:13px;margin-top:14px}
@media(max-width:600px){#book-nav .bn-cur{order:3;flex-basis:100%;text-align:left}#book-nav .bn-prog{display:none}}
@media print{#book-nav,.book-foot-nav{display:none}#bar{z-index:0!important}}
</style>
`;

/* ------------------------------------------------------------ nav builders */
function topNav(ch, prev, next) {
  const prevLink = prev
    ? `<a class="bn-step" href="${slug(prev.n)}" title="${esc(prev.title)}">&larr; K${prev.n}</a>`
    : `<span class="bn-step disabled">&larr; K0</span>`;
  const nextLink = next
    ? `<a class="bn-step" href="${slug(next.n)}" title="${esc(next.title)}">K${next.n} &rarr;</a>`
    : `<span class="bn-step disabled">K11 &rarr;</span>`;
  const prog = ch.quiz
    ? `<span class="bn-prog" id="book-nav-progress">0 / ${ch.quiz} 题</span>`
    : `<span class="bn-prog">全书总说明</span>`;
  return `<nav id="book-nav"><div class="bn-in">` +
    `<a class="bn-home" href="index.html">&larr; 全书目录</a>` +
    prevLink +
    `<span class="bn-cur">${ch.n === 0 ? "K0 前言" : `K${ch.n} · ${esc(ch.title)}`}</span>` +
    nextLink + prog + `</div></nav>`;
}

function bottomNav(ch, prev, next) {
  const prevLink = prev
    ? `<a href="${slug(prev.n)}">&larr; 上一章 K${prev.n} ${esc(prev.title)}</a>`
    : `<a href="index.html">&larr; 返回全书目录</a>`;
  const nextLink = next
    ? `<a class="bf-next" href="${slug(next.n)}">下一章 K${next.n} ${esc(next.title)} &rarr;</a>`
    : `<a class="bf-next" href="index.html">读完了，回目录 &rarr;</a>`;
  return `<div class="book-foot-nav"><div class="bf-box">${prevLink}${nextLink}</div>` +
    `<p class="bf-note">作答记录保存在本机浏览器，换设备或清除缓存不会保留。本章支持浏览器直接打印为 PDF。</p></div>`;
}

function progressScript(key, total) {
  if (!total) return "";
  return `<script>
(function(){
  var el=document.getElementById("book-nav-progress");
  function refresh(){
    try{
      var st=JSON.parse(localStorage.getItem(${JSON.stringify(key)})||"{}"),done=0;
      Object.keys(st).forEach(function(k){if(st[k]&&st[k].done)done++;});
      if(el)el.textContent=done+" / ${total} 题";
    }catch(e){}
  }
  refresh();setInterval(refresh,1000);
})();
</script>`;
}

/* ------------------------------------------------------------- index page */
function indexPage(keys) {
  const totalQuiz = CHAPTERS.reduce((s, c) => s + c.quiz, 0);
  const totalSections = CHAPTERS.reduce((s, c) => s + c.sections, 0);
  const groups = [...new Set(CHAPTERS.map(c => c.group))];

  const cards = CHAPTERS.map(c => `
<a class="card" href="${slug(c.n)}" data-key="${esc(keys[c.n])}" data-total="${c.quiz}">
  <div class="card-top"><span class="card-no">K${c.n}</span><span class="card-meta">${c.sections ? `${c.sections} 节 · ${c.quiz} 题` : "总说明"}</span></div>
  <div class="card-name">${esc(c.title)}</div>
  <div class="card-blurb">${esc(c.blurb)}</div>
  ${c.quiz ? `<div class="card-track"><div class="card-fill"></div></div><div class="card-prog">0 / ${c.quiz} 题已完成</div>` : `<div class="card-prog">从这里开始 →</div>`}
</a>`).join("");

  const groupRows = groups.map(g => {
    const items = CHAPTERS.filter(c => c.group === g);
    return `<div class="grp"><div class="grp-name">${esc(g)}</div><div class="grp-items">` +
      items.map(c => `<a href="${slug(c.n)}">K${c.n} ${esc(c.title)}</a>`).join("") +
      `</div></div>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${BOOK_TITLE} · 全书目录</title>
<meta name="description" content="系统架构设计师（高级）备考用书：11 章正文、${totalSections} 节、${totalQuiz} 道随堂题，正文与习题一体，答完立刻看解析与诊断标签。">
<style>
:root{--bg:#fbfaf7;--card:#fff;--ink:#1f2328;--sub:#6b7280;--line:#e6e3dd;--accent:#1f4e79;--warm:#fdf6ec}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:var(--bg);color:var(--ink);font:17px/1.85 -apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",serif}
a{color:var(--accent)}
.wrap{max-width:1060px;margin:0 auto;padding:0 24px 90px}
.topbar{border-bottom:1px solid var(--line);background:#fff}
.topbar .in{max-width:1060px;margin:0 auto;padding:14px 24px;display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.brand{font-weight:700;color:var(--ink);text-decoration:none;font-size:16px}
.brand span{color:var(--sub);font-weight:400;font-size:13px;margin-left:8px}
.ver{margin-left:auto;color:var(--sub);font-size:12.5px;border:1px solid var(--line);border-radius:999px;padding:2px 10px}
.backblog{font-size:13px;color:var(--sub);text-decoration:none}
.backblog:hover{color:var(--accent)}
.hero{padding:64px 0 40px;border-bottom:1px solid var(--line)}
.eyebrow{font-size:13px;letter-spacing:2px;color:var(--accent);font-weight:600;margin:0 0 14px}
h1{font-size:38px;line-height:1.35;margin:0 0 12px;letter-spacing:.5px}
.lead{font-size:18px;color:#42505e;margin:0 0 26px;max-width:760px}
.stats{display:flex;gap:36px;flex-wrap:wrap;margin:28px 0 30px}
.stat b{display:block;font-size:30px;line-height:1.1;color:var(--accent);font-variant-numeric:tabular-nums}
.stat span{font-size:13px;color:var(--sub)}
.btn{display:inline-block;background:var(--accent);color:#fff;text-decoration:none;border-radius:10px;padding:11px 22px;font-size:16px;font-weight:600}
.btn:hover{background:#163c5e}
.btn.ghost{background:#fff;color:var(--accent);border:1px solid var(--line);font-weight:400;margin-left:10px}
.btn.ghost:hover{background:#eef3f8}
.hero-note{font-size:13.5px;color:var(--sub);margin:18px 0 0}
h2{font-size:22px;margin:56px 0 8px;padding-top:20px;border-top:2px solid var(--line)}
.sec-lead{color:var(--sub);font-size:15px;margin:0 0 22px}
.grp{display:flex;gap:20px;padding:13px 0;border-bottom:1px dashed var(--line);align-items:baseline;flex-wrap:wrap}
.grp-name{width:150px;flex-shrink:0;font-weight:600;font-size:14.5px;color:var(--accent)}
.grp-items{display:flex;gap:8px 18px;flex-wrap:wrap;font-size:14.5px}
.grp-items a{text-decoration:none}
.grp-items a:hover{text-decoration:underline}
.cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(310px,1fr));gap:16px;margin-top:24px}
.card{display:block;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:18px 20px;text-decoration:none;color:inherit;transition:.16s;box-shadow:0 1px 3px rgba(0,0,0,.04)}
.card:hover{border-color:#9db4c9;transform:translateY(-2px);box-shadow:0 6px 18px rgba(31,78,121,.09)}
.card-top{display:flex;justify-content:space-between;align-items:center;gap:10px}
.card-no{font-size:12.5px;font-weight:700;color:#fff;background:var(--accent);border-radius:999px;padding:2px 10px;letter-spacing:.5px}
.card-meta{font-size:12.5px;color:var(--sub);font-variant-numeric:tabular-nums}
.card-name{font-size:18px;font-weight:700;margin:12px 0 6px;line-height:1.45}
.card-blurb{font-size:14px;color:#5a6672;line-height:1.7;min-height:48px}
.card-track{height:5px;background:#eeeae3;border-radius:99px;margin-top:16px;overflow:hidden}
.card-fill{height:100%;width:0;background:#0f7b4f;border-radius:99px;transition:width .4s}
.card-prog{font-size:12.5px;color:var(--sub);margin-top:7px;font-variant-numeric:tabular-nums}
.notes{background:var(--warm);border:1px solid #ecdcc0;border-left:3px solid #e0b984;border-radius:0 12px 12px 0;padding:18px 22px;margin-top:26px;font-size:14.5px;line-height:1.85}
.notes b{color:#8a5a12}
.notes ul{margin:8px 0 0;padding-left:20px}
.notes li{margin:5px 0}
.overall{margin-top:20px;font-size:15px;color:var(--sub)}
.overall b{color:var(--ink);font-size:19px;font-variant-numeric:tabular-nums}
footer{border-top:1px solid var(--line);margin-top:60px;padding-top:20px;font-size:13px;color:var(--sub);display:flex;gap:18px;flex-wrap:wrap}
@media(max-width:600px){h1{font-size:29px}.hero{padding:40px 0 30px}.stats{gap:22px}.grp-name{width:100%}.btn.ghost{margin:10px 0 0;display:table}}
</style>
</head>
<body>
<header class="topbar"><div class="in">
  <a class="brand" href="index.html">${BOOK_TITLE}<span>系统架构设计师（高级）备考用书</span></a>
  <span class="ver">${VERSION}</span>
  <a class="backblog" href="/">&larr; 返回博客</a>
</div></header>
<div class="wrap">
<section class="hero">
  <p class="eyebrow">SYSTEM ARCHITECT · 备考学习手册</p>
  <h1>${BOOK_TITLE}</h1>
  <p class="lead">不是现成读物的缩写或导读，而是按考点重新组织的一套备考用书。每章把「问题 → 原理 → 计算 → 误区 → 自测」串成一条线，正文与习题在同一页：读完一节，立刻做题，答完马上看对错、解析与诊断标签。</p>
  <div class="stats">
    <div class="stat"><b>11</b><span>章正文 + 1 篇前言</span></div>
    <div class="stat"><b>${totalSections}</b><span>节</span></div>
    <div class="stat"><b>${totalQuiz}</b><span>道随堂题</span></div>
    <div class="stat"><b>0</b><span>外部依赖 / 账号</span></div>
  </div>
  <a class="btn" href="k00.html">从 K0 前言开始阅读 &rarr;</a>
  <a class="btn ghost" href="k01.html">直接进 K1</a>
  <p class="hero-note">建议按顺序读：前四章是后七章的地基。各章也可单独阅读，章节可单独分享链接。</p>
</section>

<section>
  <h2>阅读地图</h2>
  <p class="sec-lead">标注只有两种：<b>软考口径</b>（按官方用书表述给分，必须照记）与<b>拓展</b>（考纲未展开的补充知识）。通用说明只在 K0 出现一次，各章不再重复。</p>
  ${groupRows}
</section>

<section>
  <h2>全部章节</h2>
  <p class="sec-lead">每章末尾都有「本章总复习」：一章的主线、必须能说出的判断、8 道跨节综合题、与论文和案例的接口。学完一节能自查，学完一章能回看。</p>
  <div class="cards">${cards}
</div>
  <p class="overall">本机答题进度：<b id="overall-done">0</b> / ${totalQuiz} 题已完成（仅统计当前浏览器）</p>
</section>

<section>
  <h2>使用说明</h2>
  <div class="notes">
    <b>关于作答记录</b>
    <ul>
      <li>答题结果保存在<b>本机浏览器</b>的 localStorage，不上传、不需要登录，换设备或清除浏览器数据后不会保留。</li>
      <li>错题按四个诊断标签分类：<b>A 漏读</b>（回看该段）、<b>B 补充</b>（拓展知识，记住结论）、<b>C 晦涩</b>（理解优先）、<b>D 计算</b>（重做同类题）。</li>
      <li>整章页面为纯静态 HTML，无 CDN、无字体外链，离线打开同样可用；浏览器「打印 → 另存为 PDF」可带走纸版，打印样式已内置。</li>
      <li>页面顶部的细线是本章阅读进度条，导航条右侧的数字是本章已作答题数。</li>
    </ul>
  </div>
</section>

<footer>
  <span>${BOOK_TITLE}</span><span>${VERSION}</span>
  <span>正文与随堂题来自本地编纂稿，按原样发布</span>
  <a href="/">Qianchang's Blog</a>
</footer>
</div>
<script>
(function(){
  var cards=[].slice.call(document.querySelectorAll(".card")),sum=0,grand=0;
  function read(key){try{return JSON.parse(localStorage.getItem(key)||"{}")}catch(e){return {}}}
  cards.forEach(function(card){
    var total=parseInt(card.dataset.total,10)||0,key=card.dataset.key;
    if(!total)return;
    var st=read(key),done=0;
    Object.keys(st).forEach(function(k){if(st[k]&&st[k].done)done++;});
    if(done>total)done=total;
    sum+=done;grand+=total;
    var fill=card.querySelector(".card-fill"),prog=card.querySelector(".card-prog");
    if(fill)fill.style.width=(done/total*100).toFixed(1)+"%";
    if(prog)prog.textContent=done+" / "+total+" 题已完成";
  });
  var el=document.getElementById("overall-done");if(el)el.textContent=sum;
})();
</script>
</body>
</html>
`;
}

/* ------------------------------------------------------------------- build */
function main() {
  if (!fs.existsSync(SRC)) {
    console.error(`[build-study-book] source directory not found: ${SRC}`);
    process.exit(1);
  }
  fs.mkdirSync(OUT, { recursive: true });

  const keys = {};
  let totalQuiz = 0;

  for (let i = 0; i < CHAPTERS.length; i++) {
    const ch = CHAPTERS[i];
    const srcPath = path.join(SRC, ch.file);
    if (!fs.existsSync(srcPath)) {
      console.error(`[build-study-book] missing source file: ${srcPath}`);
      process.exit(1);
    }

    let html = fs.readFileSync(srcPath, "utf8");
    const keyMatch = html.match(/const KEY\s*=\s*"([^"]+)"/);
    keys[ch.n] = keyMatch ? keyMatch[1] : "";

    // Only rewrite the one cross-chapter link that exists in every chapter.
    html = html.replace(/href="K0-前言\.html"/g, 'href="k00.html"');

    const prev = i > 0 ? CHAPTERS[i - 1] : null;
    const next = i < CHAPTERS.length - 1 ? CHAPTERS[i + 1] : null;

    html = html.replace("</head>", NAV_CSS + "</head>");
    html = html.replace("<body>", "<body>" + topNav(ch, prev, next));
    html = html.replace(
      "</body>",
      bottomNav(ch, prev, next) + progressScript(keys[ch.n], ch.quiz) + "</body>"
    );

    // Sanity: injected markup must be present and no source link may survive.
    if (!html.includes('id="book-nav"') || html.includes('href="K0-前言.html"')) {
      console.error(`[build-study-book] injection failed on ${ch.file}`);
      process.exit(1);
    }

    fs.writeFileSync(path.join(OUT, slug(ch.n)), html, "utf8");
    totalQuiz += ch.quiz;
    console.log(`  ${slug(ch.n)}  K${ch.n} ${ch.title}  ${ch.quiz} 题  key=${keys[ch.n] || "(none)"}`);
  }

  fs.writeFileSync(path.join(OUT, "index.html"), indexPage(keys), "utf8");
  console.log(`\n[build-study-book] OK → ${OUT}`);
  console.log(`  12 pages + index.html, ${totalQuiz} questions, source untouched.`);
}

main();

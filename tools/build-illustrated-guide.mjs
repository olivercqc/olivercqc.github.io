#!/usr/bin/env node
/**
 * Build the web edition of "An Illustrated Guide to AI Agents".
 *
 * The Desktop manuscript is READ ONLY. This script produces an optimized copy
 * under public/book/an-illustrated-guide-to-ai-agents/:
 *   - 326 base64 images are extracted as standalone files (bytes unchanged)
 *   - images get lazy loading and intrinsic width/height when available
 *   - CDN dependencies are replaced with local copies in assets/vendor/
 *   - MathJax is removed (the book contains no math expressions; the only
 *     "$" / "$$" / "\\(" occurrences are inside the MathJax config itself)
 *   - the original copyright page and full text are preserved verbatim
 *   - a source/attribution footer is appended
 *
 * Usage:
 *   node tools/build-illustrated-guide.mjs [sourceHtml]
 */

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC =
  process.argv[2] ||
  path.join(os.homedir(), "Desktop", "An Illustrated Guide to AI Agents.html");
const OUT = path.join(ROOT, "public", "book", "an-illustrated-guide-to-ai-agents");
const IMG_DIR = path.join(OUT, "assets", "img");
const VENDOR_DIR = path.join(OUT, "assets", "vendor");

const CDN = {
  css: "https://cdn.jsdelivr.net/npm/highlight.js@11/styles/github.min.css",
  js: "https://cdn.jsdelivr.net/npm/highlight.js@11/highlight.min.js",
  math: "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js",
};

const META = `<meta name="description" content="An Illustrated Guide to AI Agents (Maarten Grootendorst & Jay Alammar, O'Reilly Media, First Edition 2026, ISBN 979-8-341-66269-8). 经授权收录的全文阅读版，含 300 余幅插图与十章正文。">\n`;

const FOOTER = `
<footer class="source-note">
<style>
.source-note{max-width:980px;margin:0 auto;padding:28px 24px 60px;border-top:1px solid var(--line);color:var(--muted);font-size:13px;line-height:1.8}
.source-note p{margin:4px 0}
.source-note b{color:var(--fg)}
.source-note a{color:var(--accent)}
</style>
<p><b>An Illustrated Guide to AI Agents</b> · Maarten Grootendorst &amp; Jay Alammar · O'Reilly Media, First Edition (September 2026) · ISBN 979-8-341-66269-8</p>
<p>Copyright © 2026 Arpeggio Inc. and Maarten Pieter Grootendorst. All rights reserved. 经授权收录于本站，版权归原权利人所有；原书版权页完整保留于正文前部。</p>
<p><a href="https://www.oreilly.com/library/view/an-illustrated-guide/9798341662681/">O'Reilly 官方页面</a> · <a href="https://ai-agents-book.com/">官方网站</a> · <a href="https://github.com/HandsOnLLM/An-Illustrated-Guide-To-AI-Agents">配套代码仓库</a> · <a href="/">← 返回博客</a></p>
</footer>
`;

/* --------------------------------------------------------------- helpers */
function pngSize(buf) {
  if (buf.length < 24 || buf.toString("ascii", 1, 4) !== "PNG") return null;
  const w = buf.readUInt32BE(16);
  const h = buf.readUInt32BE(20);
  return w > 0 && h > 0 && w < 20000 && h < 20000 ? { w, h } : null;
}

function ensureVendor() {
  const need = ["highlight.min.js", "github.min.css"];
  const missing = need.filter(f => !fs.existsSync(path.join(VENDOR_DIR, f)));
  if (missing.length) {
    console.error(
      `[build-illustrated-guide] missing local vendor files: ${missing.join(", ")}\n` +
        `  Download them from cdnjs (highlight.js 11.11.1) into ${VENDOR_DIR}`
    );
    process.exit(1);
  }
}

/* ----------------------------------------------------------------- build */
function main() {
  if (!fs.existsSync(SRC)) {
    console.error(`[build-illustrated-guide] source not found: ${SRC}`);
    process.exit(1);
  }
  fs.mkdirSync(IMG_DIR, { recursive: true });
  ensureVendor();

  // Clean previously generated figures only; leave vendor/ and everything else alone.
  for (const f of fs.readdirSync(IMG_DIR)) {
    if (/^fig-\d{4}\.(png|webp)$/.test(f)) fs.unlinkSync(path.join(IMG_DIR, f));
  }

  const original = fs.readFileSync(SRC, "utf8");
  let html = original;
  let count = 0;
  let imageBytes = 0;

  // Replace each inline data URI with a standalone asset.
  html = html.replace(
    /src="data:image\/([a-zA-Z0-9+.-]+);base64,([A-Za-z0-9+\/=\s]+?)"/g,
    (_m, ext, payload) => {
      count += 1;
      const kind = ext.toLowerCase() === "webp" ? "webp" : ext.toLowerCase();
      const buf = Buffer.from(payload.replace(/\s/g, ""), "base64");
      imageBytes += buf.length;
      const name = `fig-${String(count).padStart(4, "0")}.${kind}`;
      fs.writeFileSync(path.join(IMG_DIR, name), buf);
      const dim = kind === "png" ? pngSize(buf) : null;
      const dimAttr = dim ? ` width="${dim.w}" height="${dim.h}"` : "";
      const eager = count <= 2 ? "eager" : "lazy";
      return `src="assets/img/${name}" loading="${eager}" decoding="async"${dimAttr}`;
    }
  );

  if (!count) {
    console.error("[build-illustrated-guide] no inline images found - source format changed?");
    process.exit(1);
  }
  if (/src="data:image\//.test(html)) {
    console.error("[build-illustrated-guide] some inline images were not extracted");
    process.exit(1);
  }

  // Remove MathJax config + loader (no math expressions in the book).
  const beforeMath = html.length;
  html = html.replace(/<script>\s*window\.MathJax\s*=[\s\S]*?<\/script>/g, "");
  html = html.replace(/<script[^>]*src="https:\/\/cdn\.jsdelivr\.net\/npm\/mathjax@3[^"]*"[^>]*>\s*<\/script>/g, "");
  if (html.length === beforeMath) {
    console.error("[build-illustrated-guide] MathJax tags not found - check the source");
    process.exit(1);
  }
  if (html.includes(CDN.math)) {
    console.error("[build-illustrated-guide] MathJax CDN reference still present");
    process.exit(1);
  }

  // Point highlight.js at the local vendor copies.
  if (!html.includes(CDN.css) || !html.includes(CDN.js)) {
    console.error("[build-illustrated-guide] highlight.js CDN tags not found");
    process.exit(1);
  }
  html = html.replaceAll(CDN.css, "assets/vendor/github.min.css");
  html = html.replaceAll(CDN.js, "assets/vendor/highlight.min.js");

  // Add description + attribution footer.
  html = html.replace("</head>", META + "</head>");
  html = html.replace("</body>", FOOTER + "</body>");

  if (!html.includes('class="source-note"')) {
    console.error("[build-illustrated-guide] attribution footer injection failed");
    process.exit(1);
  }
  if (/cdn\.jsdelivr\.net/.test(html)) {
    console.error("[build-illustrated-guide] external CDN reference still present");
    process.exit(1);
  }

  fs.writeFileSync(path.join(OUT, "index.html"), html, "utf8");

  const outSize = Buffer.byteLength(html, "utf8");
  console.log(`  source      : ${(Buffer.byteLength(original, "utf8") / 1048576).toFixed(2)} MiB`);
  console.log(`  index.html  : ${(outSize / 1048576).toFixed(2)} MiB`);
  console.log(`  figures     : ${count} files, ${(imageBytes / 1048576).toFixed(2)} MiB total`);
  console.log(`  vendor      : highlight.min.js + github.min.css (local)`);
  console.log(`  lazy images : ${count - 2}, eager: ${Math.min(2, count)}`);
  console.log(`\n[build-illustrated-guide] OK -> ${OUT}`);
  console.log("  Original Desktop file untouched; copyright page and full text preserved.");
}

main();

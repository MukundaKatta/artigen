#!/usr/bin/env node
/**
 * Bundle size reporter for the web build.
 *
 * Walks dist/ and groups JS, CSS, image, font, and other assets by
 * extension. Prints a markdown-friendly table for the CI to paste into
 * PR comments.
 *
 * Exits non-zero if --max-js-kb is provided and the total JS bundle
 * exceeds it.
 */
const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walk(full));
    } else {
      out.push({ path: full, size: fs.statSync(full).size });
    }
  }
  return out;
}

function categorize(ext) {
  ext = ext.toLowerCase();
  if (['.js', '.mjs'].includes(ext)) return 'JS';
  if (['.css'].includes(ext)) return 'CSS';
  if (['.html'].includes(ext)) return 'HTML';
  if (['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.ico'].includes(ext)) return 'Image';
  if (['.woff', '.woff2', '.ttf', '.otf'].includes(ext)) return 'Font';
  if (['.json', '.map'].includes(ext)) return 'Data';
  return 'Other';
}

function fmt(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function main() {
  if (!fs.existsSync(distDir)) {
    console.error(`No dist/ directory at ${distDir}. Run 'expo export --platform web' first.`);
    process.exit(2);
  }

  const files = walk(distDir);
  const totals = new Map();
  let grand = 0;
  for (const { path: p, size } of files) {
    const cat = categorize(path.extname(p));
    totals.set(cat, (totals.get(cat) ?? 0) + size);
    grand += size;
  }

  // Largest JS files individually
  const largeJs = files
    .filter((f) => categorize(path.extname(f.path)) === 'JS')
    .sort((a, b) => b.size - a.size)
    .slice(0, 5);

  console.log('## Bundle size report');
  console.log('');
  console.log('| Category | Size |');
  console.log('|---|---|');
  for (const [cat, size] of [...totals.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`| ${cat} | ${fmt(size)} |`);
  }
  console.log(`| **Total** | **${fmt(grand)}** |`);
  console.log('');
  if (largeJs.length > 0) {
    console.log('### Largest JS files');
    console.log('');
    console.log('| File | Size |');
    console.log('|---|---|');
    for (const f of largeJs) {
      const rel = path.relative(distDir, f.path);
      console.log(`| ${rel} | ${fmt(f.size)} |`);
    }
    console.log('');
  }

  // Optional max-JS budget gate
  const maxArg = process.argv.find((a) => a.startsWith('--max-js-kb='));
  if (maxArg) {
    const limitKb = Number(maxArg.split('=')[1]);
    const jsKb = (totals.get('JS') ?? 0) / 1024;
    if (jsKb > limitKb) {
      console.error(`\n❌ JS bundle ${jsKb.toFixed(1)} KB exceeds budget ${limitKb} KB`);
      process.exit(1);
    } else {
      console.log(`✓ JS bundle ${jsKb.toFixed(1)} KB within budget ${limitKb} KB`);
    }
  }
}

if (require.main === module) {
  main();
}

module.exports = { walk, categorize, fmt };

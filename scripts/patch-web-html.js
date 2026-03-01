#!/usr/bin/env node
/**
 * Post-export script: patches dist/index.html with:
 * 1. Global error handler (blank page debugging)
 * 2. PWA manifest + meta tags
 * 3. Service worker registration
 * 4. SEO / Open Graph meta tags
 * Also copies PWA assets (manifest.json, sw.js) to dist/
 */
const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');
const htmlPath = path.join(distDir, 'index.html');
const publicDir = path.join(__dirname, '..', 'public');

let html = fs.readFileSync(htmlPath, 'utf-8');

// --- 1. Error handler script ---
const errorScript = `
<script>
  window.onerror = function(msg, url, line, col, err) {
    var root = document.getElementById('root');
    if (root && !root.hasChildNodes()) {
      root.innerHTML = '<div style="padding:40px;font-family:monospace;max-width:800px;margin:0 auto;">' +
        '<h2 style="color:#e74c3c;">App failed to load</h2>' +
        '<pre style="background:#f8f8f8;padding:16px;border-radius:8px;overflow:auto;white-space:pre-wrap;word-break:break-all;">' +
        msg + '\\n\\nFile: ' + url + '\\nLine: ' + line + ', Col: ' + col +
        (err && err.stack ? '\\n\\nStack:\\n' + err.stack : '') +
        '</pre></div>';
    }
  };
</script>`;

// --- 2. SEO & Open Graph meta tags ---
const seoMeta = `
  <meta name="description" content="Artigen — Create, share, and discover AI-generated art. Join the AI art community.">
  <meta name="keywords" content="AI art, generative art, AI image generation, art community, creative AI">
  <meta property="og:title" content="Artigen — AI Art Community">
  <meta property="og:description" content="Create, share, and discover AI-generated art">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://artigen-app.web.app">
  <meta property="og:image" content="https://artigen-app.web.app/favicon.ico">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="Artigen — AI Art Community">
  <meta name="twitter:description" content="Create, share, and discover AI-generated art">`;

// --- 3. PWA meta tags + manifest link ---
const pwaMeta = `
  <link rel="manifest" href="/manifest.json">
  <meta name="theme-color" content="#0095F6">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="default">
  <meta name="apple-mobile-web-app-title" content="Artigen">`;

// --- 4. Service worker registration ---
const swScript = `
<script>
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/sw.js').catch(function() {});
    });
  }
</script>`;

// Apply patches
html = html.replace('<title>', seoMeta + pwaMeta + '\n  <title>');
html = html.replace('<title>Artigen</title>', '<title>Artigen — AI Art Community</title>');
html = html.replace('<body>', '<body>' + errorScript);
html = html.replace('</body>', swScript + '\n</body>');

fs.writeFileSync(htmlPath, html, 'utf-8');
console.log('✓ Patched dist/index.html with error handler, SEO, PWA, and service worker');

// --- 5. Copy PWA assets to dist ---
const filesToCopy = ['manifest.json', 'sw.js'];
for (const file of filesToCopy) {
  const src = path.join(publicDir, file);
  const dest = path.join(distDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`✓ Copied ${file} to dist/`);
  }
}

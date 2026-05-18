#!/usr/bin/env node
/**
 * Post-export script: patches dist/index.html with:
 * 1. Mobile CSS fixes (viewport, safe areas, no tap highlight)
 * 2. Global error handler (blank page debugging)
 * 3. SEO / Open Graph meta tags
 * 4. PWA manifest + meta tags
 * 5. Service worker registration
 * Also copies PWA assets (manifest.json, sw.js) to dist/
 *
 * The pure `applyPatches(html)` function is exported for testing.
 */
const fs = require('fs');
const path = require('path');

const MOBILE_CSS = `
<style>
  /* Fix 100vh on mobile Safari — use fill-available / dvh */
  html {
    height: -webkit-fill-available;
    height: 100%;
  }
  body {
    height: 100%;
    overflow: hidden;
  }
  #root {
    height: 100%;
    height: -webkit-fill-available;
    height: 100dvh;
    position: fixed;
    inset: 0;
    overflow: hidden;
  }
  /* Safe area CSS variables (notch / home indicator) */
  :root {
    --sai-top: env(safe-area-inset-top, 0px);
    --sai-bottom: env(safe-area-inset-bottom, 0px);
    --sai-left: env(safe-area-inset-left, 0px);
    --sai-right: env(safe-area-inset-right, 0px);
  }
  /* Remove iOS tap highlight + 300ms delay */
  * {
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
    touch-action: manipulation;
  }
  /* Smooth momentum scroll inside scrollable RN views */
  [style*="overflow"] {
    -webkit-overflow-scrolling: touch;
  }
  /* Prevent pull-to-refresh on the root */
  body {
    overscroll-behavior-y: none;
  }
</style>`;

const ERROR_SCRIPT = `
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

const SEO_META = `
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

const PWA_META = `
  <link rel="manifest" href="/manifest.json">
  <meta name="theme-color" content="#0095F6">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="default">
  <meta name="apple-mobile-web-app-title" content="Artigen">`;

const SW_SCRIPT = `
<script>
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/sw.js').catch(function() {});
    });
  }
</script>`;

/**
 * Pure function: takes the Expo-emitted dist/index.html as a string and
 * returns the patched HTML. Exported for unit testing — does no I/O.
 */
function applyPatches(html) {
  // Fix viewport: add viewport-fit=cover for iOS safe areas
  html = html.replace(
    /(<meta[^>]*name="viewport"[^>]*>)/i,
    '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">'
  );

  // Inject mobile CSS fixes right before </head>
  html = html.replace('</head>', MOBILE_CSS + '\n</head>');

  html = html.replace('<title>', SEO_META + PWA_META + '\n  <title>');
  html = html.replace('<title>Artigen</title>', '<title>Artigen — AI Art Community</title>');
  html = html.replace('<body>', '<body>' + ERROR_SCRIPT);
  html = html.replace('</body>', SW_SCRIPT + '\n</body>');

  return html;
}

module.exports = { applyPatches };

// ── Entry point: only run when executed directly ────────────────────
if (require.main === module) {
  const distDir = path.join(__dirname, '..', 'dist');
  const htmlPath = path.join(distDir, 'index.html');
  const publicDir = path.join(__dirname, '..', 'public');

  const html = fs.readFileSync(htmlPath, 'utf-8');
  const patched = applyPatches(html);
  fs.writeFileSync(htmlPath, patched, 'utf-8');
  console.log('✓ Patched dist/index.html with error handler, SEO, PWA, and service worker');

  // Copy PWA assets to dist
  const filesToCopy = ['manifest.json', 'sw.js'];
  for (const file of filesToCopy) {
    const src = path.join(publicDir, file);
    const dest = path.join(distDir, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      console.log(`✓ Copied ${file} to dist/`);
    }
  }
}

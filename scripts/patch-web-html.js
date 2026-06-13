#!/usr/bin/env node
/**
 * Post-export script: patches dist/index.html with:
 * 1. Mobile CSS fixes (viewport, safe areas, no tap highlight)
 * 2. Skip-to-content link for keyboard / screen-reader users
 * 3. Global error handler (blank page debugging)
 * 4. SEO / Open Graph / Twitter meta tags (with image)
 * 5. PWA manifest + meta tags + multi-size icons
 * 6. JSON-LD structured data (WebSite + Organization)
 * 7. Service worker registration
 * Also copies PWA assets (manifest.json, sw.js, robots.txt, sitemap.xml) to dist/
 *
 * The pure `applyPatches(html)` function is exported for testing.
 */
const fs = require('fs');
const path = require('path');

const CANONICAL_URL = 'https://artigen-app.web.app';
const OG_IMAGE_URL = `${CANONICAL_URL}/og-image.png`;
const THEME_COLOR = '#0095F6';

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
    margin: 0;
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
  /* Skip-to-content link — visible on focus only */
  .skip-to-content {
    position: absolute;
    top: -40px;
    left: 8px;
    z-index: 9999;
    padding: 8px 16px;
    background: #000;
    color: #fff;
    text-decoration: none;
    border-radius: 4px;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px;
  }
  .skip-to-content:focus {
    top: 8px;
    outline: 2px solid ${THEME_COLOR};
    outline-offset: 2px;
  }
  /* Respect prefers-reduced-motion */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
  /* Pre-hydration loading splash so first paint isn't a blank canvas */
  #__pre_root_splash {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #FFFFFF;
    font-family: system-ui, -apple-system, sans-serif;
    color: ${THEME_COLOR};
    font-size: 18px;
    font-weight: 600;
    z-index: 1;
  }
  @media (prefers-color-scheme: dark) {
    #__pre_root_splash { background: #000; color: ${THEME_COLOR}; }
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
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${CANONICAL_URL}/">
  <meta property="og:title" content="Artigen — AI Art Community">
  <meta property="og:description" content="Create, share, and discover AI-generated art">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${CANONICAL_URL}/">
  <meta property="og:image" content="${OG_IMAGE_URL}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="Artigen">
  <meta property="og:locale" content="en_US">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Artigen — AI Art Community">
  <meta name="twitter:description" content="Create, share, and discover AI-generated art">
  <meta name="twitter:image" content="${OG_IMAGE_URL}">`;

const PWA_META = `
  <link rel="manifest" href="/manifest.json">
  <meta name="theme-color" content="${THEME_COLOR}">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="default">
  <meta name="apple-mobile-web-app-title" content="Artigen">
  <link rel="apple-touch-icon" href="/icon-192.png">
  <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png">
  <link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png">
  <meta name="msapplication-TileColor" content="${THEME_COLOR}">
  <meta name="msapplication-TileImage" content="/icon-192.png">
  <meta name="format-detection" content="telephone=no">`;

const JSON_LD = `
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "${CANONICAL_URL}/#website",
      "url": "${CANONICAL_URL}/",
      "name": "Artigen",
      "description": "Create, share, and discover AI-generated art",
      "inLanguage": "en-US"
    },
    {
      "@type": "Organization",
      "@id": "${CANONICAL_URL}/#org",
      "name": "Artigen",
      "url": "${CANONICAL_URL}/",
      "logo": "${CANONICAL_URL}/icon-512.png"
    }
  ]
}
</script>`;

const SKIP_LINK = `
<a class="skip-to-content" href="#root">Skip to content</a>`;

const PRE_SPLASH = `
<div id="__pre_root_splash" aria-hidden="true">Artigen</div>
<script>
  // Remove the splash as soon as React mounts content into #root.
  (function () {
    var root = document.getElementById('root');
    var splash = document.getElementById('__pre_root_splash');
    if (!root || !splash) return;
    var obs = new MutationObserver(function () {
      if (root.hasChildNodes()) {
        splash.style.transition = 'opacity 180ms ease';
        splash.style.opacity = '0';
        setTimeout(function () { splash.remove(); }, 200);
        obs.disconnect();
      }
    });
    obs.observe(root, { childList: true });
  })();
</script>`;

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
    '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">',
  );

  // Inject mobile CSS fixes right before </head>
  html = html.replace('</head>', MOBILE_CSS + '\n' + JSON_LD + '\n</head>');

  html = html.replace('<title>', SEO_META + PWA_META + '\n  <title>');
  html = html.replace('<title>Artigen</title>', '<title>Artigen — AI Art Community</title>');
  html = html.replace('<body>', '<body>' + SKIP_LINK + ERROR_SCRIPT);
  html = html.replace(
    /(<div\s+id="root"[^>]*>\s*<\/div>)/i,
    '$1' + PRE_SPLASH,
  );
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
  console.log('✓ Patched dist/index.html with error handler, SEO, JSON-LD, PWA, and service worker');

  // Copy PWA + web assets to dist
  const filesToCopy = ['manifest.json', 'sw.js', 'robots.txt', 'sitemap.xml'];
  for (const file of filesToCopy) {
    const src = path.join(publicDir, file);
    const dest = path.join(distDir, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      console.log(`✓ Copied ${file} to dist/`);
    }
  }
}

/**
 * Smoke test for scripts/patch-web-html.js. Verifies that the patcher
 * produces the markers we depend on (PWA, SEO, JSON-LD, error handler,
 * mobile CSS, skip-to-content, pre-hydration splash, service worker).
 * Pure-function test — no fs / no real build.
 */

// Use require since the script is CJS

const { applyPatches } = require('../../../scripts/patch-web-html.js') as {
  applyPatches: (html: string) => string;
};

const MOCK_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Artigen</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>`;

describe('patch-web-html.applyPatches', () => {
  const out = applyPatches(MOCK_HTML);

  it('rewrites the viewport tag with viewport-fit=cover', () => {
    expect(out).toContain('viewport-fit=cover');
  });

  it('injects mobile-Safari CSS fixes before </head>', () => {
    expect(out).toMatch(/<style>[\s\S]*100dvh[\s\S]*<\/style>/);
  });

  it('injects SEO meta tags before <title>', () => {
    expect(out).toContain('property="og:title"');
    expect(out).toContain('Artigen — AI Art Community');
    expect(out).toContain('property="og:type"');
    expect(out).toContain('property="og:image"');
    expect(out).toContain('property="og:image:width"');
    expect(out).toContain('property="og:site_name"');
    expect(out).toContain('name="twitter:card" content="summary_large_image"');
    expect(out).toContain('name="twitter:image"');
    expect(out).toContain('rel="canonical"');
    expect(out).toContain('name="robots"');
  });

  it('upgrades the title to the full app name', () => {
    expect(out).toContain('<title>Artigen — AI Art Community</title>');
    expect(out).not.toContain('<title>Artigen</title>');
  });

  it('injects PWA manifest link + apple-mobile-web-app meta', () => {
    expect(out).toContain('rel="manifest" href="/manifest.json"');
    expect(out).toContain('name="apple-mobile-web-app-capable"');
    expect(out).toContain('name="theme-color"');
    expect(out).toContain('rel="apple-touch-icon"');
    expect(out).toContain('sizes="192x192"');
    expect(out).toContain('sizes="512x512"');
    expect(out).toContain('name="msapplication-TileColor"');
  });

  it('injects WebSite + Organization JSON-LD', () => {
    expect(out).toContain('<script type="application/ld+json">');
    expect(out).toContain('"@type": "WebSite"');
    expect(out).toContain('"@type": "Organization"');
  });

  it('injects skip-to-content link at the start of <body>', () => {
    expect(out).toContain('class="skip-to-content"');
    expect(out).toContain('href="#root"');
    // Skip link must come before the root container so keyboard focus
    // lands on it first when tabbing into the page.
    expect(out.indexOf('skip-to-content')).toBeLessThan(out.indexOf('id="root"'));
  });

  it('injects the blank-page error handler at the start of <body>', () => {
    expect(out).toContain('window.onerror');
    expect(out).toContain('App failed to load');
  });

  it('injects a pre-hydration splash that removes itself once root has children', () => {
    expect(out).toContain('id="__pre_root_splash"');
    expect(out).toContain('MutationObserver');
    // The splash div itself (not just the styles) must live in <body> so
    // the observer can watch the root container that comes before it.
    const splashDivIdx = out.indexOf('<div id="__pre_root_splash"');
    const rootDivIdx = out.indexOf('<div id="root"');
    expect(splashDivIdx).toBeGreaterThan(rootDivIdx);
  });

  it('respects prefers-reduced-motion in injected CSS', () => {
    expect(out).toContain('prefers-reduced-motion');
  });

  it('registers the service worker before </body>', () => {
    expect(out).toContain("serviceWorker.register('/sw.js')");
    expect(out.indexOf('serviceWorker.register')).toBeLessThan(out.indexOf('</body>'));
  });

  it('is idempotent enough — running twice does not duplicate the title swap', () => {
    const twice = applyPatches(applyPatches(MOCK_HTML));
    // Title only appears in its expanded form
    const matches = twice.match(/<title>Artigen — AI Art Community<\/title>/g) || [];
    expect(matches.length).toBe(1);
  });
});

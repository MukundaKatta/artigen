/**
 * Smoke test for scripts/patch-web-html.js. Verifies that the patcher
 * produces the markers we depend on (PWA, SEO, error handler, mobile CSS,
 * service worker registration). Pure-function test — no fs / no real build.
 */

// Use require since the script is CJS
// eslint-disable-next-line @typescript-eslint/no-var-requires
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
    expect(out).toMatch(/<style>[\s\S]*100dvh[\s\S]*<\/style>\s*<\/head>/);
  });

  it('injects SEO meta tags before <title>', () => {
    expect(out).toContain('property="og:title"');
    expect(out).toContain('Artigen — AI Art Community');
    expect(out).toContain('property="og:type"');
    expect(out).toContain('name="twitter:card"');
  });

  it('upgrades the title to the full app name', () => {
    expect(out).toContain('<title>Artigen — AI Art Community</title>');
    expect(out).not.toContain('<title>Artigen</title>');
  });

  it('injects PWA manifest link + apple-mobile-web-app meta', () => {
    expect(out).toContain('rel="manifest" href="/manifest.json"');
    expect(out).toContain('name="apple-mobile-web-app-capable"');
    expect(out).toContain('name="theme-color"');
  });

  it('injects the blank-page error handler at the start of <body>', () => {
    expect(out).toContain('window.onerror');
    expect(out).toContain('App failed to load');
  });

  it('registers the service worker before </body>', () => {
    expect(out).toContain("serviceWorker.register('/sw.js')");
    expect(out.indexOf("serviceWorker.register")).toBeLessThan(out.indexOf('</body>'));
  });

  it('is idempotent enough — running twice does not duplicate the title swap', () => {
    const twice = applyPatches(applyPatches(MOCK_HTML));
    // Title only appears in its expanded form
    const matches = twice.match(/<title>Artigen — AI Art Community<\/title>/g) || [];
    expect(matches.length).toBe(1);
  });
});

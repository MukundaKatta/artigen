#!/usr/bin/env node
/**
 * Post-export script: injects a global error handler into dist/index.html
 * so that uncaught JS errors during initialization are displayed on screen
 * instead of silently producing a blank page.
 */
const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'dist', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf-8');

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

// Inject error script after <body>
const patched = html.replace('<body>', '<body>' + errorScript);

fs.writeFileSync(htmlPath, patched, 'utf-8');
console.log('✓ Patched dist/index.html with error handler');

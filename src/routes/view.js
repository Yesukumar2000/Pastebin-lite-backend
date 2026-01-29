const express = require('express');
const { getPaste } = require('../lib/paste');

const router = express.Router();

const escapeHtml = (text) => text
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const styles = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: system-ui, sans-serif; background: #1a1a2e; color: #eee; min-height: 100vh; padding: 20px; }
  .container { max-width: 900px; margin: 0 auto; }
  header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid #333; }
  h1 { font-size: 1.5rem; color: #3498db; }
  a { color: #3498db; text-decoration: none; }
  .info { color: #888; font-size: 0.85rem; margin-bottom: 16px; }
  .content { background: #16213e; border-radius: 8px; padding: 20px; white-space: pre-wrap; word-wrap: break-word; font-family: monospace; font-size: 14px; line-height: 1.5; border: 1px solid #333; }
  .error { text-align: center; padding: 60px 20px; }
  .error h1 { color: #e74c3c; margin-bottom: 16px; }
  .error p { color: #aaa; margin-bottom: 24px; }
`;

// GET /p/:id - View paste as HTML
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    let testNowMs = null;
    if (process.env.TEST_MODE === '1') {
      const header = req.get('x-test-now-ms');
      if (header) {
        testNowMs = parseInt(header, 10);
      }
    }

    const paste = await getPaste(id, testNowMs);

    if (!paste) {
      return res.status(404).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Not Found - Pastebin-Lite</title>
  <style>${styles}</style>
</head>
<body>
  <div class="container error">
    <h1>Paste Not Found</h1>
    <p>This paste doesn't exist, has expired, or has reached its view limit.</p>
    <a href="/">Create a new paste</a>
  </div>
</body>
</html>`);
    }

    let info = '';
    if (paste.remainingViews !== null) info += `Views remaining: ${paste.remainingViews}`;
    if (paste.expiresAt) {
      if (info) info += ' | ';
      info += `Expires: ${paste.expiresAt}`;
    }

    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Paste - Pastebin-Lite</title>
  <style>${styles}</style>
</head>
<body>
  <div class="container">
    <header>
      <h1>Pastebin-Lite</h1>
      <a href="/">Create New Paste</a>
    </header>
    ${info ? `<div class="info">${escapeHtml(info)}</div>` : ''}
    <div class="content">${escapeHtml(paste.content)}</div>
  </div>
</body>
</html>`);
  } catch (error) {
    console.error('Error viewing paste:', error.message);
    res.status(500).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Error - Pastebin-Lite</title>
  <style>${styles}</style>
</head>
<body>
  <div class="container error">
    <h1>Server Error</h1>
  </div>
</body>
</html>`);
  }
});

module.exports = router;

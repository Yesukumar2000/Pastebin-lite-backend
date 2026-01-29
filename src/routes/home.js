const express = require('express');
const router = express.Router();

const styles = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: system-ui, sans-serif; background: #1a1a2e; color: #eee; min-height: 100vh; padding: 20px; }
  .container { max-width: 900px; margin: 0 auto; }
  header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #333; }
  h1 { font-size: 2rem; color: #3498db; margin-bottom: 8px; }
  .subtitle { color: #888; }
  .form-group { margin-bottom: 20px; }
  label { display: block; margin-bottom: 8px; color: #aaa; font-size: 0.9rem; }
  textarea { width: 100%; height: 300px; background: #16213e; border: 1px solid #333; border-radius: 8px; padding: 16px; color: #eee; font-family: monospace; font-size: 14px; resize: vertical; }
  textarea:focus { outline: none; border-color: #3498db; }
  .options { display: flex; gap: 20px; flex-wrap: wrap; }
  .option { flex: 1; min-width: 200px; }
  input[type="number"] { width: 100%; background: #16213e; border: 1px solid #333; border-radius: 8px; padding: 12px; color: #eee; font-size: 14px; }
  input:focus { outline: none; border-color: #3498db; }
  .hint { font-size: 0.8rem; color: #666; margin-top: 4px; }
  button { background: #3498db; color: white; border: none; border-radius: 8px; padding: 14px 28px; font-size: 1rem; cursor: pointer; }
  button:hover { background: #2980b9; }
  button:disabled { background: #555; cursor: not-allowed; }
  .result { margin-top: 20px; padding: 20px; background: #16213e; border-radius: 8px; border: 1px solid #333; display: none; }
  .result.show { display: block; }
  .result.success { border-color: #27ae60; }
  .result.success h3 { color: #27ae60; }
  .result.error { border-color: #e74c3c; }
  .result.error h3 { color: #e74c3c; }
  .result h3 { margin-bottom: 12px; }
  .result a { color: #3498db; word-break: break-all; }
  .result p { color: #aaa; }
`;

// GET / - Home page
router.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pastebin-Lite</title>
  <style>${styles}</style>
</head>
<body>
  <div class="container">
    <header>
      <h1>Pastebin-Lite</h1>
      <p class="subtitle">Create and share text snippets</p>
    </header>
    <form id="form">
      <div class="form-group">
        <label for="content">Paste Content</label>
        <textarea id="content" placeholder="Enter your text here..." required></textarea>
      </div>
      <div class="options">
        <div class="option">
          <label for="ttl">Expire After (seconds)</label>
          <input type="number" id="ttl" min="1" placeholder="Optional">
          <p class="hint">Leave empty for no expiration</p>
        </div>
        <div class="option">
          <label for="views">Maximum Views</label>
          <input type="number" id="views" min="1" placeholder="Optional">
          <p class="hint">Leave empty for unlimited views</p>
        </div>
      </div>
      <div class="form-group" style="margin-top: 20px;">
        <button type="submit" id="btn">Create Paste</button>
      </div>
    </form>
    <div id="result" class="result">
      <h3 id="title"></h3>
      <p id="msg"></p>
    </div>
  </div>
  <script>
    const form = document.getElementById('form');
    const result = document.getElementById('result');
    const title = document.getElementById('title');
    const msg = document.getElementById('msg');
    const btn = document.getElementById('btn');

    form.onsubmit = async (e) => {
      e.preventDefault();
      btn.disabled = true;
      btn.textContent = 'Creating...';
      result.className = 'result';

      const body = { content: document.getElementById('content').value };
      const ttl = document.getElementById('ttl').value;
      const views = document.getElementById('views').value;
      if (ttl) body.ttl_seconds = parseInt(ttl);
      if (views) body.max_views = parseInt(views);

      try {
        const res = await fetch('/api/pastes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        const data = await res.json();
        if (res.ok) {
          result.className = 'result show success';
          title.textContent = 'Paste Created!';
          msg.innerHTML = 'Share this link: <a href="' + data.url + '">' + data.url + '</a>';
          form.reset();
        } else {
          result.className = 'result show error';
          title.textContent = 'Error';
          msg.textContent = data.error;
        }
      } catch (err) {
        result.className = 'result show error';
        title.textContent = 'Error';
        msg.textContent = 'Network error';
      }
      btn.disabled = false;
      btn.textContent = 'Create Paste';
    };
  </script>
</body>
</html>`);
});

module.exports = router;

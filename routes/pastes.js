const express = require('express');
const { createPaste, getPaste } = require('../lib/paste');

const router = express.Router();
const MAX_CONTENT_SIZE = 512 * 1024; // 512 KB

// POST /api/pastes - Create a new paste
router.post('/', async (req, res) => {
  try {
    const { content, ttl_seconds, max_views } = req.body;

    // Validation
    if (!content) {
      return res.status(400).json({ error: 'content is required' });
    }
    if (typeof content !== 'string') {
      return res.status(400).json({ error: 'content must be a string' });
    }
    if (content.length === 0) {
      return res.status(400).json({ error: 'content cannot be empty' });
    }
    if (content.length > MAX_CONTENT_SIZE) {
      return res.status(400).json({ error: 'content exceeds maximum size' });
    }
    if (ttl_seconds !== undefined && (!Number.isInteger(ttl_seconds) || ttl_seconds < 1)) {
      return res.status(400).json({ error: 'ttl_seconds must be an integer >= 1' });
    }
    if (max_views !== undefined && (!Number.isInteger(max_views) || max_views < 1)) {
      return res.status(400).json({ error: 'max_views must be an integer >= 1' });
    }

    const result = await createPaste(content, ttl_seconds, max_views);

    const protocol = req.get('x-forwarded-proto') || req.protocol || 'http';
    const host = req.get('host');
    const url = `${protocol}://${host}/p/${result.id}`;

    res.status(201).json({ id: result.id, url });
  } catch (error) {
    console.error('Error creating paste:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/pastes/:id - Get a paste
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
      return res.status(404).json({ error: 'Paste not found' });
    }

    res.json({
      content: paste.content,
      remaining_views: paste.remainingViews,
      expires_at: paste.expiresAt,
    });
  } catch (error) {
    console.error('Error fetching paste:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;


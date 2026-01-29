const express = require('express');
const { storage } = require('../lib/redis');

const router = express.Router();

// GET /api/healthz - Health check
router.get('/', async (req, res) => {
  try {
    await storage.ping();
    res.json({ ok: true });
  } catch (error) {
    res.status(503).json({ ok: false, error: error.message });
  }
});

module.exports = router;

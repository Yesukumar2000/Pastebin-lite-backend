const { storage } = require('./redis');
const crypto = require('crypto');

function generateId() {
  return crypto.randomBytes(6).toString('base64url');
}

async function createPaste(content, ttlSeconds, maxViews) {
  const id = generateId();
  const now = Date.now();

  const paste = {
    content,
    createdAt: now,
    viewCount: 0,
  };

  if (ttlSeconds && ttlSeconds > 0) {
    paste.expiresAt = now + (ttlSeconds * 1000);
  }

  if (maxViews && maxViews > 0) {
    paste.maxViews = maxViews;
  }

  await storage.save(id, paste);
  return { id };
}

async function getPaste(id, testNowMs = null) {
  const paste = await storage.get(id);

  if (!paste) {
    return null;
  }

  const now = testNowMs !== null ? testNowMs : Date.now();

  // Check expiry
  if (paste.expiresAt && now >= paste.expiresAt) {
    return null;
  }

  // Check view limit
  if (paste.maxViews && paste.viewCount >= paste.maxViews) {
    return null;
  }

  // Increment view count
  paste.viewCount += 1;
  await storage.save(id, paste);

  // Calculate remaining views
  const remainingViews = paste.maxViews ? paste.maxViews - paste.viewCount : null;
  const expiresAt = paste.expiresAt ? new Date(paste.expiresAt).toISOString() : null;

  return {
    content: paste.content,
    expiresAt,
    remainingViews,
  };
}

module.exports = { createPaste, getPaste };

require('dotenv').config();

const express = require('express');
const cors = require('cors');

const pastesRouter = require('./routes/pastes');
const healthRouter = require('./routes/health');
const viewRouter = require('./routes/view');
const homeRouter = require('./routes/home');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Routes
app.use('/api/pastes', pastesRouter);
app.use('/api/healthz', healthRouter);
app.use('/p', viewRouter);
app.use('/', homeRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// Export for Vercel
module.exports = app;

// Start server (local development only)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

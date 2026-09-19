// server.js
// Entry point. Starts an Express server that:
//   1. Serves the frontend (the /public folder — plain HTML/CSS/JS)
//   2. Exposes the /api/tickets REST API backed by SQLite (see db.js)
// Both run from the same server/port, so there's only one URL to deploy
// and no CORS setup needed.

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const ticketsRouter = require('./routes/tickets');

const app = express();

app.use(cors());
app.use(express.json());

// Frontend (static files)
app.use(express.static(path.join(__dirname, 'public')));

// API
app.use('/api/tickets', ticketsRouter);

// Simple health check — useful to confirm the server + DB are alive
// after deploying.
app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'supportdesk-crm-api' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`SupportDesk CRM running at http://localhost:${PORT}`);
});

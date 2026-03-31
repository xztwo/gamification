const express = require('express');
const repo = require('./db');
const { getGamificationHandler } = require('./handlers/gamification');

function createApp(customRepo = repo) {
  const app = express();
  app.use(express.json());

  app.get('/api/gamification', getGamificationHandler(customRepo));

  return app;
}

module.exports = { createApp };


import fs from 'node:fs';
import path from 'node:path';
import cors from 'cors';
import express, { type Express } from 'express';
import { config } from './config.js';

export function createApp(): Express {
  const app = express();

  app.use(cors({ origin: config.clientOrigins }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', uptime: Math.round(process.uptime()) });
  });

  // In production one process serves both the API/WebSocket and the built React app.
  const indexHtml = path.join(config.clientDistDir, 'index.html');
  if (config.isProduction && fs.existsSync(indexHtml)) {
    app.use(express.static(config.clientDistDir));

    // SPA fallback so deep links like /online/ABCDE work on refresh.
    app.use((req, res, next) => {
      const isPageRequest =
        req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/socket.io');
      if (!isPageRequest) return next();
      res.sendFile(indexHtml);
    });
  }

  return app;
}

import express from 'express';
import cors from 'cors';
import { initDatabase, AccountManager } from '@simple-email/core';
import { createAccountRoutes } from './routes/accounts.js';
import { createMessageRoutes } from './routes/messages.js';

const PORT = process.env.PORT || 3001;

async function main() {
  const db = await initDatabase('simple-email.db');
  const manager = new AccountManager(db);

  const app = express();
  app.use(cors({ origin: ['http://localhost:1420', 'http://localhost:1425', 'http://localhost:5173'] }));
  app.use(express.json());

  app.use('/api/accounts', createAccountRoutes(manager));
  app.use('/api', createMessageRoutes(manager));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.listen(PORT, () => {
    console.log(`[server] running on http://localhost:${PORT}`);
  });
}

main().catch(console.error);

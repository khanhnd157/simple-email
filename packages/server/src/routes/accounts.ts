import { Router, type Request, type Response } from 'express';
import { AccountManager } from '@simple-email/core';

function id(req: Request): string {
  return req.params.id as string;
}

export function createAccountRoutes(manager: AccountManager): Router {
  const router = Router();

  router.get('/', async (_req: Request, res: Response) => {
    try {
      const accounts = await manager.getAccounts();
      res.json(accounts);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  router.post('/', async (req: Request, res: Response) => {
    try {
      console.log(`[addAccount] email=${req.body.email}`);
      const result = await manager.addAccount(req.body);
      console.log(`[addAccount] valid=${result.valid} id=${result.account.id} error=${result.error}`);
      if (!result.valid) {
        res.status(400).json({ error: result.error, account: result.account });
        return;
      }
      res.json(result.account);
    } catch (err) {
      console.error(`[addAccount] error:`, err);
      res.status(500).json({ error: (err as Error).message });
    }
  });

  router.delete('/:id', async (req: Request, res: Response) => {
    try {
      await manager.removeAccount(id(req));
      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  router.post('/:id/connect', async (req: Request, res: Response) => {
    try {
      console.log(`[connect] accountId=${id(req)}`);
      const status = await manager.connect(id(req));
      console.log(`[connect] result:`, status);
      res.json(status);
    } catch (err) {
      console.error(`[connect] error:`, err);
      res.status(500).json({ error: (err as Error).message });
    }
  });

  router.post('/:id/disconnect', async (req: Request, res: Response) => {
    try {
      await manager.disconnect(id(req));
      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  router.get('/:id/status', (req: Request, res: Response) => {
    const status = manager.getConnectionStatus(id(req));
    res.json(status);
  });

  router.post('/:id/sync-folders', async (req: Request, res: Response) => {
    try {
      console.log(`[sync-folders] accountId=${id(req)}`);
      const folders = await manager.syncFolders(id(req));
      console.log(`[sync-folders] found ${folders.length} folders`);
      res.json(folders);
    } catch (err) {
      console.error(`[sync-folders] error:`, err);
      res.status(500).json({ error: (err as Error).message });
    }
  });

  router.get('/:id/folders', async (req: Request, res: Response) => {
    try {
      const folders = await manager.getFolders(id(req));
      res.json(folders);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  router.post('/:id/sync-messages', async (req: Request, res: Response) => {
    try {
      const { folderPath, since } = req.body;
      if (!folderPath) {
        res.status(400).json({ error: 'folderPath is required' });
        return;
      }
      const options = since ? { since: new Date(since) } : undefined;
      const result = await manager.syncMessages(id(req), folderPath, options);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  return router;
}

import { Router, type Request, type Response } from 'express';
import { AccountManager } from '@simple-email/core';

export function createMessageRoutes(manager: AccountManager): Router {
  const router = Router();

  router.get('/folders/:folderId/messages', async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const folderId = req.params.folderId as string;
      const messages = await manager.getMessages(folderId, { limit, offset });
      res.json(messages);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  router.get('/messages/:id', async (req: Request, res: Response) => {
    try {
      const msgId = req.params.id as string;
      const message = await manager.getMessage(msgId);
      if (!message) {
        res.status(404).json({ error: 'Message not found' });
        return;
      }
      res.json(message);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  return router;
}

import { ImapFlow, type ImapFlowOptions, type FetchMessageObject } from 'imapflow';

interface TreeNode {
  name?: string;
  path: string;
  delimiter: string;
  flags: Set<string>;
  folders?: Map<string, TreeNode>;
  specialUse?: string;
  listed?: boolean;
}
import { EventEmitter } from 'events';
import type { AccountConfig, Folder, FolderType } from '../types/index.js';

export interface ImapEvents {
  newMail: (folder: string, count: number) => void;
  flagsUpdate: (folder: string, uid: number, flags: Set<string>) => void;
  error: (error: Error) => void;
  close: () => void;
}

const SPECIAL_USE_MAP: Record<string, FolderType> = {
  '\\Inbox': 'inbox',
  '\\Sent': 'sent',
  '\\Drafts': 'drafts',
  '\\Trash': 'trash',
  '\\Junk': 'junk',
  '\\Archive': 'archive',
};

function detectFolderType(path: string, flags: string[]): FolderType {
  for (const flag of flags) {
    const mapped = SPECIAL_USE_MAP[flag];
    if (mapped) return mapped;
  }
  const lower = path.toLowerCase();
  if (lower === 'inbox') return 'inbox';
  if (lower.includes('sent')) return 'sent';
  if (lower.includes('draft')) return 'drafts';
  if (lower.includes('trash') || lower.includes('deleted')) return 'trash';
  if (lower.includes('junk') || lower.includes('spam')) return 'junk';
  if (lower.includes('archive')) return 'archive';
  return 'custom';
}

export class ImapClient extends EventEmitter {
  private client: ImapFlow | null = null;
  private config: AccountConfig;
  private idleFolder: string | null = null;

  constructor(config: AccountConfig) {
    super();
    this.config = config;
  }

  async connect(): Promise<void> {
    const options: ImapFlowOptions = {
      host: this.config.imapHost,
      port: this.config.imapPort,
      secure: this.config.imapSecure,
      auth: {
        user: this.config.username,
        pass: this.config.password ?? '',
      },
      logger: false,
    };

    if (this.config.authType === 'oauth2' && this.config.accessToken) {
      options.auth = {
        user: this.config.username,
        accessToken: this.config.accessToken,
      };
    }

    this.client = new ImapFlow(options);

    this.client.on('error', (err: Error) => this.emit('error', err));
    this.client.on('close', () => this.emit('close'));
    this.client.on('exists', (info: { path: string; count: number; prevCount: number }) => {
      if (info.count > info.prevCount) {
        this.emit('newMail', info.path, info.count - info.prevCount);
      }
    });

    await this.client.connect();
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.logout();
      this.client = null;
    }
  }

  isConnected(): boolean {
    return this.client?.usable === true;
  }

  async listFolders(): Promise<Folder[]> {
    this.ensureConnected();
    const tree = await this.client!.listTree();
    const folders: Folder[] = [];
    this.flattenTree(tree as TreeNode, folders);
    return folders;
  }

  private flattenTree(node: TreeNode, result: Folder[], parentPath?: string): void {
    if (node.path) {
      const flags = Array.from(node.flags || []);
      if (node.specialUse) flags.push(node.specialUse);
      result.push({
        id: '',
        accountId: this.config.id,
        name: node.name || '',
        path: node.path,
        type: detectFolderType(node.path, flags),
        delimiter: node.delimiter || '/',
        unreadCount: 0,
        totalCount: 0,
        parentPath,
      });
    }

    if (node.folders) {
      for (const [, child] of node.folders) {
        this.flattenTree(child as TreeNode, result, node.path || undefined);
      }
    }
  }

  async getMailboxStatus(path: string): Promise<{ messages: number; unseen: number }> {
    this.ensureConnected();
    const status = await this.client!.status(path, { messages: true, unseen: true });
    return {
      messages: status.messages ?? 0,
      unseen: status.unseen ?? 0,
    };
  }

  async fetchMessages(
    folder: string,
    options?: { since?: number; limit?: number },
  ): Promise<FetchMessageObject[]> {
    this.ensureConnected();
    const lock = await this.client!.getMailboxLock(folder);
    try {
      const messages: FetchMessageObject[] = [];
      const range = options?.since ? `${options.since}:*` : '1:*';

      for await (const msg of this.client!.fetch(range, {
        uid: true,
        flags: true,
        envelope: true,
        bodyStructure: true,
        size: true,
        source: true,
      })) {
        messages.push(msg);
        if (options?.limit && messages.length >= options.limit) break;
      }

      return messages;
    } finally {
      lock.release();
    }
  }

  async fetchNewMessages(folder: string, sinceUid: number): Promise<FetchMessageObject[]> {
    return this.fetchMessages(folder, { since: sinceUid + 1 });
  }

  async fetchMessageSource(folder: string, uid: number): Promise<Buffer> {
    this.ensureConnected();
    const lock = await this.client!.getMailboxLock(folder);
    try {
      const msg = await this.client!.fetchOne(String(uid), { source: true }, { uid: true });
      if (!msg || !msg.source) throw new Error(`Message ${uid} not found or has no source`);
      return Buffer.from(msg.source);
    } finally {
      lock.release();
    }
  }

  async setFlags(folder: string, uid: number, flags: string[], action: 'set' | 'add' | 'remove'): Promise<void> {
    this.ensureConnected();
    const lock = await this.client!.getMailboxLock(folder);
    try {
      if (action === 'add') {
        await this.client!.messageFlagsAdd(String(uid), flags, { uid: true });
      } else if (action === 'remove') {
        await this.client!.messageFlagsRemove(String(uid), flags, { uid: true });
      } else {
        await this.client!.messageFlagsSet(String(uid), flags, { uid: true });
      }
    } finally {
      lock.release();
    }
  }

  async moveMessage(folder: string, uid: number, destination: string): Promise<void> {
    this.ensureConnected();
    const lock = await this.client!.getMailboxLock(folder);
    try {
      await this.client!.messageMove(String(uid), destination, { uid: true });
    } finally {
      lock.release();
    }
  }

  async deleteMessage(folder: string, uid: number): Promise<void> {
    this.ensureConnected();
    const lock = await this.client!.getMailboxLock(folder);
    try {
      await this.client!.messageDelete(String(uid), { uid: true });
    } finally {
      lock.release();
    }
  }

  async search(folder: string, query: Record<string, unknown>): Promise<number[]> {
    this.ensureConnected();
    const lock = await this.client!.getMailboxLock(folder);
    try {
      const results = await this.client!.search(query, { uid: true });
      return results as number[];
    } finally {
      lock.release();
    }
  }

  async startIdle(folder: string): Promise<void> {
    this.ensureConnected();
    this.idleFolder = folder;
    const lock = await this.client!.getMailboxLock(folder);
    try {
      await this.client!.idle();
    } finally {
      lock.release();
      this.idleFolder = null;
    }
  }

  private ensureConnected(): void {
    if (!this.client?.usable) {
      throw new Error('IMAP client not connected');
    }
  }
}

import { EventEmitter } from 'events';
import { v4 as uuid } from 'uuid';
import { ImapClient } from '../imap/index.js';
import { SmtpClient } from '../smtp/index.js';
import { parseEmail } from '../parser/index.js';
import {
  AccountRepository,
  FolderRepository,
  MessageRepository,
  AttachmentRepository,
  ContactRepository,
} from '../storage/repository.js';
import type { LibSQLDatabase } from 'drizzle-orm/libsql';
import type * as dbSchema from '../storage/schema.js';
import type {
  AccountConfig,
  Folder,
  Message,
  SendMailOptions,
  SyncResult,
  ConnectionStatus,
} from '../types/index.js';

type DB = LibSQLDatabase<typeof dbSchema>;

interface AccountConnection {
  config: AccountConfig;
  imap: ImapClient;
  smtp: SmtpClient;
  status: ConnectionStatus;
}

export class AccountManager extends EventEmitter {
  private connections = new Map<string, AccountConnection>();
  private accountRepo: AccountRepository;
  private folderRepo: FolderRepository;
  private messageRepo: MessageRepository;
  private attachmentRepo: AttachmentRepository;
  private contactRepo: ContactRepository;

  constructor(db: DB) {
    super();
    this.accountRepo = new AccountRepository(db);
    this.folderRepo = new FolderRepository(db);
    this.messageRepo = new MessageRepository(db);
    this.attachmentRepo = new AttachmentRepository(db);
    this.contactRepo = new ContactRepository(db);
  }

  async addAccount(
    config: Omit<AccountConfig, 'id'>,
  ): Promise<{ account: AccountConfig; valid: boolean; error?: string }> {
    const imap = new ImapClient({ ...config, id: 'test' });
    const smtp = new SmtpClient({ ...config, id: 'test' });

    try {
      await imap.connect();
      await smtp.connect();
      const smtpValid = await smtp.verify();
      await imap.disconnect();
      await smtp.disconnect();

      if (!smtpValid) {
        return { account: { id: '', ...config }, valid: false, error: 'SMTP verification failed' };
      }

      const account = await this.accountRepo.create(config);
      return { account, valid: true };
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Connection failed';
      return { account: { id: '', ...config }, valid: false, error };
    }
  }

  async removeAccount(accountId: string): Promise<void> {
    await this.disconnect(accountId);
    await this.accountRepo.delete(accountId);
  }

  async updateAccount(accountId: string, data: Partial<AccountConfig>): Promise<void> {
    await this.accountRepo.update(accountId, data);
  }

  async getAccounts(): Promise<AccountConfig[]> {
    return this.accountRepo.findAll();
  }

  async getAccount(accountId: string): Promise<AccountConfig | null> {
    return this.accountRepo.findById(accountId);
  }

  async connect(accountId: string): Promise<ConnectionStatus> {
    const config = await this.accountRepo.findById(accountId);
    if (!config) return { connected: false, error: 'Account not found' };

    const imap = new ImapClient(config);
    const smtp = new SmtpClient(config);

    try {
      await imap.connect();
      await smtp.connect();

      imap.on('newMail', (folder, count) => {
        this.emit('newMail', accountId, folder, count);
      });
      imap.on('error', (err) => {
        this.emit('error', accountId, err);
      });

      const conn: AccountConnection = {
        config,
        imap,
        smtp,
        status: { connected: true, lastSync: new Date() },
      };
      this.connections.set(accountId, conn);

      return conn.status;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Connection failed';
      return { connected: false, error };
    }
  }

  async disconnect(accountId: string): Promise<void> {
    const conn = this.connections.get(accountId);
    if (conn) {
      await conn.imap.disconnect();
      await conn.smtp.disconnect();
      this.connections.delete(accountId);
    }
  }

  getConnectionStatus(accountId: string): ConnectionStatus {
    const conn = this.connections.get(accountId);
    return conn?.status ?? { connected: false };
  }

  async syncFolders(accountId: string): Promise<Folder[]> {
    const conn = this.getConnection(accountId);
    const remoteFolders = await conn.imap.listFolders();
    const result: Folder[] = [];

    for (const folder of remoteFolders) {
      const status = await conn.imap.getMailboxStatus(folder.path);
      const saved = await this.folderRepo.upsert({
        ...folder,
        accountId,
        unreadCount: status.unseen,
        totalCount: status.messages,
      });
      result.push(saved);
    }

    return result;
  }

  async syncMessages(accountId: string, folderPath: string, options?: { since?: Date }): Promise<SyncResult> {
    const conn = this.getConnection(accountId);
    const folder = await this.folderRepo.findByPath(accountId, folderPath);
    if (!folder) throw new Error(`Folder not found: ${folderPath}`);

    const maxUid = await this.messageRepo.getMaxUid(folder.id);
    let fetchedMessages;
    if (maxUid > 0) {
      fetchedMessages = await conn.imap.fetchNewMessages(folderPath, maxUid);
    } else if (options?.since) {
      fetchedMessages = await conn.imap.fetchMessagesByDate(folderPath, options.since);
    } else {
      fetchedMessages = await conn.imap.fetchMessages(folderPath);
    }

    let newMessages = 0;

    for (const fetched of fetchedMessages) {
      if (!fetched.source) continue;

      const { message, attachments } = await parseEmail(Buffer.from(fetched.source), {
        accountId,
        folderId: folder.id,
        uid: fetched.uid,
      });

      const flags = fetched.flags ? Array.from(fetched.flags) : [];
      const msgId = uuid();
      const fullMessage: Message = {
        ...message,
        id: msgId,
        isRead: flags.includes('\\Seen'),
        isStarred: flags.includes('\\Flagged'),
        isAnswered: flags.includes('\\Answered'),
        isDraft: flags.includes('\\Draft'),
      };

      await this.messageRepo.upsert(fullMessage);

      for (const att of attachments) {
        await this.attachmentRepo.create({
          id: uuid(),
          messageId: msgId,
          ...att,
        });
      }

      for (const addr of [...message.from, ...message.to, ...message.cc]) {
        if (addr.address) {
          await this.contactRepo.upsert({
            accountId,
            name: addr.name,
            email: addr.address,
            lastUsed: message.date,
            usageCount: 1,
          });
        }
      }

      newMessages++;
    }

    const status = await conn.imap.getMailboxStatus(folderPath);
    await this.folderRepo.updateCounts(folder.id, status.unseen, status.messages);

    conn.status.lastSync = new Date();

    return { newMessages, updatedMessages: 0, deletedMessages: 0, folders: 0 };
  }

  async getFolders(accountId: string): Promise<Folder[]> {
    return this.folderRepo.findByAccount(accountId);
  }

  async getMessages(
    folderId: string,
    options?: { limit?: number; offset?: number; since?: Date; before?: Date },
  ): Promise<Message[]> {
    return this.messageRepo.findByFolder(folderId, options);
  }

  async getMessage(messageId: string): Promise<Message | null> {
    const msg = await this.messageRepo.findById(messageId);
    if (!msg) return null;
    const atts = await this.attachmentRepo.findByMessage(messageId);
    return { ...msg, attachments: atts };
  }

  async markAsRead(accountId: string, messageId: string, folderPath: string, uid: number): Promise<void> {
    const conn = this.getConnection(accountId);
    await conn.imap.setFlags(folderPath, uid, ['\\Seen'], 'add');
    await this.messageRepo.updateFlags(messageId, { isRead: true });
  }

  async markAsStarred(accountId: string, messageId: string, folderPath: string, uid: number, starred: boolean): Promise<void> {
    const conn = this.getConnection(accountId);
    await conn.imap.setFlags(folderPath, uid, ['\\Flagged'], starred ? 'add' : 'remove');
    await this.messageRepo.updateFlags(messageId, { isStarred: starred });
  }

  async moveMessage(accountId: string, messageId: string, fromFolder: string, toFolder: string, uid: number): Promise<void> {
    const conn = this.getConnection(accountId);
    await conn.imap.moveMessage(fromFolder, uid, toFolder);
    const destFolder = await this.folderRepo.findByPath(accountId, toFolder);
    if (destFolder) {
      await this.messageRepo.updateFlags(messageId, {});
    }
  }

  async deleteMessage(accountId: string, messageId: string, folderPath: string, uid: number): Promise<void> {
    const conn = this.getConnection(accountId);
    await conn.imap.deleteMessage(folderPath, uid);
    await this.messageRepo.delete(messageId);
  }

  async sendMail(accountId: string, options: SendMailOptions): Promise<{ messageId: string }> {
    const conn = this.getConnection(accountId);
    const result = await conn.smtp.send(options);

    for (const addr of [...options.to, ...(options.cc || []), ...(options.bcc || [])]) {
      if (addr.address) {
        await this.contactRepo.upsert({
          accountId,
          name: addr.name,
          email: addr.address,
          lastUsed: new Date(),
          usageCount: 1,
        });
      }
    }

    return { messageId: result.messageId };
  }

  async searchMessages(accountId: string, query: string, limit?: number): Promise<Message[]> {
    return this.messageRepo.search(accountId, query, limit);
  }

  async searchContacts(accountId: string, query: string) {
    return this.contactRepo.search(accountId, query);
  }

  private getConnection(accountId: string): AccountConnection {
    const conn = this.connections.get(accountId);
    if (!conn) throw new Error(`Account ${accountId} not connected`);
    return conn;
  }
}

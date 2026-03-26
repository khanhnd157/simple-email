import { eq, desc, and, like, gte, lte, sql } from 'drizzle-orm';
import type { LibSQLDatabase } from 'drizzle-orm/libsql';
import { v4 as uuid } from 'uuid';
import * as schema from './schema.js';
import type { AccountConfig, Folder, Message, Contact, Address, Attachment } from '../types/index.js';

type DB = LibSQLDatabase<typeof schema>;

function serializeAddresses(addrs: Address[]): string {
  return JSON.stringify(addrs);
}

function deserializeAddresses(json: string): Address[] {
  try {
    return JSON.parse(json);
  } catch {
    return [];
  }
}

export class AccountRepository {
  constructor(private db: DB) {}

  async create(config: Omit<AccountConfig, 'id'>): Promise<AccountConfig> {
    const id = uuid();
    const now = new Date();
    await this.db.insert(schema.accounts).values({
      id,
      name: config.name,
      email: config.email,
      imapHost: config.imapHost,
      imapPort: config.imapPort,
      imapSecure: config.imapSecure,
      smtpHost: config.smtpHost,
      smtpPort: config.smtpPort,
      smtpSecure: config.smtpSecure,
      authType: config.authType,
      username: config.username,
      encryptedPassword: config.password,
      accessToken: config.accessToken,
      refreshToken: config.refreshToken,
      createdAt: now,
      updatedAt: now,
    });
    return { id, ...config };
  }

  async findAll(): Promise<AccountConfig[]> {
    const rows = await this.db.select().from(schema.accounts);
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      imapHost: r.imapHost,
      imapPort: r.imapPort,
      imapSecure: r.imapSecure,
      smtpHost: r.smtpHost,
      smtpPort: r.smtpPort,
      smtpSecure: r.smtpSecure,
      authType: r.authType as AccountConfig['authType'],
      username: r.username,
      password: r.encryptedPassword ?? undefined,
      accessToken: r.accessToken ?? undefined,
      refreshToken: r.refreshToken ?? undefined,
    }));
  }

  async findById(id: string): Promise<AccountConfig | null> {
    const rows = await this.db.select().from(schema.accounts).where(eq(schema.accounts.id, id));
    if (rows.length === 0) return null;
    const r = rows[0];
    return {
      id: r.id,
      name: r.name,
      email: r.email,
      imapHost: r.imapHost,
      imapPort: r.imapPort,
      imapSecure: r.imapSecure,
      smtpHost: r.smtpHost,
      smtpPort: r.smtpPort,
      smtpSecure: r.smtpSecure,
      authType: r.authType as AccountConfig['authType'],
      username: r.username,
      password: r.encryptedPassword ?? undefined,
      accessToken: r.accessToken ?? undefined,
      refreshToken: r.refreshToken ?? undefined,
    };
  }

  async update(id: string, data: Partial<AccountConfig>): Promise<void> {
    await this.db
      .update(schema.accounts)
      .set({
        ...(data.name && { name: data.name }),
        ...(data.email && { email: data.email }),
        ...(data.imapHost && { imapHost: data.imapHost }),
        ...(data.imapPort && { imapPort: data.imapPort }),
        ...(data.imapSecure !== undefined && { imapSecure: data.imapSecure }),
        ...(data.smtpHost && { smtpHost: data.smtpHost }),
        ...(data.smtpPort && { smtpPort: data.smtpPort }),
        ...(data.smtpSecure !== undefined && { smtpSecure: data.smtpSecure }),
        ...(data.password && { encryptedPassword: data.password }),
        ...(data.accessToken && { accessToken: data.accessToken }),
        ...(data.refreshToken && { refreshToken: data.refreshToken }),
        updatedAt: new Date(),
      })
      .where(eq(schema.accounts.id, id));
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(schema.accounts).where(eq(schema.accounts.id, id));
  }
}

export class FolderRepository {
  constructor(private db: DB) {}

  async upsert(folder: Omit<Folder, 'id'> & { id?: string }): Promise<Folder> {
    const id = folder.id ?? uuid();
    const existing = await this.db
      .select()
      .from(schema.folders)
      .where(and(eq(schema.folders.accountId, folder.accountId), eq(schema.folders.path, folder.path)));

    if (existing.length > 0) {
      await this.db
        .update(schema.folders)
        .set({
          name: folder.name,
          type: folder.type,
          unreadCount: folder.unreadCount,
          totalCount: folder.totalCount,
        })
        .where(eq(schema.folders.id, existing[0].id));
      return { ...folder, id: existing[0].id };
    }

    await this.db.insert(schema.folders).values({
      id,
      accountId: folder.accountId,
      name: folder.name,
      path: folder.path,
      type: folder.type,
      delimiter: folder.delimiter,
      unreadCount: folder.unreadCount,
      totalCount: folder.totalCount,
      parentPath: folder.parentPath,
    });
    return { ...folder, id };
  }

  async findByAccount(accountId: string): Promise<Folder[]> {
    const rows = await this.db
      .select()
      .from(schema.folders)
      .where(eq(schema.folders.accountId, accountId));
    return rows.map((r) => ({
      id: r.id,
      accountId: r.accountId,
      name: r.name,
      path: r.path,
      type: r.type as Folder['type'],
      delimiter: r.delimiter,
      unreadCount: r.unreadCount,
      totalCount: r.totalCount,
      parentPath: r.parentPath ?? undefined,
    }));
  }

  async findByPath(accountId: string, path: string): Promise<Folder | null> {
    const rows = await this.db
      .select()
      .from(schema.folders)
      .where(and(eq(schema.folders.accountId, accountId), eq(schema.folders.path, path)));
    if (rows.length === 0) return null;
    const r = rows[0];
    return {
      id: r.id,
      accountId: r.accountId,
      name: r.name,
      path: r.path,
      type: r.type as Folder['type'],
      delimiter: r.delimiter,
      unreadCount: r.unreadCount,
      totalCount: r.totalCount,
      parentPath: r.parentPath ?? undefined,
    };
  }

  async updateCounts(id: string, unread: number, total: number): Promise<void> {
    await this.db
      .update(schema.folders)
      .set({ unreadCount: unread, totalCount: total })
      .where(eq(schema.folders.id, id));
  }

  async deleteByAccount(accountId: string): Promise<void> {
    await this.db.delete(schema.folders).where(eq(schema.folders.accountId, accountId));
  }
}

export class MessageRepository {
  constructor(private db: DB) {}

  async upsert(msg: Message): Promise<void> {
    const values = {
      id: msg.id,
      accountId: msg.accountId,
      folderId: msg.folderId,
      uid: msg.uid,
      messageId: msg.messageId,
      subject: msg.subject,
      fromAddresses: serializeAddresses(msg.from),
      toAddresses: serializeAddresses(msg.to),
      ccAddresses: serializeAddresses(msg.cc),
      bccAddresses: serializeAddresses(msg.bcc),
      replyToAddresses: serializeAddresses(msg.replyTo),
      date: msg.date,
      snippet: msg.snippet,
      bodyHtml: msg.bodyHtml,
      bodyText: msg.bodyText,
      isRead: msg.isRead,
      isStarred: msg.isStarred,
      isAnswered: msg.isAnswered,
      isDraft: msg.isDraft,
      hasAttachments: msg.hasAttachments,
      priority: msg.priority,
      inReplyTo: msg.inReplyTo,
      references: JSON.stringify(msg.references),
      headersJson: JSON.stringify(msg.headers),
      size: msg.size,
    };

    await this.db
      .insert(schema.messages)
      .values(values)
      .onConflictDoUpdate({
        target: schema.messages.id,
        set: {
          isRead: values.isRead,
          isStarred: values.isStarred,
          isAnswered: values.isAnswered,
          folderId: values.folderId,
        },
      });
  }

  async findByFolder(
    folderId: string,
    options?: { limit?: number; offset?: number; since?: Date; before?: Date },
  ): Promise<Message[]> {
    const conditions = [eq(schema.messages.folderId, folderId)];
    if (options?.since) conditions.push(gte(schema.messages.date, options.since));
    if (options?.before) conditions.push(lte(schema.messages.date, options.before));

    const rows = await this.db
      .select()
      .from(schema.messages)
      .where(and(...conditions))
      .orderBy(desc(schema.messages.date))
      .limit(options?.limit ?? 50)
      .offset(options?.offset ?? 0);

    return rows.map(this.rowToMessage);
  }

  async findById(id: string): Promise<Message | null> {
    const rows = await this.db.select().from(schema.messages).where(eq(schema.messages.id, id));
    if (rows.length === 0) return null;
    return this.rowToMessage(rows[0]);
  }

  async findByMessageId(messageId: string): Promise<Message | null> {
    const rows = await this.db
      .select()
      .from(schema.messages)
      .where(eq(schema.messages.messageId, messageId));
    if (rows.length === 0) return null;
    return this.rowToMessage(rows[0]);
  }

  async search(accountId: string, query: string, limit = 50): Promise<Message[]> {
    const rows = await this.db
      .select()
      .from(schema.messages)
      .where(
        and(
          eq(schema.messages.accountId, accountId),
          sql`(${schema.messages.subject} LIKE ${'%' + query + '%'} OR ${schema.messages.bodyText} LIKE ${'%' + query + '%'})`,
        ),
      )
      .orderBy(desc(schema.messages.date))
      .limit(limit);

    return rows.map(this.rowToMessage);
  }

  async updateFlags(
    id: string,
    flags: { isRead?: boolean; isStarred?: boolean; isAnswered?: boolean },
  ): Promise<void> {
    await this.db
      .update(schema.messages)
      .set({
        ...(flags.isRead !== undefined && { isRead: flags.isRead }),
        ...(flags.isStarred !== undefined && { isStarred: flags.isStarred }),
        ...(flags.isAnswered !== undefined && { isAnswered: flags.isAnswered }),
      })
      .where(eq(schema.messages.id, id));
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(schema.messages).where(eq(schema.messages.id, id));
  }

  async deleteByFolder(folderId: string): Promise<void> {
    await this.db.delete(schema.messages).where(eq(schema.messages.folderId, folderId));
  }

  async getMaxUid(folderId: string): Promise<number> {
    const result = await this.db
      .select({ maxUid: sql<number>`MAX(${schema.messages.uid})` })
      .from(schema.messages)
      .where(eq(schema.messages.folderId, folderId));
    return result[0]?.maxUid ?? 0;
  }

  private rowToMessage(r: typeof schema.messages.$inferSelect): Message {
    return {
      id: r.id,
      accountId: r.accountId,
      folderId: r.folderId,
      uid: r.uid,
      messageId: r.messageId,
      subject: r.subject,
      from: deserializeAddresses(r.fromAddresses),
      to: deserializeAddresses(r.toAddresses),
      cc: deserializeAddresses(r.ccAddresses),
      bcc: deserializeAddresses(r.bccAddresses),
      replyTo: deserializeAddresses(r.replyToAddresses),
      date: r.date,
      snippet: r.snippet,
      bodyHtml: r.bodyHtml,
      bodyText: r.bodyText,
      isRead: r.isRead,
      isStarred: r.isStarred,
      isAnswered: r.isAnswered,
      isDraft: r.isDraft,
      hasAttachments: r.hasAttachments,
      priority: r.priority as Message['priority'],
      inReplyTo: r.inReplyTo ?? undefined,
      references: JSON.parse(r.references),
      headers: JSON.parse(r.headersJson),
      size: r.size,
      attachments: [],
    };
  }
}

export class AttachmentRepository {
  constructor(private db: DB) {}

  async create(attachment: Omit<Attachment, 'content'>): Promise<void> {
    await this.db.insert(schema.attachments).values({
      id: attachment.id,
      messageId: attachment.messageId,
      filename: attachment.filename,
      contentType: attachment.contentType,
      size: attachment.size,
      contentId: attachment.contentId,
    });
  }

  async findByMessage(messageId: string): Promise<Attachment[]> {
    const rows = await this.db
      .select()
      .from(schema.attachments)
      .where(eq(schema.attachments.messageId, messageId));
    return rows.map((r) => ({
      id: r.id,
      messageId: r.messageId,
      filename: r.filename,
      contentType: r.contentType,
      size: r.size,
      contentId: r.contentId ?? undefined,
    }));
  }
}

export class ContactRepository {
  constructor(private db: DB) {}

  async upsert(contact: Omit<Contact, 'id'> & { id?: string }): Promise<void> {
    const id = contact.id ?? uuid();
    const existing = await this.db
      .select()
      .from(schema.contacts)
      .where(
        and(
          eq(schema.contacts.accountId, contact.accountId),
          eq(schema.contacts.email, contact.email),
        ),
      );

    if (existing.length > 0) {
      await this.db
        .update(schema.contacts)
        .set({
          name: contact.name,
          lastUsed: contact.lastUsed,
          usageCount: contact.usageCount,
        })
        .where(eq(schema.contacts.id, existing[0].id));
    } else {
      await this.db.insert(schema.contacts).values({
        id,
        accountId: contact.accountId,
        name: contact.name,
        email: contact.email,
        lastUsed: contact.lastUsed,
        usageCount: contact.usageCount,
      });
    }
  }

  async search(accountId: string, query: string, limit = 20): Promise<Contact[]> {
    const rows = await this.db
      .select()
      .from(schema.contacts)
      .where(
        and(
          eq(schema.contacts.accountId, accountId),
          sql`(${schema.contacts.name} LIKE ${'%' + query + '%'} OR ${schema.contacts.email} LIKE ${'%' + query + '%'})`,
        ),
      )
      .orderBy(desc(schema.contacts.usageCount))
      .limit(limit);

    return rows.map((r) => ({
      id: r.id,
      accountId: r.accountId,
      name: r.name,
      email: r.email,
      lastUsed: r.lastUsed,
      usageCount: r.usageCount,
    }));
  }

  async findAll(accountId: string): Promise<Contact[]> {
    const rows = await this.db
      .select()
      .from(schema.contacts)
      .where(eq(schema.contacts.accountId, accountId))
      .orderBy(desc(schema.contacts.usageCount));

    return rows.map((r) => ({
      id: r.id,
      accountId: r.accountId,
      name: r.name,
      email: r.email,
      lastUsed: r.lastUsed,
      usageCount: r.usageCount,
    }));
  }
}

import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const accounts = sqliteTable('accounts', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  imapHost: text('imap_host').notNull(),
  imapPort: integer('imap_port').notNull(),
  imapSecure: integer('imap_secure', { mode: 'boolean' }).notNull().default(true),
  smtpHost: text('smtp_host').notNull(),
  smtpPort: integer('smtp_port').notNull(),
  smtpSecure: integer('smtp_secure', { mode: 'boolean' }).notNull().default(true),
  authType: text('auth_type').notNull().default('password'),
  username: text('username').notNull(),
  encryptedPassword: text('encrypted_password'),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const folders = sqliteTable('folders', {
  id: text('id').primaryKey(),
  accountId: text('account_id')
    .notNull()
    .references(() => accounts.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  path: text('path').notNull(),
  type: text('type').notNull().default('custom'),
  delimiter: text('delimiter').notNull().default('/'),
  unreadCount: integer('unread_count').notNull().default(0),
  totalCount: integer('total_count').notNull().default(0),
  parentPath: text('parent_path'),
});

export const messages = sqliteTable('messages', {
  id: text('id').primaryKey(),
  accountId: text('account_id')
    .notNull()
    .references(() => accounts.id, { onDelete: 'cascade' }),
  folderId: text('folder_id')
    .notNull()
    .references(() => folders.id, { onDelete: 'cascade' }),
  uid: integer('uid').notNull(),
  messageId: text('message_id').notNull(),
  subject: text('subject').notNull().default(''),
  fromAddresses: text('from_addresses').notNull().default('[]'),
  toAddresses: text('to_addresses').notNull().default('[]'),
  ccAddresses: text('cc_addresses').notNull().default('[]'),
  bccAddresses: text('bcc_addresses').notNull().default('[]'),
  replyToAddresses: text('reply_to_addresses').notNull().default('[]'),
  date: integer('date', { mode: 'timestamp' }).notNull(),
  snippet: text('snippet').notNull().default(''),
  bodyHtml: text('body_html').notNull().default(''),
  bodyText: text('body_text').notNull().default(''),
  isRead: integer('is_read', { mode: 'boolean' }).notNull().default(false),
  isStarred: integer('is_starred', { mode: 'boolean' }).notNull().default(false),
  isAnswered: integer('is_answered', { mode: 'boolean' }).notNull().default(false),
  isDraft: integer('is_draft', { mode: 'boolean' }).notNull().default(false),
  hasAttachments: integer('has_attachments', { mode: 'boolean' }).notNull().default(false),
  priority: text('priority').notNull().default('normal'),
  inReplyTo: text('in_reply_to'),
  references: text('msg_references').notNull().default('[]'),
  headersJson: text('headers_json').notNull().default('{}'),
  size: integer('size').notNull().default(0),
});

export const attachments = sqliteTable('attachments', {
  id: text('id').primaryKey(),
  messageId: text('message_id')
    .notNull()
    .references(() => messages.id, { onDelete: 'cascade' }),
  filename: text('filename').notNull(),
  contentType: text('content_type').notNull(),
  size: integer('size').notNull(),
  contentId: text('content_id'),
  storagePath: text('storage_path'),
});

export const contacts = sqliteTable('contacts', {
  id: text('id').primaryKey(),
  accountId: text('account_id')
    .notNull()
    .references(() => accounts.id, { onDelete: 'cascade' }),
  name: text('name').notNull().default(''),
  email: text('email').notNull(),
  lastUsed: integer('last_used', { mode: 'timestamp' }).notNull(),
  usageCount: integer('usage_count').notNull().default(0),
});

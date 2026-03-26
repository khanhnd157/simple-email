import { createClient, type Client } from '@libsql/client';
import { drizzle, type LibSQLDatabase } from 'drizzle-orm/libsql';
import * as schema from './schema.js';

let client: Client | null = null;
let db: LibSQLDatabase<typeof schema> | null = null;

export function getDatabase(dbPath?: string): LibSQLDatabase<typeof schema> {
  if (db) return db;

  const url = dbPath ? `file:${dbPath}` : 'file:simple-email.db';
  client = createClient({ url });
  db = drizzle(client, { schema });

  return db;
}

export async function initDatabase(dbPath?: string): Promise<LibSQLDatabase<typeof schema>> {
  const database = getDatabase(dbPath);

  const raw = client!;
  await raw.executeMultiple(`
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      imap_host TEXT NOT NULL,
      imap_port INTEGER NOT NULL,
      imap_secure INTEGER NOT NULL DEFAULT 1,
      smtp_host TEXT NOT NULL,
      smtp_port INTEGER NOT NULL,
      smtp_secure INTEGER NOT NULL DEFAULT 1,
      auth_type TEXT NOT NULL DEFAULT 'password',
      username TEXT NOT NULL,
      encrypted_password TEXT,
      access_token TEXT,
      refresh_token TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS folders (
      id TEXT PRIMARY KEY,
      account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      path TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'custom',
      delimiter TEXT NOT NULL DEFAULT '/',
      unread_count INTEGER NOT NULL DEFAULT 0,
      total_count INTEGER NOT NULL DEFAULT 0,
      parent_path TEXT
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
      folder_id TEXT NOT NULL REFERENCES folders(id) ON DELETE CASCADE,
      uid INTEGER NOT NULL,
      message_id TEXT NOT NULL,
      subject TEXT NOT NULL DEFAULT '',
      from_addresses TEXT NOT NULL DEFAULT '[]',
      to_addresses TEXT NOT NULL DEFAULT '[]',
      cc_addresses TEXT NOT NULL DEFAULT '[]',
      bcc_addresses TEXT NOT NULL DEFAULT '[]',
      reply_to_addresses TEXT NOT NULL DEFAULT '[]',
      date INTEGER NOT NULL,
      snippet TEXT NOT NULL DEFAULT '',
      body_html TEXT NOT NULL DEFAULT '',
      body_text TEXT NOT NULL DEFAULT '',
      is_read INTEGER NOT NULL DEFAULT 0,
      is_starred INTEGER NOT NULL DEFAULT 0,
      is_answered INTEGER NOT NULL DEFAULT 0,
      is_draft INTEGER NOT NULL DEFAULT 0,
      has_attachments INTEGER NOT NULL DEFAULT 0,
      priority TEXT NOT NULL DEFAULT 'normal',
      in_reply_to TEXT,
      msg_references TEXT NOT NULL DEFAULT '[]',
      headers_json TEXT NOT NULL DEFAULT '{}',
      size INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS attachments (
      id TEXT PRIMARY KEY,
      message_id TEXT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
      filename TEXT NOT NULL,
      content_type TEXT NOT NULL,
      size INTEGER NOT NULL,
      content_id TEXT,
      storage_path TEXT
    );

    CREATE TABLE IF NOT EXISTS contacts (
      id TEXT PRIMARY KEY,
      account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
      name TEXT NOT NULL DEFAULT '',
      email TEXT NOT NULL,
      last_used INTEGER NOT NULL,
      usage_count INTEGER NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_messages_folder ON messages(folder_id);
    CREATE INDEX IF NOT EXISTS idx_messages_account ON messages(account_id);
    CREATE INDEX IF NOT EXISTS idx_messages_date ON messages(date);
    CREATE INDEX IF NOT EXISTS idx_messages_message_id ON messages(message_id);
    CREATE INDEX IF NOT EXISTS idx_folders_account ON folders(account_id);
    CREATE INDEX IF NOT EXISTS idx_contacts_account ON contacts(account_id);
    CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
  `);

  return database;
}

export function closeDatabase(): void {
  if (client) {
    client.close();
    client = null;
    db = null;
  }
}

export { schema };

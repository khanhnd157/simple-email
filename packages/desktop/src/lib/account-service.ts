// @ts-nocheck
import { getDB, persistDB } from './database';
import type { SecurityType, AuthType } from './email-autoconfig';

export interface AccountRecord {
  id: string;
  name: string;
  email: string;
  imapHost: string;
  imapPort: number;
  imapSecurity: SecurityType;
  imapAuth: AuthType;
  imapUsername: string;
  smtpHost: string;
  smtpPort: number;
  smtpSecurity: SecurityType;
  smtpAuth: AuthType;
  smtpUsername: string;
  password?: string;
  createdAt: number;
  updatedAt: number;
}

export interface CreateAccountInput {
  name: string;
  email: string;
  imapHost: string;
  imapPort: number;
  imapSecurity: SecurityType;
  imapAuth: AuthType;
  imapUsername: string;
  smtpHost: string;
  smtpPort: number;
  smtpSecurity: SecurityType;
  smtpAuth: AuthType;
  smtpUsername: string;
  password?: string;
}

function generateId(): string {
  return crypto.randomUUID();
}

export async function createAccount(input: CreateAccountInput): Promise<AccountRecord> {
  const db = await getDB();
  const id = generateId();
  const now = Date.now();

  db.run(
    `INSERT INTO accounts (id, name, email, imap_host, imap_port, imap_security, imap_auth, imap_username,
      smtp_host, smtp_port, smtp_security, smtp_auth, smtp_username, password, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, input.name, input.email, input.imapHost, input.imapPort, input.imapSecurity, input.imapAuth, input.imapUsername,
      input.smtpHost, input.smtpPort, input.smtpSecurity, input.smtpAuth, input.smtpUsername, input.password ?? null, now, now]
  );

  await persistDB();

  return { id, ...input, createdAt: now, updatedAt: now };
}

export async function getAllAccounts(): Promise<AccountRecord[]> {
  const db = await getDB();
  const results = db.exec('SELECT * FROM accounts ORDER BY created_at ASC');
  if (!results.length) return [];

  const { columns, values } = results[0];
  return values.map((row) => {
    const obj: Record<string, unknown> = {};
    columns.forEach((col, i) => { obj[col] = row[i]; });
    return {
      id: obj.id as string,
      name: obj.name as string,
      email: obj.email as string,
      imapHost: obj.imap_host as string,
      imapPort: obj.imap_port as number,
      imapSecurity: obj.imap_security as SecurityType,
      imapAuth: obj.imap_auth as AuthType,
      imapUsername: obj.imap_username as string,
      smtpHost: obj.smtp_host as string,
      smtpPort: obj.smtp_port as number,
      smtpSecurity: obj.smtp_security as SecurityType,
      smtpAuth: obj.smtp_auth as AuthType,
      smtpUsername: obj.smtp_username as string,
      password: (obj.password as string) ?? undefined,
      createdAt: obj.created_at as number,
      updatedAt: obj.updated_at as number,
    };
  });
}

export async function deleteAccount(id: string): Promise<void> {
  const db = await getDB();
  db.run('DELETE FROM accounts WHERE id = ?', [id]);
  await persistDB();
}

export async function updateAccount(id: string, data: Partial<CreateAccountInput>): Promise<void> {
  const db = await getDB();
  const sets: string[] = [];
  const params: unknown[] = [];

  const fieldMap: Record<string, string> = {
    name: 'name', email: 'email',
    imapHost: 'imap_host', imapPort: 'imap_port', imapSecurity: 'imap_security',
    imapAuth: 'imap_auth', imapUsername: 'imap_username',
    smtpHost: 'smtp_host', smtpPort: 'smtp_port', smtpSecurity: 'smtp_security',
    smtpAuth: 'smtp_auth', smtpUsername: 'smtp_username', password: 'password',
  };

  for (const [key, col] of Object.entries(fieldMap)) {
    if ((data as Record<string, unknown>)[key] !== undefined) {
      sets.push(`${col} = ?`);
      params.push((data as Record<string, unknown>)[key]);
    }
  }

  if (!sets.length) return;

  sets.push('updated_at = ?');
  params.push(Date.now());
  params.push(id);

  db.run(`UPDATE accounts SET ${sets.join(', ')} WHERE id = ?`, params);
  await persistDB();
}

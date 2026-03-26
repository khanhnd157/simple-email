import * as fs from 'fs';
import * as path from 'path';

export interface ThunderbirdAccount {
  name: string;
  email: string;
  incomingServer: { type: string; host: string; port: number };
  outgoingServer: { host: string; port: number };
}

export interface ThunderbirdProfile {
  path: string;
  accounts: ThunderbirdAccount[];
  mailFolders: string[];
  addressBooks: string[];
}

export interface MboxMessage {
  from: string;
  date: string;
  raw: string;
}

export function parsePrefsJs(content: string): Record<string, string> {
  const prefs: Record<string, string> = {};
  const regex = /user_pref\("([^"]+)",\s*"?([^")]*)"?\);/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    prefs[match[1]] = match[2];
  }
  return prefs;
}

export function extractAccounts(prefs: Record<string, string>): ThunderbirdAccount[] {
  const accounts: ThunderbirdAccount[] = [];
  const accountList = prefs['mail.accountmanager.accounts']?.split(',') || [];

  for (const accKey of accountList) {
    const key = accKey.trim();
    if (!key) continue;

    const serverId = prefs[`mail.account.${key}.server`];
    if (!serverId) continue;

    const name = prefs[`mail.server.${serverId}.name`] || '';
    const type = prefs[`mail.server.${serverId}.type`] || 'imap';
    const host = prefs[`mail.server.${serverId}.hostname`] || '';
    const port = parseInt(prefs[`mail.server.${serverId}.port`] || '993', 10);
    const email = prefs[`mail.server.${serverId}.userName`] || '';

    const smtpKey = prefs[`mail.account.${key}.identities`]?.split(',')[0]?.trim();
    const smtpId = smtpKey ? prefs[`mail.identity.${smtpKey}.smtpServer`] : undefined;
    const smtpHost = smtpId ? prefs[`mail.smtpserver.${smtpId}.hostname`] || '' : host;
    const smtpPort = smtpId ? parseInt(prefs[`mail.smtpserver.${smtpId}.port`] || '465', 10) : 465;

    accounts.push({
      name: name || email,
      email,
      incomingServer: { type, host, port },
      outgoingServer: { host: smtpHost, port: smtpPort },
    });
  }

  return accounts;
}

export function* parseMbox(content: string): Generator<MboxMessage> {
  const lines = content.split('\n');
  let currentFrom = '';
  let currentDate = '';
  let currentLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith('From ')) {
      if (currentLines.length > 0) {
        yield {
          from: currentFrom,
          date: currentDate,
          raw: currentLines.join('\n'),
        };
      }
      const parts = line.slice(5).split(' ');
      currentFrom = parts[0] || '';
      currentDate = parts.slice(1).join(' ');
      currentLines = [];
    } else {
      const unescaped = line.startsWith('>From ') ? line.slice(1) : line;
      currentLines.push(unescaped);
    }
  }

  if (currentLines.length > 0) {
    yield { from: currentFrom, date: currentDate, raw: currentLines.join('\n') };
  }
}

export async function scanProfile(profilePath: string): Promise<ThunderbirdProfile> {
  const prefsPath = path.join(profilePath, 'prefs.js');
  const accounts: ThunderbirdAccount[] = [];
  const mailFolders: string[] = [];
  const addressBooks: string[] = [];

  if (fs.existsSync(prefsPath)) {
    const content = fs.readFileSync(prefsPath, 'utf-8');
    const prefs = parsePrefsJs(content);
    accounts.push(...extractAccounts(prefs));
  }

  const mailDir = path.join(profilePath, 'Mail');
  if (fs.existsSync(mailDir)) {
    const scanDir = (dir: string) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.isDirectory()) {
          scanDir(path.join(dir, entry.name));
        } else if (!entry.name.endsWith('.msf') && !entry.name.startsWith('.')) {
          const ext = path.extname(entry.name);
          if (!ext || ext === '.sbd') {
            mailFolders.push(path.join(dir, entry.name));
          }
        }
      }
    };
    scanDir(mailDir);
  }

  const abookPath = path.join(profilePath, 'abook.sqlite');
  if (fs.existsSync(abookPath)) addressBooks.push(abookPath);
  const historyPath = path.join(profilePath, 'history.sqlite');
  if (fs.existsSync(historyPath)) addressBooks.push(historyPath);

  return { path: profilePath, accounts, mailFolders, addressBooks };
}

export function getDefaultProfilePaths(): string[] {
  const paths: string[] = [];
  const home = process.env.HOME || process.env.USERPROFILE || '';

  if (process.platform === 'win32') {
    paths.push(path.join(home, 'AppData', 'Roaming', 'Thunderbird', 'Profiles'));
  } else if (process.platform === 'darwin') {
    paths.push(path.join(home, 'Library', 'Thunderbird', 'Profiles'));
  } else {
    paths.push(path.join(home, '.thunderbird'));
  }

  return paths.filter(fs.existsSync);
}

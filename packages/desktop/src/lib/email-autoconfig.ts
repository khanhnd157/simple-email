export type SecurityType = 'ssl' | 'starttls' | 'none';
export type AuthType = 'password' | 'oauth2' | 'none';

export interface ServerEntry {
  host: string;
  port: number;
  security: SecurityType;
  auth: AuthType;
}

export interface MailServerConfig {
  provider: string;
  imap: ServerEntry;
  smtp: ServerEntry;
}

const KNOWN_PROVIDERS: Record<string, MailServerConfig> = {
  'gmail.com': {
    provider: 'Google Gmail',
    imap: { host: 'imap.gmail.com', port: 993, security: 'ssl', auth: 'password' },
    smtp: { host: 'smtp.gmail.com', port: 465, security: 'ssl', auth: 'password' },
  },
  'googlemail.com': {
    provider: 'Google Gmail',
    imap: { host: 'imap.gmail.com', port: 993, security: 'ssl', auth: 'password' },
    smtp: { host: 'smtp.gmail.com', port: 465, security: 'ssl', auth: 'password' },
  },
  'outlook.com': {
    provider: 'Microsoft Outlook',
    imap: { host: 'outlook.office365.com', port: 993, security: 'ssl', auth: 'oauth2' },
    smtp: { host: 'smtp.office365.com', port: 587, security: 'starttls', auth: 'oauth2' },
  },
  'hotmail.com': {
    provider: 'Microsoft Outlook',
    imap: { host: 'outlook.office365.com', port: 993, security: 'ssl', auth: 'oauth2' },
    smtp: { host: 'smtp.office365.com', port: 587, security: 'starttls', auth: 'oauth2' },
  },
  'live.com': {
    provider: 'Microsoft Outlook',
    imap: { host: 'outlook.office365.com', port: 993, security: 'ssl', auth: 'oauth2' },
    smtp: { host: 'smtp.office365.com', port: 587, security: 'starttls', auth: 'oauth2' },
  },
  'yahoo.com': {
    provider: 'Yahoo Mail',
    imap: { host: 'imap.mail.yahoo.com', port: 993, security: 'ssl', auth: 'password' },
    smtp: { host: 'smtp.mail.yahoo.com', port: 465, security: 'ssl', auth: 'password' },
  },
  'icloud.com': {
    provider: 'Apple iCloud',
    imap: { host: 'imap.mail.me.com', port: 993, security: 'ssl', auth: 'password' },
    smtp: { host: 'smtp.mail.me.com', port: 587, security: 'starttls', auth: 'password' },
  },
  'me.com': {
    provider: 'Apple iCloud',
    imap: { host: 'imap.mail.me.com', port: 993, security: 'ssl', auth: 'password' },
    smtp: { host: 'smtp.mail.me.com', port: 587, security: 'starttls', auth: 'password' },
  },
  'zoho.com': {
    provider: 'Zoho Mail',
    imap: { host: 'imap.zoho.com', port: 993, security: 'ssl', auth: 'password' },
    smtp: { host: 'smtp.zoho.com', port: 465, security: 'ssl', auth: 'password' },
  },
  'zohomail.com': {
    provider: 'Zoho Mail',
    imap: { host: 'imap.zoho.com', port: 993, security: 'ssl', auth: 'password' },
    smtp: { host: 'smtp.zoho.com', port: 465, security: 'ssl', auth: 'password' },
  },
  'protonmail.com': {
    provider: 'ProtonMail (Bridge required)',
    imap: { host: '127.0.0.1', port: 1143, security: 'starttls', auth: 'password' },
    smtp: { host: '127.0.0.1', port: 1025, security: 'starttls', auth: 'password' },
  },
  'proton.me': {
    provider: 'ProtonMail (Bridge required)',
    imap: { host: '127.0.0.1', port: 1143, security: 'starttls', auth: 'password' },
    smtp: { host: '127.0.0.1', port: 1025, security: 'starttls', auth: 'password' },
  },
  'aol.com': {
    provider: 'AOL Mail',
    imap: { host: 'imap.aol.com', port: 993, security: 'ssl', auth: 'password' },
    smtp: { host: 'smtp.aol.com', port: 465, security: 'ssl', auth: 'password' },
  },
  'yandex.com': {
    provider: 'Yandex Mail',
    imap: { host: 'imap.yandex.com', port: 993, security: 'ssl', auth: 'password' },
    smtp: { host: 'smtp.yandex.com', port: 465, security: 'ssl', auth: 'password' },
  },
  'mail.ru': {
    provider: 'Mail.ru',
    imap: { host: 'imap.mail.ru', port: 993, security: 'ssl', auth: 'password' },
    smtp: { host: 'smtp.mail.ru', port: 465, security: 'ssl', auth: 'password' },
  },
  'fastmail.com': {
    provider: 'Fastmail',
    imap: { host: 'imap.fastmail.com', port: 993, security: 'ssl', auth: 'password' },
    smtp: { host: 'smtp.fastmail.com', port: 465, security: 'ssl', auth: 'password' },
  },
  'gmx.com': {
    provider: 'GMX Mail',
    imap: { host: 'imap.gmx.com', port: 993, security: 'ssl', auth: 'password' },
    smtp: { host: 'mail.gmx.com', port: 465, security: 'ssl', auth: 'password' },
  },
};

function guessFromDomain(domain: string): MailServerConfig {
  return {
    provider: domain,
    imap: { host: `imap.${domain}`, port: 993, security: 'ssl', auth: 'password' },
    smtp: { host: `smtp.${domain}`, port: 465, security: 'ssl', auth: 'password' },
  };
}

export function detectMailConfig(email: string): MailServerConfig | null {
  const atIdx = email.indexOf('@');
  if (atIdx < 1) return null;

  const domain = email.slice(atIdx + 1).toLowerCase().trim();
  if (!domain) return null;

  return KNOWN_PROVIDERS[domain] ?? guessFromDomain(domain);
}

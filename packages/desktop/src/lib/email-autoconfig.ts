export interface MailServerConfig {
  provider: string;
  imap: { host: string; port: number; security: 'ssl' | 'starttls' | 'none' };
  smtp: { host: string; port: number; security: 'ssl' | 'starttls' | 'none' };
}

const KNOWN_PROVIDERS: Record<string, MailServerConfig> = {
  'gmail.com': {
    provider: 'Google Gmail',
    imap: { host: 'imap.gmail.com', port: 993, security: 'ssl' },
    smtp: { host: 'smtp.gmail.com', port: 465, security: 'ssl' },
  },
  'googlemail.com': {
    provider: 'Google Gmail',
    imap: { host: 'imap.gmail.com', port: 993, security: 'ssl' },
    smtp: { host: 'smtp.gmail.com', port: 465, security: 'ssl' },
  },
  'outlook.com': {
    provider: 'Microsoft Outlook',
    imap: { host: 'outlook.office365.com', port: 993, security: 'ssl' },
    smtp: { host: 'smtp.office365.com', port: 587, security: 'starttls' },
  },
  'hotmail.com': {
    provider: 'Microsoft Outlook',
    imap: { host: 'outlook.office365.com', port: 993, security: 'ssl' },
    smtp: { host: 'smtp.office365.com', port: 587, security: 'starttls' },
  },
  'live.com': {
    provider: 'Microsoft Outlook',
    imap: { host: 'outlook.office365.com', port: 993, security: 'ssl' },
    smtp: { host: 'smtp.office365.com', port: 587, security: 'starttls' },
  },
  'yahoo.com': {
    provider: 'Yahoo Mail',
    imap: { host: 'imap.mail.yahoo.com', port: 993, security: 'ssl' },
    smtp: { host: 'smtp.mail.yahoo.com', port: 465, security: 'ssl' },
  },
  'icloud.com': {
    provider: 'Apple iCloud',
    imap: { host: 'imap.mail.me.com', port: 993, security: 'ssl' },
    smtp: { host: 'smtp.mail.me.com', port: 587, security: 'starttls' },
  },
  'me.com': {
    provider: 'Apple iCloud',
    imap: { host: 'imap.mail.me.com', port: 993, security: 'ssl' },
    smtp: { host: 'smtp.mail.me.com', port: 587, security: 'starttls' },
  },
  'zoho.com': {
    provider: 'Zoho Mail',
    imap: { host: 'imap.zoho.com', port: 993, security: 'ssl' },
    smtp: { host: 'smtp.zoho.com', port: 465, security: 'ssl' },
  },
  'zohomail.com': {
    provider: 'Zoho Mail',
    imap: { host: 'imap.zoho.com', port: 993, security: 'ssl' },
    smtp: { host: 'smtp.zoho.com', port: 465, security: 'ssl' },
  },
  'protonmail.com': {
    provider: 'ProtonMail (Bridge required)',
    imap: { host: '127.0.0.1', port: 1143, security: 'starttls' },
    smtp: { host: '127.0.0.1', port: 1025, security: 'starttls' },
  },
  'proton.me': {
    provider: 'ProtonMail (Bridge required)',
    imap: { host: '127.0.0.1', port: 1143, security: 'starttls' },
    smtp: { host: '127.0.0.1', port: 1025, security: 'starttls' },
  },
  'aol.com': {
    provider: 'AOL Mail',
    imap: { host: 'imap.aol.com', port: 993, security: 'ssl' },
    smtp: { host: 'smtp.aol.com', port: 465, security: 'ssl' },
  },
  'yandex.com': {
    provider: 'Yandex Mail',
    imap: { host: 'imap.yandex.com', port: 993, security: 'ssl' },
    smtp: { host: 'smtp.yandex.com', port: 465, security: 'ssl' },
  },
  'mail.ru': {
    provider: 'Mail.ru',
    imap: { host: 'imap.mail.ru', port: 993, security: 'ssl' },
    smtp: { host: 'smtp.mail.ru', port: 465, security: 'ssl' },
  },
  'fastmail.com': {
    provider: 'Fastmail',
    imap: { host: 'imap.fastmail.com', port: 993, security: 'ssl' },
    smtp: { host: 'smtp.fastmail.com', port: 465, security: 'ssl' },
  },
  'gmx.com': {
    provider: 'GMX Mail',
    imap: { host: 'imap.gmx.com', port: 993, security: 'ssl' },
    smtp: { host: 'mail.gmx.com', port: 465, security: 'ssl' },
  },
};

function guessFromDomain(domain: string): MailServerConfig {
  return {
    provider: domain,
    imap: { host: `imap.${domain}`, port: 993, security: 'ssl' },
    smtp: { host: `smtp.${domain}`, port: 465, security: 'ssl' },
  };
}

export function detectMailConfig(email: string): MailServerConfig | null {
  const atIdx = email.indexOf('@');
  if (atIdx < 1) return null;

  const domain = email.slice(atIdx + 1).toLowerCase().trim();
  if (!domain) return null;

  return KNOWN_PROVIDERS[domain] ?? guessFromDomain(domain);
}

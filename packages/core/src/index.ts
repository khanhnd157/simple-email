export { AccountManager } from './accounts/index.js';
export { PgpService } from './crypto/index.js';
export type { PgpKeyPair, PgpPublicKey, EncryptResult, DecryptResult } from './crypto/index.js';
export { ImapClient } from './imap/index.js';
export { SmtpClient } from './smtp/index.js';
export { parseEmail, generateMessageId } from './parser/index.js';
export { initDatabase, getDatabase, closeDatabase } from './storage/database.js';
export {
  AccountRepository,
  FolderRepository,
  MessageRepository,
  AttachmentRepository,
  ContactRepository,
} from './storage/repository.js';
export * from './types/index.js';
export {
  parsePrefsJs,
  extractAccounts,
  parseMbox,
  scanProfile,
  getDefaultProfilePaths,
} from './migration/index.js';
export type { ThunderbirdAccount, ThunderbirdProfile, MboxMessage } from './migration/index.js';

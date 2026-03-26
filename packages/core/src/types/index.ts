export type AuthType = 'password' | 'oauth2';
export type FolderType = 'inbox' | 'sent' | 'drafts' | 'trash' | 'junk' | 'archive' | 'custom';
export type MessagePriority = 'low' | 'normal' | 'high';

export interface AccountConfig {
  id: string;
  name: string;
  email: string;
  imapHost: string;
  imapPort: number;
  imapSecure: boolean;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  authType: AuthType;
  username: string;
  password?: string;
  accessToken?: string;
  refreshToken?: string;
}

export interface Folder {
  id: string;
  accountId: string;
  name: string;
  path: string;
  type: FolderType;
  delimiter: string;
  unreadCount: number;
  totalCount: number;
  parentPath?: string;
}

export interface Address {
  name: string;
  address: string;
}

export interface Attachment {
  id: string;
  messageId: string;
  filename: string;
  contentType: string;
  size: number;
  contentId?: string;
  content?: Buffer;
}

export interface Message {
  id: string;
  accountId: string;
  folderId: string;
  uid: number;
  messageId: string;
  subject: string;
  from: Address[];
  to: Address[];
  cc: Address[];
  bcc: Address[];
  replyTo: Address[];
  date: Date;
  snippet: string;
  bodyHtml: string;
  bodyText: string;
  isRead: boolean;
  isStarred: boolean;
  isAnswered: boolean;
  isDraft: boolean;
  hasAttachments: boolean;
  attachments: Attachment[];
  headers: Record<string, string>;
  priority: MessagePriority;
  inReplyTo?: string;
  references: string[];
  size: number;
}

export interface Contact {
  id: string;
  accountId: string;
  name: string;
  email: string;
  lastUsed: Date;
  usageCount: number;
}

export interface SendMailOptions {
  from: Address;
  to: Address[];
  cc?: Address[];
  bcc?: Address[];
  replyTo?: Address;
  subject: string;
  bodyHtml?: string;
  bodyText?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
    contentId?: string;
  }>;
  inReplyTo?: string;
  references?: string[];
  priority?: MessagePriority;
  headers?: Record<string, string>;
}

export interface FetchOptions {
  folder: string;
  limit?: number;
  offset?: number;
  since?: Date;
  before?: Date;
  search?: string;
  unseenOnly?: boolean;
}

export interface SyncResult {
  newMessages: number;
  updatedMessages: number;
  deletedMessages: number;
  folders: number;
}

export interface ConnectionStatus {
  connected: boolean;
  error?: string;
  lastSync?: Date;
}

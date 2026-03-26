export interface Account {
  id: string;
  name: string;
  email: string;
}

export interface Folder {
  id: string;
  accountId: string;
  name: string;
  path: string;
  type: 'inbox' | 'sent' | 'drafts' | 'trash' | 'junk' | 'archive' | 'custom';
  unreadCount: number;
  totalCount: number;
}

export interface Address {
  name: string;
  address: string;
}

export interface Attachment {
  id: string;
  filename: string;
  contentType: string;
  size: number;
}

export interface Message {
  id: string;
  accountId: string;
  folderId: string;
  subject: string;
  from: Address[];
  to: Address[];
  cc: Address[];
  date: Date;
  snippet: string;
  bodyHtml: string;
  bodyText: string;
  isRead: boolean;
  isStarred: boolean;
  isAnswered: boolean;
  hasAttachments: boolean;
  attachments: Attachment[];
}

export const ACCOUNTS: Account[] = [];

export const FOLDERS: Folder[] = [];

export const MESSAGES: Message[] = [];

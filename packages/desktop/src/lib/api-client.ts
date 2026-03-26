const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export interface AccountDTO {
  id: string;
  name: string;
  email: string;
  imapHost: string;
  imapPort: number;
  imapSecure: boolean;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  authType: string;
  username: string;
  password?: string;
}

export interface FolderDTO {
  id: string;
  accountId: string;
  name: string;
  path: string;
  type: string;
  delimiter: string;
  unreadCount: number;
  totalCount: number;
  parentPath?: string;
}

export interface AddressDTO {
  name: string;
  address: string;
}

export interface MessageDTO {
  id: string;
  accountId: string;
  folderId: string;
  uid: number;
  messageId: string;
  subject: string;
  from: AddressDTO[];
  to: AddressDTO[];
  cc: AddressDTO[];
  bcc: AddressDTO[];
  replyTo: AddressDTO[];
  date: string;
  snippet: string;
  bodyHtml: string;
  bodyText: string;
  isRead: boolean;
  isStarred: boolean;
  isAnswered: boolean;
  isDraft: boolean;
  hasAttachments: boolean;
  attachments: unknown[];
  priority: string;
  size: number;
}

export interface ConnectionStatusDTO {
  connected: boolean;
  error?: string;
  lastSync?: string;
}

export interface SyncResultDTO {
  newMessages: number;
  updatedMessages: number;
  deletedMessages: number;
  folders: number;
}

export const api = {
  getAccounts: () => request<AccountDTO[]>('/accounts'),

  addAccount: (data: Omit<AccountDTO, 'id'>) =>
    request<AccountDTO>('/accounts', { method: 'POST', body: JSON.stringify(data) }),

  deleteAccount: (id: string) =>
    request<{ ok: boolean }>(`/accounts/${id}`, { method: 'DELETE' }),

  connectAccount: (id: string) =>
    request<ConnectionStatusDTO>(`/accounts/${id}/connect`, { method: 'POST' }),

  disconnectAccount: (id: string) =>
    request<{ ok: boolean }>(`/accounts/${id}/disconnect`, { method: 'POST' }),

  getConnectionStatus: (id: string) =>
    request<ConnectionStatusDTO>(`/accounts/${id}/status`),

  syncFolders: (id: string) =>
    request<FolderDTO[]>(`/accounts/${id}/sync-folders`, { method: 'POST' }),

  getFolders: (id: string) =>
    request<FolderDTO[]>(`/accounts/${id}/folders`),

  syncMessages: (accountId: string, folderPath: string, since?: string) =>
    request<SyncResultDTO>(`/accounts/${accountId}/sync-messages`, {
      method: 'POST',
      body: JSON.stringify({ folderPath, since }),
    }),

  getMessages: (folderId: string, limit = 50, offset = 0) =>
    request<MessageDTO[]>(`/folders/${folderId}/messages?limit=${limit}&offset=${offset}`),

  getMessage: (id: string) =>
    request<MessageDTO>(`/messages/${id}`),

  health: () => request<{ status: string }>('/health'),
};

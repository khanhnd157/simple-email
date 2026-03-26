import { create } from 'zustand';
import { api, type AccountDTO, type FolderDTO, type MessageDTO } from '@/lib/api-client';

export type { AccountDTO, FolderDTO, MessageDTO };

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
  type: string;
  unreadCount: number;
  totalCount: number;
}

export interface Address {
  name: string;
  address: string;
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
  attachments: unknown[];
}

interface EmailState {
  accounts: Account[];
  accountDetails: AccountDTO[];
  folders: Folder[];
  messages: Message[];

  selectedAccountId: string | null;
  selectedFolderId: string | null;
  selectedMessageId: string | null;
  composerOpen: boolean;
  replyTo: Message | null;
  searchQuery: string;
  sidebarWidth: number;
  listWidth: number;
  loading: boolean;
  syncing: boolean;
  sidebarCollapsed: boolean;

  toggleSidebar: () => void;
  selectAccount: (id: string) => void;
  selectFolder: (id: string) => void;
  selectMessage: (id: string | null) => void;
  toggleStar: (id: string) => void;
  markAsRead: (id: string) => void;
  deleteMessage: (id: string) => void;
  openComposer: (replyTo?: Message) => void;
  closeComposer: () => void;
  setSearchQuery: (query: string) => void;
  setSidebarWidth: (width: number) => void;
  setListWidth: (width: number) => void;

  loadAccounts: () => Promise<void>;
  addAccount: (data: Omit<AccountDTO, 'id'>) => Promise<AccountDTO>;
  removeAccount: (id: string) => Promise<void>;
  connectAndSync: (accountId: string) => Promise<void>;
  loadFolders: (accountId: string) => Promise<void>;
  loadMessages: (folderId: string) => Promise<void>;
  syncAll: () => Promise<void>;
}

function toMessage(dto: MessageDTO): Message {
  return {
    ...dto,
    date: new Date(dto.date),
  };
}

function toFolder(dto: FolderDTO): Folder {
  return {
    id: dto.id,
    accountId: dto.accountId,
    name: dto.name,
    path: dto.path,
    type: dto.type,
    unreadCount: dto.unreadCount,
    totalCount: dto.totalCount,
  };
}

export const useEmailStore = create<EmailState>((set, get) => ({
  accounts: [],
  accountDetails: [],
  folders: [],
  messages: [],

  selectedAccountId: null,
  selectedFolderId: null,
  selectedMessageId: null,
  composerOpen: false,
  replyTo: null,
  searchQuery: '',
  sidebarWidth: 240,
  listWidth: 360,
  loading: false,
  syncing: false,
  sidebarCollapsed: false,

  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  selectAccount: (id) => {
    const folders = get().folders.filter((f) => f.accountId === id);
    const inbox = folders.find((f) => f.type === 'inbox');
    set({
      selectedAccountId: id,
      selectedFolderId: inbox?.id ?? folders[0]?.id ?? null,
      selectedMessageId: null,
    });
  },

  selectFolder: (id) => {
    set({ selectedFolderId: id, selectedMessageId: null });
    get().loadMessages(id);
  },

  selectMessage: (id) => {
    if (id) {
      set((s) => ({
        selectedMessageId: id,
        messages: s.messages.map((m) => (m.id === id ? { ...m, isRead: true } : m)),
        folders: s.folders.map((f) => {
          const msg = s.messages.find((m) => m.id === id);
          if (msg && f.id === msg.folderId && !msg.isRead) {
            return { ...f, unreadCount: Math.max(0, f.unreadCount - 1) };
          }
          return f;
        }),
      }));
    } else {
      set({ selectedMessageId: null });
    }
  },

  toggleStar: (id) =>
    set((s) => ({
      messages: s.messages.map((m) => (m.id === id ? { ...m, isStarred: !m.isStarred } : m)),
    })),

  markAsRead: (id) =>
    set((s) => ({
      messages: s.messages.map((m) => (m.id === id ? { ...m, isRead: true } : m)),
    })),

  deleteMessage: (id) =>
    set((s) => ({
      messages: s.messages.filter((m) => m.id !== id),
      selectedMessageId: s.selectedMessageId === id ? null : s.selectedMessageId,
    })),

  openComposer: (replyTo) => set({ composerOpen: true, replyTo: replyTo ?? null }),
  closeComposer: () => set({ composerOpen: false, replyTo: null }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSidebarWidth: (width) => set({ sidebarWidth: Math.max(180, Math.min(400, width)) }),
  setListWidth: (width) => set({ listWidth: Math.max(280, Math.min(600, width)) }),

  loadAccounts: async () => {
    try {
      const dtos = await api.getAccounts();
      const accounts: Account[] = dtos.map((d) => ({ id: d.id, name: d.name, email: d.email }));
      set({ accounts, accountDetails: dtos, selectedAccountId: accounts[0]?.id ?? null });

      for (const acc of accounts) {
        await get().loadFolders(acc.id);
      }

      const { selectedFolderId } = get();
      if (selectedFolderId) {
        await get().loadMessages(selectedFolderId);
      }
    } catch {
      set({ accounts: [] });
    }
  },

  addAccount: async (data) => {
    const dto = await api.addAccount(data);
    const account: Account = { id: dto.id, name: dto.name, email: dto.email };
    set((s) => ({
      accounts: [...s.accounts, account],
      accountDetails: [...s.accountDetails, dto],
      selectedAccountId: s.selectedAccountId ?? dto.id,
    }));
    return dto;
  },

  removeAccount: async (id) => {
    await api.deleteAccount(id);
    set((s) => ({
      accounts: s.accounts.filter((a) => a.id !== id),
      accountDetails: s.accountDetails.filter((a) => a.id !== id),
      folders: s.folders.filter((f) => f.accountId !== id),
      messages: s.messages.filter((m) => m.accountId !== id),
      selectedAccountId: s.selectedAccountId === id ? (s.accounts[0]?.id ?? null) : s.selectedAccountId,
    }));
  },

  connectAndSync: async (accountId) => {
    const since = new Date();
    since.setMonth(since.getMonth() - 3);
    const sinceISO = since.toISOString();

    const status = await api.connectAccount(accountId);
    if (!status.connected) {
      throw new Error(status.error || 'Connection failed');
    }

    const folderDTOs = await api.syncFolders(accountId);
    const newFolders = folderDTOs.map(toFolder);

    set((s) => ({
      folders: [...s.folders.filter((f) => f.accountId !== accountId), ...newFolders],
    }));

    const inbox = newFolders.find((f) => f.type === 'inbox');
    if (inbox) {
      await api.syncMessages(accountId, inbox.path, sinceISO);
      const msgDTOs = await api.getMessages(inbox.id);
      const msgs = msgDTOs.map(toMessage);
      set((s) => ({
        messages: [...s.messages.filter((m) => m.folderId !== inbox.id), ...msgs],
        selectedFolderId: s.selectedFolderId ?? inbox.id,
      }));
    }
  },

  loadFolders: async (accountId) => {
    try {
      const dtos = await api.getFolders(accountId);
      const folders = dtos.map(toFolder);
      set((s) => ({
        folders: [...s.folders.filter((f) => f.accountId !== accountId), ...folders],
        selectedFolderId: s.selectedFolderId ?? folders.find((f) => f.type === 'inbox')?.id ?? folders[0]?.id ?? null,
      }));
    } catch {
      // folders not synced yet
    }
  },

  loadMessages: async (folderId) => {
    set({ loading: true });
    try {
      const dtos = await api.getMessages(folderId);
      const msgs = dtos.map(toMessage);
      set((s) => ({
        messages: [...s.messages.filter((m) => m.folderId !== folderId), ...msgs],
      }));
    } catch {
      // ignore
    } finally {
      set({ loading: false });
    }
  },

  syncAll: async () => {
    const { accounts } = get();
    set({ syncing: true });
    try {
      for (const acc of accounts) {
        await get().connectAndSync(acc.id);
      }
    } finally {
      set({ syncing: false });
    }
  },
}));

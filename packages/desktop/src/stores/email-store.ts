import { create } from 'zustand';
import {
  ACCOUNTS,
  FOLDERS,
  MESSAGES,
  type Account,
  type Folder,
  type Message,
} from '@/lib/mock-data';
import { createAccount, getAllAccounts, deleteAccount as removeAccount, type CreateAccountInput, type AccountRecord } from '@/lib/account-service';

interface EmailState {
  accounts: Account[];
  folders: Folder[];
  messages: Message[];
  dbAccounts: AccountRecord[];

  selectedAccountId: string | null;
  selectedFolderId: string | null;
  selectedMessageId: string | null;
  composerOpen: boolean;
  replyTo: Message | null;
  searchQuery: string;
  sidebarWidth: number;
  listWidth: number;

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
  addAccount: (input: CreateAccountInput) => Promise<AccountRecord>;
  removeAccount: (id: string) => Promise<void>;
  loadAccounts: () => Promise<void>;
}

export const useEmailStore = create<EmailState>((set, get) => ({
  accounts: ACCOUNTS,
  folders: FOLDERS,
  messages: MESSAGES,
  dbAccounts: [],

  selectedAccountId: ACCOUNTS[0]?.id ?? null,
  selectedFolderId: FOLDERS[0]?.id ?? null,
  selectedMessageId: null,
  composerOpen: false,
  replyTo: null,
  searchQuery: '',
  sidebarWidth: 240,
  listWidth: 360,

  selectAccount: (id) => {
    const folders = get().folders.filter((f) => f.accountId === id);
    const inbox = folders.find((f) => f.type === 'inbox');
    set({
      selectedAccountId: id,
      selectedFolderId: inbox?.id ?? folders[0]?.id ?? null,
      selectedMessageId: null,
    });
  },

  selectFolder: (id) => set({ selectedFolderId: id, selectedMessageId: null }),

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

  addAccount: async (input) => {
    const record = await createAccount(input);
    const account: Account = { id: record.id, name: record.name, email: record.email };
    set((s) => ({
      dbAccounts: [...s.dbAccounts, record],
      accounts: [...s.accounts, account],
    }));
    return record;
  },

  removeAccount: async (id) => {
    await removeAccount(id);
    set((s) => ({
      dbAccounts: s.dbAccounts.filter((a) => a.id !== id),
      accounts: s.accounts.filter((a) => a.id !== id),
    }));
  },

  loadAccounts: async () => {
    const records = await getAllAccounts();
    const loaded: Account[] = records.map((r) => ({ id: r.id, name: r.name, email: r.email }));
    set({
      dbAccounts: records,
      accounts: loaded,
      selectedAccountId: loaded[0]?.id ?? null,
    });
  },
}));

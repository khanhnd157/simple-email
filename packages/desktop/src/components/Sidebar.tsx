import {
  Inbox, Send, FileText, Trash2, Archive, ShieldAlert,
  ChevronDown, ChevronRight, Plus, Mail, CalendarDays,
  ListTodo, User, Shield, Filter, Settings,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useEmailStore } from '@/stores/email-store';
import { useAppStore, type AppView } from '@/stores/app-store';
import type { Folder } from '@/lib/mock-data';

const FOLDER_ICONS: Record<string, React.ElementType> = {
  inbox: Inbox, sent: Send, drafts: FileText,
  trash: Trash2, archive: Archive, junk: ShieldAlert,
};

function FolderItem({ folder }: { folder: Folder }) {
  const { selectedFolderId, selectFolder } = useEmailStore();
  const isActive = selectedFolderId === folder.id;
  const Icon = FOLDER_ICONS[folder.type] || FileText;

  return (
    <button onClick={() => selectFolder(folder.id)}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors',
        isActive
          ? 'bg-primary-100 text-primary-700 font-medium dark:bg-primary-900/30 dark:text-primary-400'
          : 'text-gray-600 hover:bg-sidebar-hover dark:text-gray-400 dark:hover:bg-gray-800',
      )}>
      <Icon size={16} className={isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'} />
      <span className="flex-1 truncate text-left">{folder.name}</span>
      {folder.unreadCount > 0 && (
        <span className={cn(
          'min-w-[20px] rounded-full px-1.5 py-0.5 text-center text-xs font-semibold',
          isActive ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
        )}>{folder.unreadCount}</span>
      )}
    </button>
  );
}

function AccountSection({ accountId, accountName }: { accountId: string; accountName: string }) {
  const [expanded, setExpanded] = useState(true);
  const allFolders = useEmailStore((s) => s.folders);
  const folders = useMemo(() => allFolders.filter((f) => f.accountId === accountId), [allFolders, accountId]);

  return (
    <div className="mb-1">
      <button onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
        {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        <span className="truncate">{accountName}</span>
      </button>
      {expanded && (
        <div className="ml-1 space-y-0.5 pl-1">
          {folders.map((f) => <FolderItem key={f.id} folder={f} />)}
        </div>
      )}
    </div>
  );
}

function NavBar() {
  const { t } = useTranslation();
  const { currentView, setView } = useAppStore();

  const items: Array<{ view: AppView; icon: React.ElementType; label: string }> = [
    { view: 'mail', icon: Mail, label: t('nav.mail') },
    { view: 'calendar', icon: CalendarDays, label: t('nav.calendar') },
    { view: 'tasks', icon: ListTodo, label: t('nav.tasks') },
    { view: 'contacts', icon: User, label: t('nav.contacts') },
  ];

  return (
    <div className="flex border-b border-sidebar-border dark:border-gray-800">
      {items.map(({ view, icon: Icon, label }) => (
        <button key={view} onClick={() => setView(view)} title={label}
          className={cn(
            'flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] transition-colors',
            currentView === view
              ? 'text-primary-600 bg-primary-50/50 dark:text-primary-400 dark:bg-primary-900/20'
              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50 dark:hover:text-gray-300 dark:hover:bg-gray-800',
          )}>
          <Icon size={18} />
          {label}
        </button>
      ))}
    </div>
  );
}

export function Sidebar() {
  const { t } = useTranslation();
  const { accounts, openComposer } = useEmailStore();
  const { currentView, setView, openKeyManager } = useAppStore();

  return (
    <div className="flex h-full flex-col bg-sidebar-bg border-r border-sidebar-border dark:bg-gray-900 dark:border-gray-800">
      <NavBar />

      {currentView === 'mail' && (
        <>
          <div className="p-3">
            <button onClick={() => openComposer()}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-700 active:bg-primary-800">
              <Plus size={16} /> {t('sidebar.compose')}
            </button>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin px-2 pb-4">
            {accounts.map((acc) => (
              <AccountSection key={acc.id} accountId={acc.id} accountName={acc.name} />
            ))}
          </div>
        </>
      )}

      {currentView !== 'mail' && <div className="flex-1" />}

      <div className="border-t border-sidebar-border dark:border-gray-800">
        <div className="flex gap-1 px-2 py-1.5">
          <button onClick={openKeyManager} title="PGP Keys"
            className="flex-1 flex items-center justify-center gap-1 rounded py-1.5 text-xs text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300">
            <Shield size={14} /> {t('sidebar.keys')}
          </button>
          <button title="Filters"
            className="flex-1 flex items-center justify-center gap-1 rounded py-1.5 text-xs text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300">
            <Filter size={14} /> {t('sidebar.filters')}
          </button>
          <button onClick={() => setView('settings')} title="Settings"
            className={cn(
              'flex-1 flex items-center justify-center gap-1 rounded py-1.5 text-xs',
              currentView === 'settings'
                ? 'text-primary-600 bg-primary-50 dark:text-primary-400 dark:bg-primary-900/20'
                : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300',
            )}>
            <Settings size={14} />
          </button>
        </div>
        <div className="flex items-center gap-2 border-t border-sidebar-border dark:border-gray-800 p-3">
          <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <span className="text-xs font-semibold text-primary-700 dark:text-primary-400">JD</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-gray-700 dark:text-gray-200">John Doe</p>
            <p className="truncate text-xs text-gray-400">{t('sidebar.accounts', { count: accounts.length })}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

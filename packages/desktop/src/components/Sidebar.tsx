import {
  Inbox, Send, FileText, Trash2, Archive, ShieldAlert,
  ChevronDown, ChevronRight, Mail, CalendarDays,
  ListTodo, User, Shield, Filter, Settings, Search,
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
        'flex w-full items-center gap-2 rounded px-2 py-[5px] text-[13px] transition-colors',
        isActive
          ? 'bg-primary-100 text-primary-700 font-medium dark:bg-primary-900/30 dark:text-primary-300'
          : 'text-gray-600 hover:bg-sidebar-hover dark:text-navy-200 dark:hover:bg-navy-800',
      )}>
      <Icon size={15} className={isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-navy-400'} />
      <span className="flex-1 truncate text-left">{folder.name}</span>
      {folder.unreadCount > 0 && (
        <span className={cn(
          'min-w-[18px] rounded-full px-1 py-px text-center text-[10px] font-semibold',
          isActive ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600 dark:bg-navy-700 dark:text-navy-200',
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
    <div className="mb-0.5">
      <button onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-1 rounded px-1.5 py-1 text-xs font-semibold text-gray-500 dark:text-navy-300 hover:text-gray-700 dark:hover:text-navy-100">
        {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
        <Mail size={13} className="text-gray-400 dark:text-navy-400" />
        <span className="truncate">{accountName}</span>
      </button>
      {expanded && (
        <div className="ml-2 space-y-px pl-2 border-l border-gray-200 dark:border-navy-700">
          {folders.map((f) => <FolderItem key={f.id} folder={f} />)}
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const { t } = useTranslation();
  const { accounts } = useEmailStore();
  const { currentView, setView, openKeyManager } = useAppStore();

  const navItems: Array<{ view: AppView; icon: React.ElementType; label: string }> = [
    { view: 'mail', icon: Mail, label: t('nav.mail') },
    // { view: 'calendar', icon: CalendarDays, label: t('nav.calendar') },
    // { view: 'tasks', icon: ListTodo, label: t('nav.tasks') },
    // { view: 'contacts', icon: User, label: t('nav.contacts') },
  ];

  return (
    <div className="flex h-full flex-col bg-sidebar-bg border-r border-sidebar-border dark:bg-navy-900 dark:border-navy-700/50">
      <div className="px-3 pt-2 pb-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-navy-400">
            {currentView === 'mail' ? t('sidebar.accounts', { count: accounts.length }) : ''}
          </span>
          <div className="flex items-center gap-0.5">
            <button onClick={openKeyManager} title="PGP Keys"
              className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:text-navy-400 dark:hover:bg-navy-800 dark:hover:text-navy-200">
              <Shield size={13} />
            </button>
            <button title="Filters"
              className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:text-navy-400 dark:hover:bg-navy-800 dark:hover:text-navy-200">
              <Filter size={13} />
            </button>
            <button title="Search"
              className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:text-navy-400 dark:hover:bg-navy-800 dark:hover:text-navy-200">
              <Search size={13} />
            </button>
          </div>
        </div>
      </div>

      {currentView === 'mail' && (
        <div className="flex-1 overflow-y-auto scrollbar-thin px-2 pb-2">
          {accounts.map((acc) => (
            <AccountSection key={acc.id} accountId={acc.id} accountName={acc.name} />
          ))}
        </div>
      )}

      {currentView !== 'mail' && <div className="flex-1" />}

      <div className="border-t border-sidebar-border dark:border-navy-700/50">
        <div className="flex">
          {navItems.map(({ view, icon: Icon, label }) => (
            <button key={view} onClick={() => setView(view)} title={label}
              className={cn(
                'flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors',
                currentView === view
                  ? 'text-primary-500 bg-primary-50/60 dark:text-primary-400 dark:bg-navy-800'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50 dark:text-navy-400 dark:hover:text-navy-200 dark:hover:bg-navy-850',
              )}>
              <Icon size={18} strokeWidth={1.5} />
              <span className="leading-none">{label}</span>
            </button>
          ))}
          <button onClick={() => setView('settings')} title={t('settings.title')}
            className={cn(
              'flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors',
              currentView === 'settings'
                ? 'text-primary-500 bg-primary-50/60 dark:text-primary-400 dark:bg-navy-800'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50 dark:text-navy-400 dark:hover:text-navy-200 dark:hover:bg-navy-850',
            )}>
            <Settings size={18} strokeWidth={1.5} />
            <span className="leading-none">{t('settings.title')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

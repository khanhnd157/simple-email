import {
  Inbox, Send, FileText, Trash2, Archive, ShieldAlert, FolderOpen,
  ChevronDown, ChevronRight, Mail, CalendarDays,
  ListTodo, User, Shield, Filter, Settings, Search,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useEmailStore } from '@/stores/email-store';
import { useAppStore, type AppView } from '@/stores/app-store';
import type { Folder } from '@/stores/email-store';

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

const PRIMARY_TYPES = new Set(['inbox', 'sent', 'drafts', 'trash', 'junk', 'archive']);

function PrimaryAndCustomFolders({ folders }: { folders: Folder[] }) {
  const [customExpanded, setCustomExpanded] = useState(false);
  const primary = useMemo(() => folders.filter((f) => PRIMARY_TYPES.has(f.type)), [folders]);
  const custom = useMemo(() => folders.filter((f) => !PRIMARY_TYPES.has(f.type)), [folders]);

  return (
    <>
      {primary.map((f) => <FolderItem key={f.id} folder={f} />)}
      {custom.length > 0 && (
        <div>
          <button onClick={() => setCustomExpanded(!customExpanded)}
            className="flex w-full items-center gap-2 rounded px-2 py-[5px] text-[13px] text-gray-500 dark:text-navy-400 hover:bg-sidebar-hover dark:hover:bg-navy-800 transition-colors">
            {customExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            <FolderOpen size={15} className="text-gray-400 dark:text-navy-400" />
            <span className="flex-1 text-left">Folders</span>
            <span className="text-[10px] text-gray-400 dark:text-navy-500">{custom.length}</span>
          </button>
          {customExpanded && (
            <div className="ml-2 pl-2 space-y-px border-l border-gray-200 dark:border-navy-700/50">
              {custom.map((f) => <FolderItem key={f.id} folder={f} />)}
            </div>
          )}
        </div>
      )}
    </>
  );
}

function AccountSection({ accountId, accountName, accountEmail }: { accountId: string; accountName: string; accountEmail: string }) {
  const [expanded, setExpanded] = useState(true);
  const selectedAccountId = useEmailStore((s) => s.selectedAccountId);
  const selectAccount = useEmailStore((s) => s.selectAccount);
  const allFolders = useEmailStore((s) => s.folders);
  const folders = useMemo(() => allFolders.filter((f) => f.accountId === accountId), [allFolders, accountId]);
  const isSelected = selectedAccountId === accountId;

  return (
    <div className="mb-0.5">
      <button onClick={() => { selectAccount(accountId); setExpanded(!expanded); }}
        className={cn(
          'flex w-full items-center gap-1 rounded px-1.5 py-1 text-xs font-semibold transition-colors border-l-2',
          isSelected
            ? 'border-l-primary-500 bg-primary-100 text-primary-700 dark:border-l-primary-400 dark:bg-primary-900/30 dark:text-primary-300'
            : 'border-l-transparent text-gray-500 dark:text-navy-300 hover:text-gray-700 dark:hover:text-navy-100 hover:bg-gray-50 dark:hover:bg-navy-800',
        )}>
        {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
        <div className="truncate text-left">
          <span className="block truncate text-[13px]">{accountName}</span>
          <span className={cn('block truncate text-[10px] font-normal', isSelected ? 'text-primary-500/70 dark:text-primary-400/60' : 'text-gray-400 dark:text-navy-500')}>{accountEmail}</span>
        </div>
      </button>
      {expanded && (
        <div className="ml-2 space-y-px pl-2 border-l border-gray-200 dark:border-navy-700">
          <PrimaryAndCustomFolders folders={folders} />
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const { t } = useTranslation();
  const { accounts } = useEmailStore();
  const { currentView, setView, openKeyManager, openSettings } = useAppStore();

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
          {accounts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <Mail size={28} className="text-gray-300 dark:text-navy-600 mb-2" />
              <p className="text-xs text-gray-400 dark:text-navy-500">{t('sidebar.noAccounts', 'No accounts added')}</p>
              <button onClick={openSettings} className="mt-2 text-xs text-primary-500 hover:text-primary-600 dark:hover:text-primary-400">
                {t('sidebar.addAccount', 'Add account')}
              </button>
            </div>
          ) : (
            accounts.map((acc) => (
              <AccountSection key={acc.id} accountId={acc.id} accountName={acc.name} accountEmail={acc.email} />
            ))
          )}
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
          <button onClick={openSettings} title={t('settings.title')}
            className="flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors text-gray-400 hover:text-gray-600 hover:bg-gray-50 dark:text-navy-400 dark:hover:text-navy-200 dark:hover:bg-navy-850">
            <Settings size={18} strokeWidth={1.5} />
            <span className="leading-none">{t('settings.title')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

import {
  Inbox, Send, FileText, Trash2, Archive, ShieldAlert,
  ChevronDown, ChevronRight, Plus, Mail, CalendarDays,
  ListTodo, User, Shield, Filter, Settings,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useEmailStore } from '@/stores/email-store';
import { useAppStore, type AppView } from '@/stores/app-store';
import type { Folder } from '@/lib/mock-data';

const FOLDER_ICONS: Record<string, React.ElementType> = {
  inbox: Inbox,
  sent: Send,
  drafts: FileText,
  trash: Trash2,
  archive: Archive,
  junk: ShieldAlert,
};

function FolderItem({ folder }: { folder: Folder }) {
  const { selectedFolderId, selectFolder } = useEmailStore();
  const isActive = selectedFolderId === folder.id;
  const Icon = FOLDER_ICONS[folder.type] || FileText;

  return (
    <button
      onClick={() => selectFolder(folder.id)}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors',
        isActive
          ? 'bg-primary-100 text-primary-700 font-medium'
          : 'text-gray-600 hover:bg-sidebar-hover',
      )}
    >
      <Icon size={16} className={isActive ? 'text-primary-600' : 'text-gray-400'} />
      <span className="flex-1 truncate text-left">{folder.name}</span>
      {folder.unreadCount > 0 && (
        <span className={cn(
          'min-w-[20px] rounded-full px-1.5 py-0.5 text-center text-xs font-semibold',
          isActive ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600',
        )}>
          {folder.unreadCount}
        </span>
      )}
    </button>
  );
}

function AccountSection({ accountId, accountName, email }: { accountId: string; accountName: string; email: string }) {
  const [expanded, setExpanded] = useState(true);
  const allFolders = useEmailStore((s) => s.folders);
  const folders = useMemo(() => allFolders.filter((f) => f.accountId === accountId), [allFolders, accountId]);

  return (
    <div className="mb-1">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-gray-600"
      >
        {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        <span className="truncate">{accountName}</span>
      </button>
      {expanded && (
        <div className="ml-1 space-y-0.5 pl-1">
          {folders.map((f) => (
            <FolderItem key={f.id} folder={f} />
          ))}
        </div>
      )}
    </div>
  );
}

const NAV_ITEMS: Array<{ view: AppView; icon: React.ElementType; label: string }> = [
  { view: 'mail', icon: Mail, label: 'Mail' },
  { view: 'calendar', icon: CalendarDays, label: 'Calendar' },
  { view: 'tasks', icon: ListTodo, label: 'Tasks' },
  { view: 'contacts', icon: User, label: 'Contacts' },
];

function NavBar() {
  const { currentView, setView } = useAppStore();
  return (
    <div className="flex border-b border-sidebar-border">
      {NAV_ITEMS.map(({ view, icon: Icon, label }) => (
        <button
          key={view}
          onClick={() => setView(view)}
          title={label}
          className={cn(
            'flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] transition-colors',
            currentView === view
              ? 'text-primary-600 bg-primary-50/50'
              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50',
          )}
        >
          <Icon size={18} />
          {label}
        </button>
      ))}
    </div>
  );
}

export function Sidebar() {
  const { accounts, openComposer } = useEmailStore();
  const { currentView, openKeyManager } = useAppStore();

  return (
    <div className="flex h-full flex-col bg-sidebar-bg border-r border-sidebar-border">
      <NavBar />

      {currentView === 'mail' && (
        <>
          <div className="p-3">
            <button
              onClick={() => openComposer()}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-700 active:bg-primary-800"
            >
              <Plus size={16} />
              Compose
            </button>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin px-2 pb-4">
            {accounts.map((acc) => (
              <AccountSection key={acc.id} accountId={acc.id} accountName={acc.name} email={acc.email} />
            ))}
          </div>
        </>
      )}

      {currentView !== 'mail' && <div className="flex-1" />}

      <div className="border-t border-sidebar-border">
        <div className="flex gap-1 px-2 py-1.5">
          <button onClick={openKeyManager} title="PGP Keys"
            className="flex-1 flex items-center justify-center gap-1 rounded py-1.5 text-xs text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <Shield size={14} /> Keys
          </button>
          <button title="Filters"
            className="flex-1 flex items-center justify-center gap-1 rounded py-1.5 text-xs text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <Filter size={14} /> Filters
          </button>
          <button title="Settings"
            className="flex-1 flex items-center justify-center gap-1 rounded py-1.5 text-xs text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <Settings size={14} />
          </button>
        </div>
        <div className="flex items-center gap-2 border-t border-sidebar-border p-3">
          <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-xs font-semibold text-primary-700">JD</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-gray-700">John Doe</p>
            <p className="truncate text-xs text-gray-400">2 accounts</p>
          </div>
        </div>
      </div>
    </div>
  );
}

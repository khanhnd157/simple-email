import {
  RefreshCw, Home, Reply, ReplyAll, Forward,
  Tag, MessageSquare, Archive, Trash2, PenSquare,
  Bell, Palette, LayoutGrid, Search, X, Shield,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useEmailStore } from '@/stores/email-store';
import { useAppStore } from '@/stores/app-store';

function ToolbarButton({
  icon: Icon,
  label,
  onClick,
  active,
  variant = 'default',
}: {
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
  active?: boolean;
  variant?: 'default' | 'primary' | 'danger';
}) {
  return (
    <button onClick={onClick} title={label}
      className={cn(
        'flex flex-col items-center gap-0.5 rounded-md px-2.5 py-1 text-[10px] transition-colors min-w-[52px]',
        variant === 'primary' && 'text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-navy-800',
        variant === 'danger' && 'text-gray-500 dark:text-navy-300 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20',
        variant === 'default' && (active
          ? 'text-primary-600 bg-primary-50 dark:text-primary-400 dark:bg-navy-800'
          : 'text-gray-500 dark:text-navy-300 hover:bg-gray-100 dark:hover:bg-navy-800 hover:text-gray-700 dark:hover:text-navy-200'),
      )}>
      <Icon size={18} strokeWidth={1.5} />
      <span className="leading-none">{label}</span>
    </button>
  );
}

function Separator() {
  return <div className="mx-0.5 h-8 w-px bg-gray-200 dark:bg-navy-700 self-center" />;
}

export function Toolbar() {
  const { t } = useTranslation();
  const { searchQuery, setSearchQuery, openComposer, selectedMessageId, messages, deleteMessage, toggleStar, syncAll, syncing } = useEmailStore();
  const { currentView, setView, openSettings, openKeyManager } = useAppStore();
  const message = messages.find((m) => m.id === selectedMessageId);

  return (
    <div className="flex items-center gap-0.5 border-b border-gray-200 dark:border-navy-700/50 bg-gray-50/80 dark:bg-navy-900 px-2 py-1">
      <ToolbarButton icon={RefreshCw} label={syncing ? '...' : (t('nav.mail') === 'Thư' ? 'Đồng bộ' : 'Sync All')} onClick={syncAll} />
      <ToolbarButton icon={Home} label={t('nav.mail') === 'Thư' ? 'Trang chủ' : 'Home'} onClick={() => setView('mail')} active={currentView === 'mail'} />

      <Separator />

      <ToolbarButton icon={Reply} label={t('viewer.reply')}
        onClick={() => message && openComposer(message)} />
      <ToolbarButton icon={ReplyAll} label={t('viewer.replyAll')} />
      <ToolbarButton icon={Forward} label={t('viewer.forward')} />

      <Separator />

      <ToolbarButton icon={Tag} label={t('nav.mail') === 'Thư' ? 'Nhãn' : 'Tag'} />
      <ToolbarButton icon={MessageSquare} label={t('nav.mail') === 'Thư' ? 'Trả lời nhanh' : 'Quick Post'} />

      <Separator />

      <ToolbarButton icon={Archive} label={t('viewer.archive')} />
      <ToolbarButton icon={Trash2} label={t('viewer.delete')} variant="danger"
        onClick={() => message && deleteMessage(message.id)} />

      <Separator />

      <ToolbarButton icon={PenSquare} label={t('sidebar.compose')} variant="primary"
        onClick={() => openComposer()} />
      <ToolbarButton icon={Bell} label={t('nav.mail') === 'Thư' ? 'Nhắc nhở' : 'Reminder'} />

      <Separator />

      <ToolbarButton icon={Palette} label={t('nav.mail') === 'Thư' ? 'Giao diện' : 'Theme'}
        onClick={openSettings} />
      <ToolbarButton icon={LayoutGrid} label={t('nav.mail') === 'Thư' ? 'Hiển thị' : 'View'} />

      <Separator />

      <ToolbarButton icon={Shield} label="PGP Keys" onClick={openKeyManager} />

      <div className="flex-1" />

      <div className="relative w-56">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('mail.search')}
          className="w-full rounded-md border border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-800 py-1 pl-8 pr-7 text-xs text-gray-900 dark:text-gray-100 outline-none focus:border-primary-300 focus:ring-1 focus:ring-primary-200 dark:focus:ring-primary-900/30"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X size={12} />
          </button>
        )}
      </div>
    </div>
  );
}

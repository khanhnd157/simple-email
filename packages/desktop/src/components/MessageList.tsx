import { useRef, useState, useMemo, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Star, Paperclip, Reply, ArrowUpDown, ArrowDown, ArrowUp, PanelLeftClose, PanelLeftOpen, MoreHorizontal, FolderInput, Copy, Tag, Flag, Archive, Trash2, Forward, Mail, Printer, Save, MessageSquare } from 'lucide-react';
import { format, isToday, isYesterday, isThisWeek } from 'date-fns';
import { cn, getInitials, getAvatarColor } from '@/lib/utils';
import { useEmailStore } from '@/stores/email-store';
import type { Message } from '@/stores/email-store';

type SortField = 'date' | 'from' | 'subject';
type SortDir = 'asc' | 'desc';

const SORT_OPTIONS: { field: SortField; label: string }[] = [
  { field: 'date', label: 'Date' },
  { field: 'from', label: 'Sender' },
  { field: 'subject', label: 'Subject' },
];

function formatMessageDate(date: Date): string {
  if (isToday(date)) return format(date, 'HH:mm');
  if (isYesterday(date)) return 'Yesterday';
  if (isThisWeek(date)) return format(date, 'EEE');
  return format(date, 'MMM d');
}

const MSG_MENU_ITEMS = [
  { key: 'open', icon: Mail, label: 'Open' },
  { key: 'reply', icon: Reply, label: 'Reply' },
  { key: 'forward', icon: Forward, label: 'Forward' },
  { key: 'divider1' },
  { key: 'moveTo', icon: FolderInput, label: 'Move To' },
  { key: 'copyTo', icon: Copy, label: 'Copy To' },
  { key: 'tag', icon: Tag, label: 'Tag' },
  { key: 'mark', icon: Flag, label: 'Mark' },
  { key: 'divider2' },
  { key: 'archive', icon: Archive, label: 'Archive' },
  { key: 'delete', icon: Trash2, label: 'Delete' },
  { key: 'divider3' },
  { key: 'saveAs', icon: Save, label: 'Save As...' },
  { key: 'print', icon: Printer, label: 'Print...' },
] as const;

function MessageContextMenu({ position, onClose }: { position: { x: number; y: number }; onClose: () => void }) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: position.y, left: position.x });

  useEffect(() => {
    const menuH = 340;
    const top = position.y + menuH > window.innerHeight ? Math.max(4, position.y - menuH) : position.y;
    const left = Math.min(position.x, window.innerWidth - 200);
    setPos({ top, left });
  }, [position]);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleOutside, true);
    return () => document.removeEventListener('mousedown', handleOutside, true);
  }, [onClose]);

  return createPortal(
    <div ref={menuRef} className="fixed z-[101] w-48 rounded-lg border border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-900 shadow-xl py-1" style={{ top: pos.top, left: pos.left }}>
        {MSG_MENU_ITEMS.map((item) =>
          item.key.startsWith('divider') ? (
            <div key={item.key} className="my-1 border-t border-gray-100 dark:border-navy-700/50" />
          ) : (
            <button key={item.key}
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              className="flex w-full items-center gap-2.5 px-3 py-1.5 text-xs text-gray-600 dark:text-navy-300 hover:bg-gray-50 dark:hover:bg-navy-800 transition-colors">
              {'icon' in item && item.icon && <item.icon size={13} className="text-gray-400 dark:text-navy-400" />}
              {'label' in item && <span>{item.label}</span>}
            </button>
          ),
        )}
      </div>,
    document.body,
  );
}

function MessageRow({ message }: { message: Message }) {
  const { selectedMessageId, selectMessage, toggleStar } = useEmailStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const isSelected = selectedMessageId === message.id;
  const senderName = message.from[0]?.name || message.from[0]?.address || 'Unknown';

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    selectMessage(message.id);
    setMenuPos({ x: e.clientX, y: e.clientY });
    setMenuOpen(true);
  }, [message.id, selectMessage]);

  return (
    <div
      onClick={() => selectMessage(message.id)}
      onContextMenu={handleContextMenu}
      className={cn(
        'group flex cursor-pointer gap-3 mx-2 my-0.5 px-3 py-2.5 rounded-lg transition-colors relative',
        isSelected
          ? 'bg-primary-100 border border-primary-300 dark:bg-primary-900/40 dark:border-primary-700/60'
          : 'border border-transparent hover:bg-gray-50 dark:hover:bg-navy-850',
        !message.isRead && !isSelected && 'bg-blue-50/40 dark:bg-blue-950/30',
      )}
    >
      <div className={cn(
        'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white',
        getAvatarColor(senderName),
      )}>
        {getInitials(senderName)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn('truncate text-sm', !message.isRead ? 'font-semibold text-gray-900 dark:text-navy-100' : 'text-gray-700 dark:text-navy-300')}>
            {senderName}
          </span>
          <div className="ml-auto flex shrink-0 items-center gap-1.5">
            {message.isAnswered && <Reply size={13} className="text-gray-400 dark:text-navy-400" />}
            {message.hasAttachments && <Paperclip size={13} className="text-gray-400 dark:text-navy-400" />}
            <span className="text-xs text-gray-400 dark:text-navy-400">{formatMessageDate(message.date)}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <p className={cn('truncate text-sm', !message.isRead ? 'font-medium text-gray-800 dark:text-navy-100' : 'text-gray-600 dark:text-navy-300')}>
            {message.subject}
          </p>
        </div>
        <p className="truncate text-xs text-gray-400 dark:text-navy-400 mt-0.5">{message.snippet}</p>
      </div>

      <div className="flex shrink-0 flex-col items-center gap-1 mt-0.5">
        <button
          onClick={(e) => { e.stopPropagation(); toggleStar(message.id); }}
          className={cn(
            'p-0.5 transition-colors',
            message.isStarred ? 'text-amber-400' : 'text-gray-300 opacity-0 group-hover:opacity-100',
          )}
        >
          <Star size={14} fill={message.isStarred ? 'currentColor' : 'none'} />
        </button>
        <div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              const rect = e.currentTarget.getBoundingClientRect();
              setMenuPos({ x: rect.right, y: rect.bottom + 4 });
              setMenuOpen(!menuOpen);
            }}
            className="rounded p-0.5 text-gray-300 opacity-0 group-hover:opacity-100 hover:text-gray-500 hover:bg-gray-100 dark:hover:text-navy-200 dark:hover:bg-navy-800 transition-all"
          >
            <MoreHorizontal size={14} />
          </button>
          {menuOpen && <MessageContextMenu position={menuPos} onClose={() => setMenuOpen(false)} />}
        </div>
      </div>
    </div>
  );
}

export function MessageList() {
  const parentRef = useRef<HTMLDivElement>(null);
  const { messages, selectedFolderId, searchQuery, folders, sidebarCollapsed, toggleSidebar } = useEmailStore();
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [sortMenuOpen, setSortMenuOpen] = useState(false);

  const filtered = useMemo(() => {
    const list = messages.filter((m) => {
      if (!selectedFolderId) return false;
      if (m.folderId !== selectedFolderId) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          m.subject.toLowerCase().includes(q) ||
          m.snippet.toLowerCase().includes(q) ||
          m.from[0]?.name.toLowerCase().includes(q) ||
          m.from[0]?.address.toLowerCase().includes(q)
        );
      }
      return true;
    });

    const sorted = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortField === 'date') cmp = a.date.getTime() - b.date.getTime();
      else if (sortField === 'from') cmp = (a.from[0]?.name || a.from[0]?.address || '').localeCompare(b.from[0]?.name || b.from[0]?.address || '');
      else if (sortField === 'subject') cmp = a.subject.localeCompare(b.subject);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return sorted;
  }, [messages, selectedFolderId, searchQuery, sortField, sortDir]);

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir(field === 'date' ? 'desc' : 'asc'); }
    setSortMenuOpen(false);
  };

  const virtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 88,
  });

  const folder = folders.find((f) => f.id === selectedFolderId);
  const DirIcon = sortDir === 'asc' ? ArrowUp : ArrowDown;
  const activeLabel = SORT_OPTIONS.find((o) => o.field === sortField)?.label;

  return (
    <div className="flex h-full flex-col border-r border-gray-200 dark:border-navy-700/50">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-navy-700/50 pl-2 pr-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <button onClick={toggleSidebar} title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="rounded p-0.5 text-gray-300 hover:bg-gray-100 hover:text-gray-500 dark:text-navy-500 dark:hover:bg-navy-800 dark:hover:text-navy-300">
            {sidebarCollapsed ? <PanelLeftOpen size={14} strokeWidth={1.2} /> : <PanelLeftClose size={14} strokeWidth={1.2} />}
          </button>
          <h2 className="text-sm font-semibold text-gray-800 dark:text-navy-100">{folder?.name ?? 'Messages'}</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 dark:text-navy-500">{filtered.length} messages</span>
          <div className="relative">
            <button
              onClick={() => setSortMenuOpen(!sortMenuOpen)}
              className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-gray-500 dark:text-navy-400 hover:bg-gray-100 dark:hover:bg-navy-800 transition-colors"
            >
              <ArrowUpDown size={12} />
              <span>{activeLabel}</span>
              <DirIcon size={10} />
            </button>
            {sortMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setSortMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-1 z-20 w-36 rounded-lg border border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-900 shadow-lg py-1">
                  {SORT_OPTIONS.map((opt) => (
                    <button key={opt.field} onClick={() => handleSort(opt.field)}
                      className={cn(
                        'flex w-full items-center justify-between px-3 py-1.5 text-xs transition-colors',
                        sortField === opt.field
                          ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                          : 'text-gray-600 dark:text-navy-300 hover:bg-gray-50 dark:hover:bg-navy-800',
                      )}>
                      <span>{opt.label}</span>
                      {sortField === opt.field && <DirIcon size={11} />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div ref={parentRef} className="flex-1 overflow-y-auto scrollbar-thin">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <p className="text-sm">No messages</p>
          </div>
        ) : (
          <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
            {virtualizer.getVirtualItems().map((vi) => (
              <div
                key={vi.key}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${vi.start}px)`,
                }}
                ref={virtualizer.measureElement}
                data-index={vi.index}
              >
                <MessageRow message={filtered[vi.index]} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Star, Paperclip, Reply } from 'lucide-react';
import { format, isToday, isYesterday, isThisWeek } from 'date-fns';
import { cn, getInitials, getAvatarColor } from '@/lib/utils';
import { useEmailStore } from '@/stores/email-store';
import type { Message } from '@/stores/email-store';

function formatMessageDate(date: Date): string {
  if (isToday(date)) return format(date, 'HH:mm');
  if (isYesterday(date)) return 'Yesterday';
  if (isThisWeek(date)) return format(date, 'EEE');
  return format(date, 'MMM d');
}

function MessageRow({ message }: { message: Message }) {
  const { selectedMessageId, selectMessage, toggleStar } = useEmailStore();
  const isSelected = selectedMessageId === message.id;
  const senderName = message.from[0]?.name || message.from[0]?.address || 'Unknown';

  return (
    <div
      onClick={() => selectMessage(message.id)}
      className={cn(
        'group flex cursor-pointer gap-3 border-b border-gray-100 dark:border-navy-700/30 px-4 py-3 transition-colors',
        isSelected ? 'bg-primary-50 border-l-2 border-l-primary-500 dark:bg-primary-900/25' : 'hover:bg-gray-50 dark:hover:bg-navy-850',
        !message.isRead && 'bg-blue-50/40 dark:bg-blue-950/30',
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

      <button
        onClick={(e) => { e.stopPropagation(); toggleStar(message.id); }}
        className={cn(
          'mt-0.5 shrink-0 p-0.5 transition-colors',
          message.isStarred ? 'text-amber-400' : 'text-gray-300 opacity-0 group-hover:opacity-100',
        )}
      >
        <Star size={14} fill={message.isStarred ? 'currentColor' : 'none'} />
      </button>
    </div>
  );
}

export function MessageList() {
  const parentRef = useRef<HTMLDivElement>(null);
  const { messages, selectedFolderId, searchQuery, folders } = useEmailStore();

  const filtered = messages.filter((m) => {
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

  const virtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 88,
  });

  const folder = folders.find((f) => f.id === selectedFolderId);

  return (
    <div className="flex h-full flex-col border-r border-gray-200 dark:border-navy-700/50">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-navy-700/50 px-4 py-2.5">
        <div>
          <h2 className="text-sm font-semibold text-gray-800 dark:text-navy-100">{folder?.name ?? 'Messages'}</h2>
          <p className="text-xs text-gray-400">{filtered.length} messages</p>
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

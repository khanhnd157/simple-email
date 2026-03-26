import {
  Paperclip, Download, Mail,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn, getInitials, getAvatarColor, formatFileSize } from '@/lib/utils';
import { useEmailStore } from '@/stores/email-store';
import { useTranslation } from 'react-i18next';
import type { Attachment } from '@/lib/mock-data';

function AttachmentChip({ attachment }: { attachment: Attachment }) {
  const ext = attachment.filename.split('.').pop()?.toUpperCase() ?? '';
  return (
    <div className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-navy-700 bg-gray-50 dark:bg-navy-850 px-3 py-2 hover:bg-gray-100 dark:hover:bg-navy-800 transition-colors cursor-pointer group">
      <Paperclip size={14} className="text-gray-400 dark:text-navy-400" />
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-gray-700 dark:text-navy-200">{attachment.filename}</p>
        <p className="text-[10px] text-gray-400 dark:text-navy-400">{ext} · {formatFileSize(attachment.size)}</p>
      </div>
      <Download size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}

export function MessageViewer() {
  const { t } = useTranslation();
  const { messages, selectedMessageId } = useEmailStore();
  const message = messages.find((m) => m.id === selectedMessageId);

  if (!message) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-gray-300 dark:text-navy-600">
        <Mail size={48} strokeWidth={1} />
        <p className="mt-3 text-sm text-gray-400 dark:text-navy-400">{t('mail.selectMessage')}</p>
      </div>
    );
  }

  const senderName = message.from[0]?.name || message.from[0]?.address || 'Unknown';
  const senderAddr = message.from[0]?.address || '';

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="px-6 pt-5 pb-3">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-navy-100 leading-tight">{message.subject}</h1>
        </div>

        <div className="flex items-start gap-3 px-6 pb-4">
          <div className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white',
            getAvatarColor(senderName),
          )}>
            {getInitials(senderName)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900 dark:text-navy-100">{senderName}</span>
              <span className="text-xs text-gray-400 dark:text-navy-400">&lt;{senderAddr}&gt;</span>
              <span className="ml-auto text-xs text-gray-400 dark:text-navy-400">
                {format(message.date, 'MMM d, yyyy \'at\' HH:mm')}
              </span>
            </div>
            <div className="mt-0.5 text-xs text-gray-400 dark:text-navy-400">
              <span>To: {message.to.map((a) => a.name || a.address).join(', ')}</span>
              {message.cc.length > 0 && (
                <span> · CC: {message.cc.map((a) => a.name || a.address).join(', ')}</span>
              )}
            </div>
          </div>
        </div>

        {message.attachments.length > 0 && (
          <div className="mx-6 mb-4 flex flex-wrap gap-2">
            {message.attachments.map((att) => (
              <AttachmentChip key={att.id} attachment={att} />
            ))}
          </div>
        )}

        <div className="border-t border-gray-100 dark:border-navy-700/30 px-6 py-5">
          <div
            className="prose prose-sm max-w-none text-gray-700 dark:text-navy-100 prose-a:text-primary-600 dark:prose-a:text-primary-400"
            dangerouslySetInnerHTML={{ __html: message.bodyHtml || message.bodyText }}
          />
        </div>

        <div className="border-t border-gray-100 dark:border-navy-700/30 px-6 py-3">
          <input
            type="text"
            placeholder={t('nav.mail') === 'Thư' ? 'Trả lời nhanh...' : 'Quick reply...'}
            className="w-full rounded-lg border border-gray-200 dark:border-navy-700 bg-gray-50 dark:bg-navy-850 px-4 py-2.5 text-sm text-gray-700 dark:text-navy-100 outline-none placeholder:text-gray-400 dark:placeholder:text-navy-500 focus:border-primary-300 focus:ring-1 focus:ring-primary-200 dark:focus:border-primary-700 dark:focus:ring-primary-900/30"
          />
        </div>
      </div>
    </div>
  );
}

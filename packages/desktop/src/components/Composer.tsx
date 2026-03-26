import { useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import {
  X, Minus, Send, Paperclip, Bold, Italic,
  List, ListOrdered, Quote, Undo, Redo, Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEmailStore } from '@/stores/email-store';

function ToolbarButton({
  icon: Icon,
  active,
  onClick,
  label,
}: {
  icon: React.ElementType;
  active?: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={cn(
        'rounded p-1.5 transition-colors',
        active
          ? 'bg-gray-200 text-gray-800 dark:bg-navy-700 dark:text-navy-100'
          : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:text-navy-400 dark:hover:bg-navy-800 dark:hover:text-navy-200',
      )}
    >
      <Icon size={15} />
    </button>
  );
}

export function Composer() {
  const { composerOpen, closeComposer, replyTo, accounts, selectedAccountId } = useEmailStore();
  const [to, setTo] = useState(replyTo ? replyTo.from[0]?.address ?? '' : '');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [subject, setSubject] = useState(replyTo ? `Re: ${replyTo.subject}` : '');
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [minimized, setMinimized] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Write your message...' }),
    ],
    content: replyTo
      ? `<br><br><blockquote><p>On ${replyTo.date.toLocaleDateString()}, ${replyTo.from[0]?.name} wrote:</p>${replyTo.bodyHtml}</blockquote>`
      : '',
  });

  const handleSend = useCallback(() => {
    if (!to.trim()) return;
    closeComposer();
  }, [to, closeComposer]);

  if (!composerOpen) return null;

  const account = accounts.find((a) => a.id === selectedAccountId);

  if (minimized) {
    return (
      <div className="fixed bottom-0 right-6 z-50 w-72 rounded-t-lg border border-gray-300 bg-gray-800 shadow-2xl dark:border-navy-700 dark:bg-navy-900">
        <div
          className="flex cursor-pointer items-center gap-2 px-4 py-2.5"
          onClick={() => setMinimized(false)}
        >
          <span className="flex-1 truncate text-sm font-medium text-white dark:text-navy-100">
            {subject || 'New Message'}
          </span>
          <button onClick={(e) => { e.stopPropagation(); closeComposer(); }} className="text-gray-400 hover:text-white dark:text-navy-400 dark:hover:text-navy-100">
            <X size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 right-6 z-50 flex w-[560px] flex-col rounded-t-xl border border-gray-300 bg-white shadow-2xl dark:border-navy-700 dark:bg-navy-900" style={{ maxHeight: '80vh' }}>
      <div className="flex items-center gap-2 rounded-t-xl bg-gray-800 px-4 py-2.5 dark:bg-navy-950">
        <span className="flex-1 text-sm font-medium text-white dark:text-navy-100">
          {replyTo ? 'Reply' : 'New Message'}
        </span>
        <button onClick={() => setMinimized(true)} className="text-gray-400 hover:text-white dark:text-navy-400 dark:hover:text-navy-100">
          <Minus size={16} />
        </button>
        <button onClick={closeComposer} className="text-gray-400 hover:text-white dark:text-navy-400 dark:hover:text-navy-100">
          <X size={16} />
        </button>
      </div>

      <div className="border-b border-gray-100 px-4 py-1.5 text-xs text-gray-400 dark:border-navy-700 dark:text-navy-400">
        From: {account?.email ?? 'unknown'}
      </div>

      <div className="space-y-0 border-b border-gray-100 dark:border-navy-700 dark:bg-navy-850">
        <div className="flex items-center border-b border-gray-50 px-4 py-1.5 dark:border-navy-700">
          <label className="w-10 shrink-0 text-xs text-gray-400 dark:text-navy-400">To</label>
          <input
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-300 dark:text-navy-100 dark:placeholder:text-navy-400"
            placeholder="recipients@email.com"
          />
          {!showCcBcc && (
            <button onClick={() => setShowCcBcc(true)} className="text-xs text-gray-400 hover:text-gray-600 dark:text-navy-400 dark:hover:text-navy-200">
              Cc/Bcc
            </button>
          )}
        </div>
        {showCcBcc && (
          <>
            <div className="flex items-center border-b border-gray-50 px-4 py-1.5 dark:border-navy-700">
              <label className="w-10 shrink-0 text-xs text-gray-400 dark:text-navy-400">Cc</label>
              <input
                value={cc}
                onChange={(e) => setCc(e.target.value)}
                className="flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-300 dark:text-navy-100 dark:placeholder:text-navy-400"
              />
            </div>
            <div className="flex items-center border-b border-gray-50 px-4 py-1.5 dark:border-navy-700">
              <label className="w-10 shrink-0 text-xs text-gray-400 dark:text-navy-400">Bcc</label>
              <input
                value={bcc}
                onChange={(e) => setBcc(e.target.value)}
                className="flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-300 dark:text-navy-100 dark:placeholder:text-navy-400"
              />
            </div>
          </>
        )}
        <div className="flex items-center px-4 py-1.5">
          <label className="w-10 shrink-0 text-xs text-gray-400 dark:text-navy-400">Sub</label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="flex-1 bg-transparent text-sm font-medium text-gray-900 outline-none placeholder:text-gray-300 dark:text-navy-100 dark:placeholder:text-navy-400"
            placeholder="Subject"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto dark:bg-navy-850" style={{ minHeight: 200 }}>
        <EditorContent editor={editor} className="text-sm text-gray-700 dark:text-navy-200" />
      </div>

      {editor && (
        <div className="flex items-center gap-0.5 border-t border-gray-100 px-3 py-1.5 dark:border-navy-700 dark:bg-navy-850">
          <ToolbarButton icon={Bold} active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} label="Bold" />
          <ToolbarButton icon={Italic} active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} label="Italic" />
          <ToolbarButton icon={List} active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} label="Bullet List" />
          <ToolbarButton icon={ListOrdered} active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} label="Ordered List" />
          <ToolbarButton icon={Quote} active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()} label="Quote" />
          <div className="mx-1 h-4 w-px bg-gray-200 dark:bg-navy-700" />
          <ToolbarButton icon={Undo} onClick={() => editor.chain().focus().undo().run()} label="Undo" />
          <ToolbarButton icon={Redo} onClick={() => editor.chain().focus().redo().run()} label="Redo" />
        </div>
      )}

      <div className="flex items-center gap-2 border-t border-gray-200 px-4 py-2.5 dark:border-navy-700 dark:bg-navy-900">
        <button
          onClick={handleSend}
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-1.5 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
        >
          <Send size={14} />
          Send
        </button>
        <button className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:text-navy-400 dark:hover:bg-navy-800 dark:hover:text-navy-200">
          <Paperclip size={16} />
        </button>
        <div className="flex-1" />
        <button onClick={closeComposer} className="rounded-md p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:text-navy-400 dark:hover:bg-red-950/40 dark:hover:text-red-400">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
